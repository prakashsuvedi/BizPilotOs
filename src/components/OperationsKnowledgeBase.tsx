import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Download, FileText, CheckSquare, Search, Printer, 
  ShieldCheck, Layers, Users, Zap, CheckCircle2, ChevronRight, 
  Sparkles, ExternalLink, HelpCircle, FileSpreadsheet, Building2 
} from 'lucide-react';

interface Props {
  tenantId?: string;
  tenantName?: string;
}

export default function OperationsKnowledgeBase({ tenantId, tenantName }: Props) {
  const [sopData, setSopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<string>('ch_1');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedSops, setCheckedSops] = useState<Record<string, boolean>>({});
  const [exportingPdf, setExportingPdf] = useState(false);
  const [customNotes, setCustomNotes] = useState('');

  const fetchSopManual = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge-base/sop');
      if (res.ok) {
        const json = await res.json();
        setSopData(json);
      }
    } catch (err) {
      console.error('Failed to load SOP Manual:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSopManual();
  }, []);

  const toggleSopCheck = (sopKey: string) => {
    setCheckedSops(prev => ({ ...prev, [sopKey]: !prev[sopKey] }));
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await fetch('/api/admin/knowledge-base/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          tenantName: tenantName || 'Enterprise Client Workspace',
          customNotes
        })
      });
      const data = await res.json();
      if (data.success && data.htmlContent) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.htmlContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
          }, 600);
        }
      }
    } catch (err) {
      console.error('Failed to export SOP PDF:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  const chapters = sopData?.chapters || [];
  const currentChapterObj = chapters.find((c: any) => c.id === selectedChapter) || chapters[0];

  const filteredChapters = chapters.filter((c: any) => 
    !searchQuery || 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sops.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Operations Knowledge Base & SOP Manual</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Live System SOP v4.2
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Structured Standard Operating Procedures, onboarding checklists, and printable training packs pulled from active OS modules.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={exportingPdf}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer shrink-0 disabled:opacity-50"
        >
          {exportingPdf ? (
            <span>Generating PDF Pack...</span>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              <span>Export Onboarding & Training Pack (PDF)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chapter Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search SOP chapters or procedures..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm space-y-1">
            <div className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              System Chapters ({filteredChapters.length})
            </div>

            {filteredChapters.map((ch: any) => {
              const isSelected = ch.id === selectedChapter;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapter(ch.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ch.number}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold leading-snug">{ch.title}</h4>
                      <p className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {ch.sops.length} Standard Operating Procedures
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          {/* PDF Customization Card */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Executive Training Pack Customization
            </h4>
            <p className="text-[11px] text-indigo-900/80">
              Add custom onboarding notes or SLA instructions before exporting the client manual.
            </p>
            <textarea
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              placeholder="e.g. Please complete SOP-101 and SOP-201 prior to your strategy kickoff call..."
              rows={3}
              className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right Chapter Content & SOP Execution Checklist */}
        <div className="lg:col-span-8 space-y-6">
          {currentChapterObj && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-sky-400">
                    Chapter {currentChapterObj.number}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{currentChapterObj.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{currentChapterObj.summary}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Scope</span>
                  <span className="text-xs font-mono font-bold text-slate-700">Enterprise Ready</span>
                </div>
              </div>

              {/* Detailed Operational Guidance */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" /> Operational Context & Platform Rules
                </h4>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2 text-xs text-slate-700">
                  {currentChapterObj.content?.map((paragraph: string, idx: number) => (
                    <p key={idx} className="leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* SOP Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" /> Standard Operating Procedure (SOP) Execution Checklist
                </h4>
                <div className="space-y-2">
                  {currentChapterObj.sops?.map((sop: string, idx: number) => {
                    const sopKey = `${currentChapterObj.id}_${idx}`;
                    const isChecked = !!checkedSops[sopKey];
                    return (
                      <div
                        key={sopKey}
                        onClick={() => toggleSopCheck(sopKey)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-bold">{sop}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isChecked ? 'VERIFIED PASSED' : 'PENDING ACTION'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
