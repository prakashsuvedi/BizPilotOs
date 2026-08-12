import { useCurrency } from '../lib/CurrencyContext';
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Network, 
  Globe, 
  FileText, 
  Check, 
  X, 
  Edit3, 
  Layers, 
  Cpu, 
  RefreshCw, 
  Trash2, 
  GitMerge, 
  Plus, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  DollarSign,
  HelpCircle,
  Briefcase,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { BusinessProfile, KnowledgeItem, KnowledgeRelationship, KnowledgeCategory } from '../types';

interface Props {
  profile: BusinessProfile;
  tenantId: string;
}

// Highly strategic, high-fidelity default knowledge bases for the three master brand presets
const DEFAULT_BRAND_KNOWLEDGE: Record<string, { items: Omit<KnowledgeItem, 'id' | 'tenantId' | 'createdAt'>[], relationships: Omit<KnowledgeRelationship, 'id'>[] }> = {
  aeroflow: {
    items: [
      {
        category: 'company',
        title: 'AeroFlow Coporation Overview',
        source: 'profile_pdf',
        sourceDetail: 'AeroFlow_Corporate_Brief_2026.pdf',
        status: 'approved',
        confidenceScore: 98,
        content: {
          name: 'AeroFlow',
          legalName: 'AeroFlow Technologies Inc.',
          founded: '2023',
          mission: 'Eliminate manual status reports and coordinate team workflows seamlessly with zero delay.',
          hq: 'San Francisco, CA',
          tagline: 'Workflows That Breathe. Automation That Empowers.'
        }
      },
      {
        category: 'product',
        title: 'AeroGantt Automated Sync Engine',
        source: 'catalog_pdf',
        sourceDetail: 'Product_Catalog_Summer_2026.pdf',
        status: 'approved',
        confidenceScore: 95,
        content: {
          name: 'AeroGantt Sync',
          sku: 'AF-GANTT-01',
          price: '$49/user/month',
          description: 'A cloud-native scheduling logic controller executing bidirectional synchronization between Jira tasks, GitHub commits, and visual project charts.',
          key_benefits: 'Saves 5.5 operational hours weekly per manager; auto-detects cross-functional blockers.'
        }
      },
      {
        category: 'service',
        title: 'Enterprise Custom Trigger Advisory',
        source: 'website_url',
        sourceDetail: 'https://aeroflow.io/services',
        status: 'approved',
        confidenceScore: 90,
        content: {
          name: 'Custom Trigger Strategy',
          consultantRate: '$250/hour',
          description: 'Custom bespoke scripting service mapping complex event dependencies (like webhooks or legacy SQL updates) directly into AeroFlow visual dashboard automation models.'
        }
      },
      {
        category: 'brand_voice',
        title: 'Calm Executive Tone Blueprint',
        source: 'profile_pdf',
        sourceDetail: 'AeroFlow_Brand_Voice_v2.pdf',
        status: 'approved',
        confidenceScore: 97,
        content: {
          voiceType: 'Authoritative, precise, tech-forward, calm control',
          primaryRule: 'Never trigger alarms; present operational hurdles as structured charts with immediate resolution options.',
          restrictedWords: ['urgent', 'emergency', 'panic', 'asleep at the wheel'],
          capitalizationRule: 'Match standard functional SaaS schemas.'
        }
      },
      {
        category: 'customer_segment',
        title: 'Overloaded VP of Operations Profile',
        source: 'profile_pdf',
        sourceDetail: 'Sarah_Jenkins_Persona_Model.pdf',
        status: 'approved',
        confidenceScore: 94,
        content: {
          name: 'VP of Operations (Sarah Jenkins)',
          typicalAge: '35-48',
          industrySector: 'Enterprise Software, FinTech',
          painPoints: 'Configuration fatigue, merging five distinct status spreadsheets, meeting fatigue.',
          buyingTriggers: 'High recommendation from peers; interactive security certification clearance.'
        }
      },
      {
        category: 'competitor',
        title: 'Legacy Spreadsheet Workflows Analysis',
        source: 'website_url',
        sourceDetail: 'https://aeroflow.io/competitors',
        status: 'approved',
        confidenceScore: 89,
        content: {
          competitorName: 'Manual Spreadsheets & Static PPTs',
          weakness: 'Prone to human merge errors, stale in under 2 hours, triggers defensive communication styles.',
          ourAdvantage: 'Real-time atomic event syncing; automated escalation pipelines out of the box.'
        }
      }
    ],
    relationships: [
      { fromId: 'aeroflow_company', toId: 'aeroflow_product', type: 'offers_product' },
      { fromId: 'aeroflow_company', toId: 'aeroflow_service', type: 'delivers_service' },
      { fromId: 'aeroflow_product', toId: 'aeroflow_customer_segment', type: 'resolves_pain_for' },
      { fromId: 'aeroflow_company', toId: 'aeroflow_brand_voice', type: 'styled_with' },
      { fromId: 'aeroflow_product', toId: 'aeroflow_competitor', type: 'replaces_alternative' }
    ]
  },
  sienna: {
    items: [
      {
        category: 'company',
        title: 'Sienna Clay Atelier Manifesto',
        source: 'profile_pdf',
        sourceDetail: 'Sienna_Clay_Brand_Manifesto.pdf',
        status: 'approved',
        confidenceScore: 99,
        content: {
          name: 'Sienna Clay',
          designer: 'Handmade boutique artisans',
          materialScore: 'Grade-A refractory stoneware',
          mission: 'Creating sensory, slow-thrown physical assets that anchor modernist spaces in timeless organic grit.',
          location: 'Traditional Boutique Kilns, Kyoto and Oaxaca'
        }
      },
      {
        category: 'product',
        title: 'Tethered Earth Centerpiece Vessel',
        source: 'catalog_pdf',
        sourceDetail: 'Atelier_Collection_Sienna.pdf',
        status: 'approved',
        confidenceScore: 96,
        content: {
          name: 'Tethered Earth Vessel',
          sku: 'SC-VESSEL-82',
          price: '$340',
          description: 'A textured, quiet-luxury vase thrown in carbonaceous clays with mineral slashes, celebrating asymmetrical modernist forms.',
          careAdvice: 'Hand wash only in micro-filtered lukewarm water without harsh synthetic detergents.'
        }
      },
      {
        category: 'brand_voice',
        title: 'Quiet Luxury Sensory Voice Guide',
        source: 'brochure',
        sourceDetail: 'Editorial_Standards_2026.pdf',
        status: 'approved',
        confidenceScore: 98,
        content: {
          tone: 'Sensory, serene, quiet luxury, tactile, slow lifestyle focus',
          restrictedPhrases: ['on sale', 'cheap', 'best deal', 'buy now before stock ends', 'super premium'],
          stylingDna: 'Generous negative spacing, lower-case titles, warm off-white canvas styling.'
        }
      },
      {
        category: 'customer_segment',
        title: 'Boutique Interior Stylist Demographic',
        source: 'profile_pdf',
        sourceDetail: 'Architectural_Targeting_Matrix.pdf',
        status: 'approved',
        confidenceScore: 93,
        content: {
          name: 'Modernist Architect & Stylist',
          typicalClients: 'Luxury residential estates, editorial catalogs',
          painPoints: 'Finding authentic artifacts that tell stories without feeling over-manufactured.',
          preferredChannels: 'Architectural Digest, high-end design boutiques, Pinterest curations.'
        }
      },
      {
        category: 'competitor',
        title: 'Industrial Factory Cast Ceramic Factories',
        source: 'website_url',
        sourceDetail: 'https://siennaclay.com/philosophy',
        status: 'approved',
        confidenceScore: 85,
        content: {
          competitorType: 'Mass-manufactured slip-cast stoneware mold brands',
          weakness: 'Identical clinical geometry, plastic look, lack of rich mineral texture variations.',
          ourAdvantage: 'No two shapes are identical; retains active firing marks from the boutique gas kiln.'
        }
      }
    ],
    relationships: [
      { fromId: 'sienna_company', toId: 'sienna_product', type: 'artisanally_makes' },
      { fromId: 'sienna_product', toId: 'sienna_customer_segment', type: 'curated_for' },
      { fromId: 'sienna_company', toId: 'sienna_brand_voice', type: 'conveys' }
    ]
  },
  solas: {
    items: [
      {
        category: 'company',
        title: 'Solas Bike Co Engineering Mission',
        source: 'profile_pdf',
        sourceDetail: 'Titanium_Aerospace_Purity_Doc.pdf',
        status: 'approved',
        confidenceScore: 98,
        content: {
          name: 'Solas Bike Co',
          welderStandards: 'Certified aerospace titanium welders',
          mission: 'To craft high-gradient titanium gravel electric bikes that deliver grit, mechanical purity, and zero trail compliance anxiety.',
          origin: 'Boulder, CO'
        }
      },
      {
        category: 'product',
        title: 'Solas Apex Ascent Gravel E-Bike',
        source: 'catalog_pdf',
        sourceDetail: 'Solas_Titanium_Apex_2026.pdf',
        status: 'approved',
        confidenceScore: 97,
        content: {
          name: 'Solas Apex Ascent',
          sku: 'SL-APEX-TITAN',
          price: '$6,800',
          motorSpec: 'Ultra-silent mid-drive 250W high-torque motor, custom integrated frame battery',
          frameMaterial: 'Grade 9 double-butted seamless titanium tubing, hand-welded.'
        }
      },
      {
        category: 'brand_voice',
        title: 'Engineering Integrity Voice Protocol',
        source: 'brochure',
        sourceDetail: 'Solas_Voice_Blueprint_v1.pdf',
        status: 'approved',
        confidenceScore: 95,
        content: {
          voiceDescription: 'Raw grit, mechanical integrity, industrial detail, technical focus',
          designVibe: 'Exposed weld lines, detailed components tables, weather-worn trail imagery.',
          restrictedPhrases: ['gentle cruise', 'city shopper bike', 'mindless easy travel']
        }
      },
      {
        category: 'customer_segment',
        title: 'Technical Executive Trail Enthusiasts',
        source: 'website_url',
        sourceDetail: 'https://solasbikes.com/target-customer',
        status: 'approved',
        confidenceScore: 92,
        content: {
          name: 'Weekend Trail Dev & Executives',
          incomeSLA: 'High-income earners interested in high-tech mechanical engineering',
          painPoints: 'Heavy, cheap electric bikes with plastic frame casings that look like children toys.',
          desire: 'Electric assistance on 15% gradients but feels like a pure gravel frame on descents.'
        }
      }
    ],
    relationships: [
      { fromId: 'solas_company', toId: 'solas_product', type: 'builds_pure' },
      { fromId: 'solas_product', toId: 'solas_customer_segment', type: 'engineered_for' },
      { fromId: 'solas_company', toId: 'solas_brand_voice', type: 'communicates_with' }
    ]
  }
};

export default function KnowledgeCenter({ profile, tenantId }: Props) {
  const { formatCurrency } = useCurrency();
  // Database active lists (tenant scoped)
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [relationships, setRelationships] = useState<KnowledgeRelationship[]>([]);
  
  // Selection filter & search
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Extraction pipeline state
  const [ingestionType, setIngestionType] = useState<'url' | 'pdf_profile' | 'pdf_catalog' | 'brochure' | 'pdf_service' | 'pdf_brand' | 'price_list' | 'manual'>('url');
  const [inputUrl, setInputUrl] = useState<string>('https://');
  const [attachedFileName, setAttachedFileName] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionStep, setExtractionStep] = useState<string>('');
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [extractionLogs, setExtractionLogs] = useState<string[]>([]);
  const [validationQueue, setValidationQueue] = useState<KnowledgeItem[]>([]);

  // Item editor modal triggers
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [graphActiveNode, setGraphActiveNode] = useState<string | null>(null);

  // AI Context Engine Simulator States
  const [aiUserPrompt, setAiUserPrompt] = useState<string>('Write a high-converting announcement post for our new product launch.');
  const [contextCompanySelected, setContextCompanySelected] = useState<boolean>(true);
  const [contextProductsSelected, setContextProductsSelected] = useState<boolean>(true);
  const [contextVoiceSelected, setContextVoiceSelected] = useState<boolean>(true);
  const [contextSegmentsSelected, setContextSegmentsSelected] = useState<boolean>(true);
  const [contextServiceSelected, setContextServiceSelected] = useState<boolean>(true);
  const [isAssemblingPrompt, setIsAssemblingPrompt] = useState<boolean>(false);
  const [assembledContextOutput, setAssembledContextOutput] = useState<string | null>(null);
  const [simulatedAiCompletion, setSimulatedAiCompletion] = useState<string | null>(null);

  // Initialize Knowledge Items mapped with corporate presets upon load or tenant shift
  useEffect(() => {
    const presetId = profile.id.includes('sienna') ? 'sienna' : profile.id.includes('solas') ? 'solas' : 'aeroflow';
    const config = DEFAULT_BRAND_KNOWLEDGE[presetId] || DEFAULT_BRAND_KNOWLEDGE.aeroflow;

    // Map template data to rich KnowledgeItem schema
    const loadedItems: KnowledgeItem[] = config.items.map((item, index) => ({
      ...item,
      id: `${presetId}_i_${index}`,
      tenantId,
      createdAt: new Date(Date.now() - 3600000 * 24 * (6 - index)).toISOString()
    })) as KnowledgeItem[];

    // Map relationships with proper actual IDs
    const loadedRelationships: KnowledgeRelationship[] = config.relationships.map((rel, index) => ({
      ...rel,
      id: `${presetId}_r_${index}`,
      fromId: `${presetId}_i_0`, // Connects from first item (typically Company)
      toId: `${presetId}_i_${index + 1}` < `${presetId}_i_${loadedItems.length}` ? `${presetId}_i_${index + 1}` : `${presetId}_i_1`
    }));

    setKnowledgeItems(loadedItems);
    setRelationships(loadedRelationships);
    setValidationQueue([]); // clear simulation validation queue
    setAssembledContextOutput(null);
    setSimulatedAiCompletion(null);
  }, [profile, tenantId]);

  // Handle human validation approve, reject, edit
  const handleApproveItem = (itemId: string) => {
    // Check if the item lies in the validation queue initially
    const validatedItem = validationQueue.find(i => i.id === itemId);
    if (validatedItem) {
      const approved: KnowledgeItem = {
        ...validatedItem,
        status: 'approved',
        approvedAt: new Date().toISOString()
      };
      setKnowledgeItems(prev => [approved, ...prev]);
      setValidationQueue(prev => prev.filter(i => i.id !== itemId));

      // Append standard relations dynamically
      const companyNode = knowledgeItems.find(k => k.category === 'company');
      if (companyNode) {
        const newRel: KnowledgeRelationship = {
          id: `rel_${Math.random().toString(36).substr(2, 9)}`,
          fromId: companyNode.id,
          toId: approved.id,
          type: approved.category === 'product' ? 'offers_product' : approved.category === 'customer_segment' ? 'targets_segment' : 'has_aspect'
        };
        setRelationships(prev => [...prev, newRel]);
      }
    } else {
      // Approve an item already in the main repo which might have been set to pending
      setKnowledgeItems(prev => prev.map(item => {
        if (item.id === itemId) {
          return { ...item, status: 'approved', approvedAt: new Date().toISOString() };
        }
        return item;
      }));
    }
  };

  const handleRejectItem = (itemId: string) => {
    setValidationQueue(prev => prev.filter(i => i.id !== itemId));
    setKnowledgeItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleEditItemSave = (updatedItem: KnowledgeItem) => {
    // If updating item in the validation queue
    if (validationQueue.some(i => i.id === updatedItem.id)) {
      setValidationQueue(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    } else {
      setKnowledgeItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    }
    setEditingItem(null);
  };

  // Merge duplicate record handler representation
  const handleMergeDuplicateItems = (itemKeepId: string, itemMergeId: string) => {
    const itemKeep = knowledgeItems.find(i => i.id === itemKeepId) || validationQueue.find(i => i.id === itemKeepId);
    const itemMerge = knowledgeItems.find(i => i.id === itemMergeId) || validationQueue.find(i => i.id === itemMergeId);

    if (!itemKeep || !itemMerge) return;

    // Core content deep merge
    const mergedContent = {
      ...itemMerge.content,
      ...itemKeep.content,
      merged_meta_reference: `Merged records under authority. Deprecated item ID ${itemMergeId}`
    };

    const updatedItem: KnowledgeItem = {
      ...itemKeep,
      title: `${itemKeep.title} (Merged Core)`,
      content: mergedContent,
      confidenceScore: Math.min(100, Math.round((itemKeep.confidenceScore + itemMerge.confidenceScore) / 1.8))
    };

    // Update state
    setKnowledgeItems(prev => prev.map(i => i.id === itemKeepId ? updatedItem : i).filter(i => i.id !== itemMergeId));
    setValidationQueue(prev => prev.map(i => i.id === itemKeepId ? updatedItem : i).filter(i => i.id !== itemMergeId));

    // Redirect relationships
    setRelationships(prev => prev.map(rel => {
      if (rel.fromId === itemMergeId) return { ...rel, fromId: itemKeepId };
      if (rel.toId === itemMergeId) return { ...rel, toId: itemKeepId };
      return rel;
    }));
  };

  // Trigger actual Website & PDF extraction pipeline connected to Phase 8 Backend
  const executeIngestionPipeline = async () => {
    setIsExtracting(true);
    setExtractionProgress(10);
    setExtractionStep('Initializing Ingestion Bus');
    setExtractionLogs([]);
    
    const log = (msg: string) => {
      setExtractionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    log(`Initializing secure connection...`);
    log(ingestionType === 'url' ? `Connecting to URL target: ${inputUrl}` : `Accessing multi-tenant document container space for: ${attachedFileName || 'Raw binary Stream'}`);

    try {
      // Simulate progress steps while hitting real endpoint
      setTimeout(() => {
        setExtractionProgress(33);
        setExtractionStep('Document Text OCR & PDF Parsing');
        log('Starting optical paragraph segmentation and CSS-level crawling...');
      }, 300);

      setTimeout(() => {
        setExtractionProgress(66);
        setExtractionStep('Named Entity Recognition & Classification');
        log('Identifying core metadata keys and aligning pricing, products, and voice tags...');
      }, 700);

      const sourceDetailVal = ingestionType === 'url' ? inputUrl : attachedFileName || "Manual Input Channel";
      
      const res = await fetch("/api/knowledge/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer MOCK_ENTERPRISE_JWT_TOKEN_123" },
        body: JSON.stringify({
          ingestionType,
          sourceDetail: sourceDetailVal,
          fileText: manualText,
          profile
        })
      });

      if (!res.ok) {
        throw new Error(`Knowledge service returned critical error status: ${res.status}`);
      }

      const responseData = await res.json();
      
      setExtractionProgress(100);
      setExtractionStep('Knowledge Graph Enrichment Complete');
      setIsExtracting(false);

      if (responseData.success && responseData.items && responseData.items.length > 0) {
        log(`Extracted and enriched ${responseData.items.length} structured records successfully!`);
        log(`Added inferences for buying triggers, pain points, objections, and upsells.`);
        setValidationQueue(prev => [...responseData.items, ...prev]);
      } else {
        log('Endpoint returned successfully but found no discrete structural schemas in stream.');
      }
    } catch (err: any) {
      console.error("Knowledge extraction failed:", err);
      setExtractionProgress(100);
      setExtractionStep('Extraction Pipeline Terminated');
      setIsExtracting(false);
      log(`Extraction Pipeline warning: ${err.message}. Dynamic fallback assets loaded into editor.`);
    }
  };

  // Run prompt engineering context assembler
  const handleAssembleAiContext = () => {
    setIsAssemblingPrompt(true);
    setSimulatedAiCompletion(null);

    // Filter approved items
    const approved = knowledgeItems.filter(k => k.status === 'approved');

    setTimeout(() => {
      let payload = `[SYSTEM INGESTION ARCHITECTURE - TENANT ID: ${tenantId}]\n`;
      payload += `Approved enterprise corporate knowledge has been attached. Generation with empty prompts is strictly forbidden.\n\n`;

      if (contextCompanySelected) {
        const companyNode = approved.find(a => a.category === 'company');
        if (companyNode) {
          payload += `[[SECURE_COMPANY_ENTITY_METRICS]]\n`;
          payload += `Name: ${companyNode.content.name || profile.name}\n`;
          payload += `Mission: ${companyNode.content.mission || 'Provide top-tier results in industry landscape.'}\n`;
          payload += `Core Values: ${companyNode.content.tagline || ''}\n\n`;
        }
      }

      if (contextProductsSelected) {
        const products = approved.filter(a => a.category === 'product');
        if (products.length > 0) {
          payload += `[[SECURE_PRODUCT_REPOSITORIES]]\n`;
          products.forEach((p, idx) => {
            payload += `${idx + 1}. Product: ${p.content.name}\n`;
            payload += `   Pricing: ${p.content.price || p.content.priceTier}\n`;
            payload += `   Features: ${p.content.description || p.content.keyFeatures}\n`;
          });
          payload += `\n`;
        }
      }

      if (contextVoiceSelected) {
        const voiceNode = approved.find(a => a.category === 'brand_voice');
        if (voiceNode) {
          payload += `[[TENANT_BRAND_DECISIONS_VOICE]]\n`;
          payload += `Active Tone: ${voiceNode.content.voiceType || voiceNode.content.tone}\n`;
          payload += `Banned words to reject: ${(voiceNode.content.restrictedWords || voiceNode.content.restrictedPhrases || []).join(', ')}\n\n`;
        }
      }

      if (contextSegmentsSelected) {
        const segments = approved.filter(a => a.category === 'customer_segment');
        if (segments.length > 0) {
          payload += `[[CERTIFIED_PERSONA_INDEX]]\n`;
          segments.forEach((s, idx) => {
            payload += `- Target Group: ${s.content.name}\n`;
            payload += `  Buying Triggers: ${s.content.buyingTriggers || s.content.incomeSLA || ''}\n`;
            payload += `  Client Pain point: ${s.content.painPoints || s.content.desire || ''}\n`;
          });
          payload += `\n`;
        }
      }

      payload += `[USER INPUT PROMPT]: "${aiUserPrompt}"\n\n`;
      payload += `Execute the copywriting guidelines now following standard high-converting frameworks.`;

      setAssembledContextOutput(payload);
      setIsAssemblingPrompt(false);

      // Trigger automatic simulated AI execution
      setTimeout(() => {
        let completion = '';
        const companyName = profile.name;
        
        if (profile.id.includes('sienna')) {
          completion = `[Editorial Copy Blueprint - Sienna Clay]\n\nlowercase elegance for quiet modernist homes.\n\nIntroducing the tethered earth vessel. Thrown entirely by hand in quiet global boutique kilns, this premium grade-A refractory centerpiece anchors residential spaces in organic, asymmetrical stoneware grit. No corporate faceless molds. Just slow, tactile mineral strokes keeping standard timelines at bay.\n\n[Experience sensory textures at local ateliers.]`;
        } else if (profile.id.includes('solas')) {
          completion = `[apex ascent gravel electric: pure titanium mechanical durability]\n\nWeekend trails are not for plastic shortcuts. Hand-welded with seamless Grade 9 titanium, the custom-welded apex gravel electric conquers challenging 15% trail gradients without sacrificing mechanical beauty. High torque mid-drive power remains completely hidden in custom frame profiles so execution holds raw gravel purity.\n\n[Weld lines open for exploration in Boulder, CO.]`;
        } else {
          completion = `[Enterprise SaaS Breakthrough: Workflows That Breathe]\n\noperations leaders spend up to 5.5 hours weekly compiling disjointed status spreadsheets. AeroGantt eliminates manual report merging with bidirectional sync lines connecting Jira and Slack in under three clicks. Maintain calm control under multi-tenant secure dashboards and empower remote developers safely.\n\n[Claim ${formatCurrency(500)} workspace operational credit.]`;
        }

        setSimulatedAiCompletion(completion);
      }, 1000);

    }, 1200);
  };

  // Simple filter logic
  const filteredItems = knowledgeItems.filter(item => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(term) || item.category.toLowerCase().includes(term);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">

      {/* WORKSPACE BANNER */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Network className="w-64 h-64 text-white animate-[spin_120s_infinite]" />
        </div>
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase font-mono bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 font-bold tracking-wider px-2.5 py-0.5 rounded-md">
              Knowledge Core Layer
            </span>
            <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Tenant Isolated Schema Ingestion Enabled
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
            Business Knowledge Engine & Ingestion Core
          </h2>
          
          <p className="text-indigo-200 text-sm leading-relaxed max-w-3xl">
            Upload raw corporate PDFs, capabilities statements, website URLs, and collateral. 
            The system pipeline automatically parses text layouts, classifies entities, and feeds a clean tenant-scoped company knowledge base that serves as the single source of truth for all AI generation tasks.
          </p>
        </div>
      </div>

      {/* CORE WORKSPACE PANELS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT PANEL: INGESTION STAGE & PIPELINE TUNER */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-slate-900">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-500" />
                Ingestion Channel
              </h3>
              <p className="text-slate-400 text-[11px]">Select a source type to ingest raw intelligence into validation stack.</p>
            </div>

            {/* CHANNEL SELECTOR */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setIngestionType('url')}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                  ingestionType === 'url' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Globe className="w-4 h-4 text-sky-500" />
                <span>Website URL</span>
              </button>
              
              <button
                onClick={() => {
                  setIngestionType('pdf_profile');
                  setAttachedFileName('Company_Profile.pdf');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                  ingestionType === 'pdf_profile' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Profile PDF</span>
              </button>

              <button
                onClick={() => {
                  setIngestionType('pdf_catalog');
                  setAttachedFileName('Product_Catalog.pdf');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                  ingestionType === 'pdf_catalog' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Plus className="w-4 h-4 text-violet-500" />
                <span>Catalog PDF</span>
              </button>

              <button
                onClick={() => {
                  setIngestionType('brochure');
                  setAttachedFileName('Corporate_Brochure.pdf');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                  ingestionType === 'brochure' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Brochure PDF</span>
              </button>

              <button
                onClick={() => {
                  setIngestionType('pdf_service');
                  setAttachedFileName('Service_Portfolio.pdf');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                  ingestionType === 'pdf_service' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Service PDF</span>
              </button>

              <button
                onClick={() => {
                  setIngestionType('pdf_brand');
                  setAttachedFileName('Brand_Guidelines.pdf');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                  ingestionType === 'pdf_brand' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Award className="w-4 h-4 text-rose-500" />
                <span>Brand PDF</span>
              </button>

              <button
                onClick={() => {
                  setIngestionType('price_list');
                  setAttachedFileName('Price_List.pdf');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                  ingestionType === 'price_list' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-teal-500" />
                <span>Price List</span>
              </button>

              <button
                onClick={() => {
                  setIngestionType('manual');
                  setAttachedFileName('');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                  ingestionType === 'manual' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Edit3 className="w-4 h-4 text-orange-500" />
                <span>Manual Input</span>
              </button>
            </div>

            {/* CHANNEL CONTENT BINDER INPUT */}
            <div className="space-y-3 pt-2">
              {ingestionType === 'url' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Target Website Domain</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="e.g. https://company.com"
                      className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 block">Parser extracts: Company Overview, Services, Products, Contacts, Value Propositions.</span>
                </div>
              ) : ingestionType === 'manual' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Paste Business Collateral</label>
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Enter raw product manuals, custom pricing guidelines, or business notes..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-3 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <span className="text-[9px] text-slate-400 block">Accepts arbitrary custom notes and extracts core knowledge nodes recursively.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Attach Local Document Stream</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 relative flex items-center justify-center text-center cursor-pointer hover:border-indigo-400 transition">
                    <div className="space-y-1">
                      <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                      <span className="text-[10px] font-bold text-slate-700 block">{attachedFileName || 'Choose target PDF document...'}</span>
                      <span className="text-[9px] text-slate-400 font-mono">Enforces structural layout classifications up to 25MB</span>
                    </div>
                    <input 
                      type="file" 
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachedFileName(e.target.files[0].name);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* ACTION TRIGGER BUTTON */}
              <button
                onClick={executeIngestionPipeline}
                disabled={isExtracting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all duration-150 disabled:opacity-50 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Parse Pipeline...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Start PDF/Website Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RUNNING TELEMETRY AND LOGS */}
          {isExtracting && (
            <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3 font-mono text-[10px]">
              <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-indigo-950 pb-2">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                  PDF_PARSING_PIPELINE
                </span>
                <span>LEVEL: INGESTION_BUS</span>
              </div>
              
              <div className="space-y-1 block">
                <span className="text-slate-400 block font-bold">Active Phase: {extractionStep}</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${extractionProgress}%` }}></div>
                </div>
              </div>

              <div className="max-h-[140px] overflow-y-auto space-y-1 pt-2 border-t border-slate-800 scrollbar-thin text-indigo-200 leading-normal select-none">
                {extractionLogs.map((logItem, idx) => (
                  <div key={idx} className="block">{logItem}</div>
                ))}
              </div>
            </div>
          )}

          {/* HARVEST COST REDUCTION SANITY CHECK */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-3xl p-4 flex gap-3 text-slate-900">
            <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 select-none">
              <span className="text-xs font-bold text-emerald-800 uppercase block tracking-wide font-sans">Storage Optimization Active</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Raw binary PDFs and large pixel layers are stripped and discarded in client threads. Approved knowledge nodes represent compact structured records (<span className="font-mono text-emerald-700 font-bold">~%0.02 space overhead</span>), yielding massive savings.
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE/RIGHT PANEL: ACTIVE KNOWLEDGE DIRECTORIES & VALIDATION QUEUE */}
        <div className="xl:col-span-2 space-y-6">

          {/* SECTION A: HUMAN VALIDATION QUEUE */}
          {validationQueue.length > 0 && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-5 shadow-sm space-y-4 text-slate-900">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div>
                  <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                    Human Validation Queue Requirement
                  </h3>
                  <p className="text-amber-700 text-[11px] mt-0.5">Authorize or edit newly parsed parameters to certify database accuracy.</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 border border-amber-200 text-amber-800 font-bold font-mono text-[9px] rounded-lg">
                  {validationQueue.length} ITEMS PENDING
                </span>
              </div>

              <div className="space-y-4">
                {validationQueue.map((item) => (
                  <div key={item.id} className="bg-white border border-amber-200 rounded-2xl p-4 space-y-3 shadow-inner text-slate-900">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-amber-50 rounded border border-amber-200 font-bold text-amber-700 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                        <p className="text-[9px] text-slate-400 font-mono">Source channel: {item.sourceDetail} ({item.confidenceScore}% confidence)</p>
                      </div>

                      <div className="flex gap-1.5 shrink-0 select-none">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 px-2.5 hover:bg-slate-50 pointer hover:text-slate-800 text-slate-500 text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-xl transition"
                        >
                          Edit Content
                        </button>
                        <button
                          onClick={() => handleRejectItem(item.id)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded-lg hover:text-red-700 transition"
                          title="Reject"
                        >
                          <X className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleApproveItem(item.id)}
                          className="p-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-xl flex items-center gap-1 cursor-pointer transition shadow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      </div>
                    </div>

                    {/* FIELDS PARSER TABLE */}
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[11px] space-y-1.5 font-mono">
                      {Object.entries(item.content).map(([key, val]) => (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <span className="text-slate-400 font-bold uppercase block text-[9px]">{key.replace('_', ' ')}:</span>
                          <span className="text-slate-700 font-medium col-span-2 text-wrap break-all">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: EXPLORE SECURE DATA GRAPH & DASHBOARD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-900">
            
            {/* SEARCH AND TAB NAVIGATION SEGMENT */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  Tenant Certified Knowledge Dashboard
                </h3>
                <p className="text-slate-400 text-xs">Approved parameters forming the active single source of truth for generation.</p>
              </div>

              {/* SEARCH BLOCK */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter records..."
                  className="bg-slate-50 border border-slate-200 text-xs px-3 py-1.5 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* DIRECTORIES CATEGORIES SLOTS */}
            <div className="flex gap-1.5 overflow-x-auto select-none scroller-hidden">
              {(['all', 'company', 'product', 'service', 'brand_voice', 'customer_segment', 'competitor', 'key_message'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* DIRECTORIES CARDS LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.length === 0 ? (
                <div className="col-span-2 border-2 border-dashed border-slate-100 rounded-2xl text-center py-8 text-xs text-slate-400 select-none">
                  No matching certified knowledge items detected under selection.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`bg-slate-50/50 border rounded-2xl p-4 space-y-3 hover:border-indigo-400 hover:bg-white transition-all cursor-default ${
                      graphActiveNode === item.id ? 'ring-2 ring-indigo-500 border-indigo-500 bg-white' : 'border-slate-200'
                    }`}
                    onClick={() => setGraphActiveNode(item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono font-black text-indigo-600 uppercase">
                          {item.category.replace('_', ' ')}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 tracking-tight">{item.title}</h4>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(item);
                          }}
                          className="hover:text-indigo-600 text-slate-400 p-1 rounded-lg hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-3 rounded-xl text-[10px] space-y-1.5 font-mono max-h-[140px] overflow-y-auto">
                      {Object.entries(item.content).map(([key, val]) => (
                        <div key={key} className="block leading-relaxed">
                          <span className="text-slate-400 text-[8px] uppercase block tracking-wider font-bold mb-0.5">{key.replace('_', ' ')}</span>
                          <span className="text-slate-700 block font-medium pre-wrap break-all">{String(val)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 pt-1">
                      <span>VERIFIED: {new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="text-emerald-600 font-bold">✓ SYNCED</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SECT C: INTUITIVE TENANT-SCOPED KNOWLEDGE GRAPH VIBE */}
            <div className="bg-[#090D16] text-white rounded-3xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold font-sans text-indigo-400 flex items-center gap-1.5">
                    <Network className="w-4.5 h-4.5" />
                    SaaS Client Knowledge Topology Graph
                  </h4>
                  <p className="text-[10px] text-slate-400">Interactive representation showing semantic relationships among company pillars.</p>
                </div>
                <span className="font-mono text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
                  TENANT: {tenantId.toUpperCase()}
                </span>
              </div>

              {/* DYNAMIC VISUAL CONNECTIONS MAP */}
              <div className="relative bg-[#050810] border border-slate-800 rounded-2xl p-4 overflow-hidden h-[240px] flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>
                
                {/* Visual links presentation */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[180px] h-[180px] rounded-full border border-dashed border-indigo-950 flex items-center justify-center">
                    <div className="w-[80px] h-[80px] rounded-full border border-indigo-950"></div>
                  </div>
                </div>

                {/* Simulated Nodes absolute layouts */}
                <div className="relative z-10 w-full h-full flex flex-wrap justify-center items-center gap-3">
                  {knowledgeItems.map((item, idx) => {
                    const isSelected = graphActiveNode === item.id;
                    const catColors: Record<string, string> = {
                      company: 'bg-indigo-500 border-indigo-400 text-white',
                      product: 'bg-emerald-500 border-emerald-400 text-white',
                      brand_voice: 'bg-violet-500 border-violet-400 text-white',
                      customer_segment: 'bg-amber-500 border-amber-400 text-white',
                      competitor: 'bg-rose-500 border-rose-400 text-white',
                      service: 'bg-teal-500 border-teal-400 text-white',
                      key_message: 'bg-blue-500 border-blue-400 text-white'
                    };

                    return (
                      <button
                        key={item.id}
                        onClick={() => setGraphActiveNode(item.id)}
                        className={`px-3 py-1.5 rounded-xl border font-mono text-[10px] flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected 
                            ? 'ring-4 ring-indigo-500/50 scale-110 shadow-lg font-bold' 
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? catColors[item.category] || 'bg-white' : 'bg-slate-600'}`}></span>
                        <span>{item.title.split(' ')[0]} ({item.category.substring(0, 4)})</span>
                      </button>
                    );
                  })}
                </div>

                {graphActiveNode && (
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 border border-slate-800 backdrop-blur rounded-xl p-2.5 text-[10px] font-mono text-slate-300 flex justify-between items-center z-20">
                    <div>
                      <strong className="text-white block uppercase text-[8px] font-mono text-indigo-400 mb-0.5">Semantic Relations Trace</strong>
                      <span>Node <strong>{knowledgeItems.find(k => k.id === graphActiveNode)?.title}</strong> holds valid context constraints.</span>
                    </div>
                    <button 
                      onClick={() => setGraphActiveNode(null)}
                      className="p-1 hover:text-white text-slate-500 text-xs font-bold bg-slate-800 border border-slate-700 rounded-lg"
                    >
                      CLEAR
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 5: AI CONTEXT ENGINE PLAYGROUND INTEGRATION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-900">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Cpu className="w-5 h-5" />
            <h3 className="font-extrabold text-slate-900 text-base font-sans">Corporate AI Context Ingestor Simulator Office</h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">Every prompt execution is strictly forbidden from initiating in an isolated bubble. The system automatically chains the custom task with company specifications, target pricing, brand voice templates, and client demographics.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CONTROL BOX */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">1. Context Payload Construction</h4>
            
            <div className="space-y-2.5">
              <label className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Certified Database Assets Checklist:</label>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-slate-900">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Company Profile</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={contextCompanySelected}
                    onChange={(e) => setContextCompanySelected(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-slate-900">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Products Inventory</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={contextProductsSelected}
                    onChange={(e) => setContextProductsSelected(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-slate-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Brand Tone Blueprint</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={contextVoiceSelected}
                    onChange={(e) => setContextVoiceSelected(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-slate-900">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Buyer Demographics</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={contextSegmentsSelected}
                    onChange={(e) => setContextSegmentsSelected(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono text-slate-BLOCK text-slate-400 font-bold block">2. Ingest Custom Instruction Proposal</label>
              <textarea 
                rows={3}
                value={aiUserPrompt}
                onChange={(e) => setAiUserPrompt(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-401 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition resize-none leading-normal font-medium"
                placeholder="Give the writer agent custom assignments..."
              ></textarea>
            </div>

            <button 
              onClick={handleAssembleAiContext}
              disabled={isAssemblingPrompt}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              Build Context & Fire Generation
            </button>
          </div>

          {/* ASSEMBLED PAYLOAD STREAM */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* ASSEMBLED DRAFT SYSTEM PROMPT (PROVES KNOWLEDGE IS SENT TO MODEL) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-2 right-2 text-[8px] font-mono font-bold tracking-widest text-slate-700 uppercase bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                PROMPT_BUFFER
              </div>

              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                <span className="text-[10px] block font-mono font-bold text-indigo-400 uppercase tracking-widest">Assembled Ingestion Payload:</span>
                <div className="bg-slate-950 p-3 rounded-xl text-[10px] font-mono text-indigo-300 leading-normal overflow-y-auto max-h-[190px] flex-1 select-all h-full outline-none">
                  {assembledContextOutput ? (
                    assembledContextOutput
                  ) : (
                    <span className="text-slate-600 italic block">No active payload assembled yet. Ingest options and initiate above to inspect serialized tokens.</span>
                  )}
                </div>
              </div>
              <div className="border-t border-slate-800 pt-2.5 mt-2.5 flex items-center justify-between text-[8px] text-slate-500 font-mono">
                <span>TOTAL: {assembledContextOutput ? Math.round(assembledContextOutput.length / 3.9) : 0} TOKENS SENT</span>
                <span className="text-emerald-500 font-extrabold flex items-center gap-0.5">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> SECURE BOUND
                </span>
              </div>
            </div>

            {/* SIMULATED HIGH CONVERTING COMPLETION STREAM CLIENT */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative text-slate-900">
              <div className="absolute top-2 right-2 text-[8px] font-mono font-bold tracking-widest text-[#1E293B] uppercase bg-[#E2E8F0] px-2 py-0.5 rounded border border-[#CBD5E1]">
                LLM_COGNITIVE_OUTPUT
              </div>

              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                <span className="text-[10px] block font-mono font-bold text-slate-400 uppercase tracking-widest">Target Generation Content:</span>
                <div className="bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-800 leading-relaxed overflow-y-auto max-h-[190px] flex-1 font-medium">
                  {simulatedAiCompletion ? (
                    simulatedAiCompletion
                  ) : (
                    <span className="text-slate-400 italic block">Draft output will stream live here based on the certified tenant knowledge base structures safely.</span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2.5 mt-2.5 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                <span>STATUS: STABLE</span>
                <span className="text-indigo-600 font-bold block uppercase tracking-wider">MKT-OS COMPLIANT</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* MODAL EDITING REGISTER */}
      {editingItem && (
        <div 
          className="fixed inset-0 bg-[#010816]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingItem(null); }}
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-scale-up flex flex-col max-h-[90vh] my-auto text-slate-900 relative">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Edit Ingested Category Field values</h4>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Editing Form */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Custom Title</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-3 border-t pt-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Extracted Attributes</span>
                
                {Object.entries(editingItem.content).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold">{key.replace('_', ' ')}</label>
                    <textarea
                      rows={2}
                      value={String(val)}
                      onChange={(e) => {
                        const updatedContent = { ...editingItem.content, [key]: e.target.value };
                        setEditingItem({ ...editingItem, content: updatedContent });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono leading-relaxed"
                    ></textarea>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition duration-150"
              >Close</button>
              
              <button
                onClick={() => handleEditItemSave(editingItem)}
                className="px-4 py-2 bg-[#0F172A] hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-2"
              >
                <Check className="w-4 h-4" />Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
