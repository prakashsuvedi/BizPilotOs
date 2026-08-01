import React, { useState, useEffect } from 'react';
import { BusinessProfile, ContentAsset } from '../types';
import { PenTool, Sparkles, Copy, Check, ShieldAlert, Loader2, MessageSquare, Mail, Layers, FileText } from 'lucide-react';
import { clientDb } from '../lib/firebase';
import OutputEvidencePanel from './OutputEvidencePanel';

interface Props {
  profile: BusinessProfile;
  assets: ContentAsset[];
  onAddAsset: (asset: ContentAsset) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
}

export default function ContentWriter({
  profile,
  assets,
  onAddAsset,
  isGenerating,
  setIsGenerating,
}: Props) {
  const [assetType, setAssetType] = useState<'social' | 'ad' | 'email' | 'sales_pitch'>('social');
  const [tone, setTone] = useState<string>('Premium & Elegant');
  const [topic, setTopic] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [governanceRecord, setGovernanceRecord] = useState<any>(null);

  useEffect(() => {
    const loadLatestWriterGov = async () => {
      if (!profile || !profile.tenantId) return;
      try {
        const records = await clientDb.getCollection('ai_decision_records', profile.tenantId);
        const ordered = records
          .filter((idx: any) => idx.generationType === 'writer')
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (ordered.length > 0) {
          setGovernanceRecord(ordered[0]);
        }
      } catch (e) {
        console.warn("Could not retrieve copywriting decision log", e);
      }
    };
    loadLatestWriterGov();
  }, [profile, assets]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorStatus(null);
    try {
      const res = await fetch('/api/agent/writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer MOCK_ENTERPRISE_JWT_TOKEN_123' },
        body: JSON.stringify({
          profile,
          assetType,
          tone,
          campaignTopic: topic.trim() || 'New Seasonal Launch',
        }),
      });
      if (!res.ok) throw new Error('Unsuccessful copywriting generation');
      const data = await res.json();
      if (data.title) {
        onAddAsset(data);
        setTopic(''); // Reset topic field
        if (data.governanceData) {
          setGovernanceRecord(data.governanceData);
        } else {
          setTimeout(async () => {
            const list = await clientDb.getCollection('ai_decision_records', profile.tenantId || "demo-tenant");
            const filtered = list.filter((r: any) => r.generationType === 'writer')
              .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (filtered.length > 0) setGovernanceRecord(filtered[0]);
          }, 800);
        }
      } else {
        throw new Error('Incomplete data response from content writer');
      }
    } catch (err: any) {
      console.error(err);
      setErrorStatus('The Content Writer agent experienced a temporary queue interruption. Generating a premium, custom fallback block.');
      // Auto generate placeholder
      const genericFallback: ContentAsset = {
        id: 'writer-fallback-' + Math.floor(Math.random() * 100),
        type: assetType,
        title: `${profile.name} ${assetType.charAt(0).toUpperCase() + assetType.slice(1)} asset copy`,
        headline: `Engineered precisely for our audience: ${profile.targetAudience}`,
        body: `We understand that quality is not an accident. At ${profile.name}, we hold our operations to high benchmarks, delivering solutions that are both timeless and functional.\n\nDiscover how we can optimize your day-to-day operations and help you regain precious focus.\n\nCrafted with premium specifications. Timeless luxury.`,
        callToAction: 'Book Your Demo Engagement',
        channelName: tone,
        createdAt: new Date().toLocaleDateString()
      };
      onAddAsset(genericFallback);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Officer Header Card */}
      <div id="content-agent-officer" className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm text-slate-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
            <PenTool className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded border border-violet-200/65">
                CONTENT WRITER AGENT
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1 font-sans">High-Impact Campaign Copywriting</h2>
            <p className="text-slate-500 text-sm mt-0.5 font-sans">Drafting premium emails, high-CTR social ads, and authoritative sales copy.</p>
          </div>
        </div>
      </div>

      {errorStatus && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-center gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <span>{errorStatus}</span>
        </div>
      )}

      {/* Editor & Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900">
          <h4 className="text-xs uppercase tracking-wider font-mono text-slate-400 mb-4 border-b border-slate-200 pb-2 font-bold select-none">
            Writer Controls
          </h4>
          <form onSubmit={handleCreateCopy} className="space-y-4">
            {/* Asset Format Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAssetType('social')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-left flex items-center gap-2 transition duration-150 cursor-pointer ${
                    assetType === 'social'
                      ? 'bg-violet-50 border-violet-300 text-violet-700 shadow-sm'
                      : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  Social Post
                </button>
                <button
                  type="button"
                  onClick={() => setAssetType('ad')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-left flex items-center gap-2 transition duration-150 cursor-pointer ${
                    assetType === 'ad'
                      ? 'bg-violet-50 border-violet-300 text-violet-700 shadow-sm'
                      : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  Social Ad
                </button>
                <button
                  type="button"
                  onClick={() => setAssetType('email')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-left flex items-center gap-2 transition duration-150 cursor-pointer ${
                    assetType === 'email'
                      ? 'bg-violet-50 border-violet-300 text-violet-700 shadow-sm'
                      : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  Newsletter
                </button>
                <button
                  type="button"
                  onClick={() => setAssetType('sales_pitch')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-left flex items-center gap-2 transition duration-150 cursor-pointer ${
                    assetType === 'sales_pitch'
                      ? 'bg-violet-50 border-violet-300 text-violet-700 shadow-sm'
                      : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  Sales Copy
                </button>
              </div>
            </div>

            {/* Brand Voice / Tone */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:border-violet-500 transition shadow-inner"
              >
                <option value="Premium & Elegant">Premium & Elegant (Editorial, clean, quiet luxury)</option>
                <option value="Bold & Action Oriented">Bold & Action Oriented (SaaS, high hook rate, punchy)</option>
                <option value="Educative & Authoritative">Educative & Authoritative (Whitepaper, expert, academic)</option>
                <option value="Friendly & Community-Minded">Friendly & Community-Minded (Warm, storytelling, local)</option>
              </select>
            </div>

            {/* Topic Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-slate-400 block uppercase">Weekly Topic / Theme Focus</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Launching our Autumn Clay vases; Reclaim workspace efficiency..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:border-violet-500 placeholder-slate-400 transition shadow-inner"
              />
            </div>

            {/* CTA Button */}
            <button
              id="btn-trigger-writer"
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carving Perfect Sentences...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-violet-100" />
                  Generate Copy Asset
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Copy Listing Screen */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-sm font-bold text-slate-800 font-sans">Campaign Copy Blueprint Directory</h4>
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded shadow-sm">
              {assets.length} Generated Assets
            </span>
          </div>

          {assets.length === 0 ? (
            <div id="writer-empty-state" className="border border-dashed border-slate-300 bg-slate-50 rounded-2xl p-12 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-500">No sales or campaign assets mapped yet.</p>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">Configure your tone, focus theme, and format, then hit "Generate Copy Asset" to see immediate marketing copy blueprints.</p>
            </div>
          ) : (
            <div id="copy-assets-list" className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {assets.slice().reverse().map((asset, idx) => {
                const fullTextToCopy = `${asset.title}\n\n${asset.headline}\n\n${asset.body}\n\nCTA: ${asset.callToAction}`;

                return (
                  <div key={asset.id || idx} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition space-y-4 shadow-sm text-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{asset.title}</h4>
                        <span className="text-[10px] font-bold font-mono uppercase bg-violet-50 border border-violet-100 text-violet-700 px-2 py-0.5 rounded mt-1 inline-block">
                          Format: {asset.type === 'social' ? 'Social Post' : asset.type === 'ad' ? 'Social Ad' : asset.type === 'email' ? 'VIP Newsletter' : 'Corporate pitch'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(fullTextToCopy, asset.id)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition border border-slate-200 cursor-pointer shadow-sm"
                        title="Copy entire asset copy contents"
                      >
                        {copiedId === asset.id ? (
                          <Check className="w-4 h-4 text-emerald-600 font-bold" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Rendering simulated layout preview card depending on content type */}
                    {asset.type === 'social' && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 font-extrabold text-xs text-slate-700 flex items-center justify-center uppercase border border-slate-300">
                            {profile.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-slate-800 text-xs font-bold font-sans">{profile.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Sponsored Community Feed</div>
                          </div>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line font-sans font-medium">
                          {asset.body}
                        </p>
                        <div className="p-2 bg-white rounded border border-slate-200 flex justify-between items-center shadow-sm text-slate-900">
                          <span className="text-slate-700 text-[11px] font-bold font-sans pl-1">{asset.callToAction}</span>
                          <span className="bg-indigo-50 text-[10px] font-mono font-bold px-2 py-0.5 text-indigo-700 rounded border border-indigo-100">
                            Learn more
                          </span>
                        </div>
                      </div>
                    )}

                    {asset.type !== 'social' && (
                      <div className="space-y-2">
                        {asset.headline && (
                          <div className="p-3 bg-violet-50/50 border border-violet-100 rounded-lg">
                            <span className="text-[10px] font-mono font-bold text-violet-700 block uppercase">HEADLINE HOOK</span>
                            <span className="text-slate-800 text-sm font-extrabold">{asset.headline}</span>
                          </div>
                        )}
                        <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-200/80 font-sans font-medium">
                          {asset.body}
                        </p>
                        {asset.callToAction && (
                          <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                            <span className="text-slate-400 font-mono font-bold text-[10px]">CALL TO ACTION</span>
                            <span className="text-emerald-700 font-bold uppercase text-[11px]">{asset.callToAction}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Evidence & Governance Record */}
          {governanceRecord && (
            <OutputEvidencePanel record={governanceRecord} />
          )}
        </div>
      </div>
    </div>
  );
}
