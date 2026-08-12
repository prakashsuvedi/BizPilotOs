import React, { useState, useEffect } from 'react';
import { MarketingObjective, KeyResult } from '../types';
import { 
  Target, Plus, CheckCircle2, AlertTriangle, TrendingUp, 
  Clock, Award, ChevronDown, ChevronUp, Edit3, Trash2, Sparkles, RefreshCw, Layers
} from 'lucide-react';
import { clientDb } from '../lib/firebase';

interface Props {
  tenantId: string;
  tenantName: string;
}

export default function OkrTracker({ tenantId, tenantName }: Props) {
  const [objectives, setObjectives] = useState<MarketingObjective[]>([]);
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [editingKrId, setEditingKrId] = useState<string | null>(null);

  // New Objective Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Growth & Traffic' | 'Lead Generation' | 'Revenue & Sales' | 'Brand & Engagement'>('Lead Generation');
  const [newQuarter, setNewQuarter] = useState('Q3 2026');

  // Key Result draft for new Objective
  const [krTitle, setKrTitle] = useState('');
  const [krTarget, setKrTarget] = useState<number>(1000);
  const [krCurrent, setKrCurrent] = useState<number>(250);
  const [krUnit, setKrUnit] = useState('Leads');
  const [draftKrs, setDraftKrs] = useState<KeyResult[]>([]);

  useEffect(() => {
    loadOkrs();
  }, [tenantId]);

  const loadOkrs = async () => {
    try {
      const records = await clientDb.getCollection('okrs', tenantId);
      if (records && records.length > 0) {
        setObjectives(records);
      } else {
        if (tenantId === 'demo-tenant' || tenantId === 'sienna-tenant') {
          // Default initial OKRs for template showcase
          const defaultOkrs: MarketingObjective[] = [
            {
              id: 'okr-1',
              tenantId,
              title: 'Scale Organic Inbound Lead Generation Pipeline',
              category: 'Lead Generation',
              targetQuarter: 'Q3 2026',
              createdAt: new Date().toISOString(),
              keyResults: [
                { id: 'kr-101', title: 'Achieve 2,500 Qualified Marketing Leads', targetValue: 2500, currentValue: 1850, unit: 'Leads', status: 'On Track' },
                { id: 'kr-102', title: 'Reduce Cost Per Acquisition (CPA)', targetValue: 18, currentValue: 21.5, unit: 'USD', status: 'At Risk' },
                { id: 'kr-103', title: 'Publish 12 High-Intent AEO Knowledge Base Articles', targetValue: 12, currentValue: 12, unit: 'Articles', status: 'Completed' },
              ]
            },
            {
              id: 'okr-2',
              tenantId,
              title: 'Expand Cross-Channel Ad Campaign Conversions',
              category: 'Growth & Traffic',
              targetQuarter: 'Q3 2026',
              createdAt: new Date().toISOString(),
              keyResults: [
                { id: 'kr-201', title: 'Increase Monthly Active Ad Impressions to 500K', targetValue: 500000, currentValue: 380000, unit: 'Impressions', status: 'On Track' },
                { id: 'kr-202', title: 'Boost WhatsApp Direct Message Demo Bookings', targetValue: 150, currentValue: 45, unit: 'Demos', status: 'Behind' },
              ]
            }
          ];
          setObjectives(defaultOkrs);
        } else {
          setObjectives([]);
        }
      }
    } catch (e) {
      console.warn("Could not load OKRs from database:", e);
    }
  };

  const calculateKrStatus = (current: number, target: number): 'On Track' | 'At Risk' | 'Behind' | 'Completed' => {
    if (target <= 0) return 'On Track';
    const percent = (current / target) * 100;
    if (percent >= 100) return 'Completed';
    if (percent >= 70) return 'On Track';
    if (percent >= 40) return 'At Risk';
    return 'Behind';
  };

  const handleAddDraftKr = () => {
    if (!krTitle.trim()) return;
    const newKr: KeyResult = {
      id: `kr-${Date.now()}`,
      title: krTitle.trim(),
      targetValue: krTarget,
      currentValue: krCurrent,
      unit: krUnit,
      status: calculateKrStatus(krCurrent, krTarget),
      lastUpdated: new Date().toISOString()
    };
    setDraftKrs([...draftKrs, newKr]);
    setKrTitle('');
    setKrTarget(1000);
    setKrCurrent(0);
  };

  const handleCreateObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newObj: MarketingObjective = {
      id: `okr-${Date.now()}`,
      tenantId,
      title: newTitle.trim(),
      category: newCategory,
      targetQuarter: newQuarter,
      createdAt: new Date().toISOString(),
      keyResults: draftKrs.length > 0 ? draftKrs : [
        {
          id: `kr-${Date.now()}-1`,
          title: `Initial Benchmark for ${newTitle.trim()}`,
          targetValue: 100,
          currentValue: 25,
          unit: 'Units',
          status: 'At Risk',
          lastUpdated: new Date().toISOString()
        }
      ]
    };

    const updated = [newObj, ...objectives];
    setObjectives(updated);
    setNewTitle('');
    setDraftKrs([]);
    setIsAddingObjective(false);

    try {
      await clientDb.addDocToTenant('okrs', newObj, tenantId);
    } catch (err) {
      console.warn("Failed to persist OKR:", err);
    }
  };

  const handleUpdateKrProgress = async (objectiveId: string, krId: string, delta: number) => {
    const updated = objectives.map(obj => {
      if (obj.id !== objectiveId) return obj;
      const updatedKrs = obj.keyResults.map(kr => {
        if (kr.id !== krId) return kr;
        const nextVal = Math.max(0, kr.currentValue + delta);
        return {
          ...kr,
          currentValue: nextVal,
          status: calculateKrStatus(nextVal, kr.targetValue),
          lastUpdated: new Date().toISOString()
        };
      });
      return { ...obj, keyResults: updatedKrs };
    });

    setObjectives(updated);
    const targetObj = updated.find(o => o.id === objectiveId);
    if (targetObj) {
      try {
        await clientDb.addDocToTenant('okrs', targetObj, tenantId);
      } catch (err) {
        console.warn("Error updating OKR progress:", err);
      }
    }
  };

  const calculateObjectiveProgress = (obj: MarketingObjective) => {
    if (!obj.keyResults || obj.keyResults.length === 0) return 0;
    const totalPercent = obj.keyResults.reduce((acc, kr) => {
      const p = Math.min(100, Math.round((kr.currentValue / (kr.targetValue || 1)) * 100));
      return acc + p;
    }, 0);
    return Math.round(totalPercent / obj.keyResults.length);
  };

  const getStatusBadge = (status: 'On Track' | 'At Risk' | 'Behind' | 'Completed') => {
    switch (status) {
      case 'Completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Completed</span>;
      case 'On Track':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">● On Track</span>;
      case 'At Risk':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">▲ At Risk</span>;
      case 'Behind':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">✕ Behind</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Objectives & Key Results (OKR) Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Define strategic marketing goals, track quarterly milestone targets, and monitor real-time conversion indicators.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingObjective(!isAddingObjective)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Define New Marketing OKR</span>
        </button>
      </div>

      {/* Add New Objective Form */}
      {isAddingObjective && (
        <form onSubmit={handleCreateObjective} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-fade-in">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Formulate New Objective Statement
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Objective Statement</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Expand High-Intent Inbound Organic Lead Volume"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Category Pillar</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="Growth & Traffic">Growth & Traffic</option>
                <option value="Lead Generation">Lead Generation</option>
                <option value="Revenue & Sales">Revenue & Sales</option>
                <option value="Brand & Engagement">Brand & Engagement</option>
              </select>
            </div>
          </div>

          {/* Key Results draft form */}
          <div className="border-t border-slate-200 pt-3 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Add Key Results to Objective</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={krTitle}
                onChange={(e) => setKrTitle(e.target.value)}
                placeholder="Key Result title..."
                className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
              />
              <input
                type="number"
                value={krTarget}
                onChange={(e) => setKrTarget(parseFloat(e.target.value) || 0)}
                placeholder="Target value"
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleAddDraftKr}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                + Add KR
              </button>
            </div>

            {draftKrs.length > 0 && (
              <div className="space-y-1">
                {draftKrs.map((dkr, idx) => (
                  <div key={idx} className="text-xs bg-white p-2 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="font-medium text-slate-800">{dkr.title}</span>
                    <span className="font-mono text-emerald-600 font-bold">Target: {dkr.targetValue} {dkr.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingObjective(false)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Save Objective & Key Results
            </button>
          </div>
        </form>
      )}

      {/* Objectives Cards List */}
      <div className="space-y-4">
        {objectives.map((obj) => {
          const avgProgress = calculateObjectiveProgress(obj);
          return (
            <div key={obj.id} className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition bg-slate-50/50 space-y-4">
              {/* Objective Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/80 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {obj.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {obj.targetQuarter}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">{obj.title}</h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Avg Completion</span>
                    <span className="text-base font-extrabold font-mono text-slate-900">{avgProgress}%</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-slate-200 p-1 flex items-center justify-center">
                    <div 
                      className="w-full h-full rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                      style={{ opacity: Math.max(0.4, avgProgress / 100) }}
                    >
                      {avgProgress}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Results Progress Bars */}
              <div className="space-y-3">
                {obj.keyResults.map((kr) => {
                  const percent = Math.min(100, Math.round((kr.currentValue / (kr.targetValue || 1)) * 100));
                  return (
                    <div key={kr.id} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-xs">
                        <span className="font-bold text-slate-800">{kr.title}</span>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(kr.status)}
                          <span className="font-mono font-bold text-slate-700">
                            {kr.currentValue.toLocaleString()} / {kr.targetValue.toLocaleString()} {kr.unit}
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                          <div
                            className={`h-full transition-all duration-500 ${
                              kr.status === 'Completed' || kr.status === 'On Track'
                                ? 'bg-emerald-500'
                                : kr.status === 'At Risk'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-500 w-10 text-right">
                          {percent}%
                        </span>

                        {/* Fast Adjust Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleUpdateKrProgress(obj.id, kr.id, -10)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-mono text-xs font-bold flex items-center justify-center cursor-pointer text-slate-700"
                            title="Decrease current value by 10"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleUpdateKrProgress(obj.id, kr.id, 10)}
                            className="w-6 h-6 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold flex items-center justify-center cursor-pointer"
                            title="Increase current value by 10"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
