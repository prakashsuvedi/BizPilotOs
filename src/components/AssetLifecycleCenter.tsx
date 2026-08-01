import React, { useState, useEffect, useRef } from 'react';
import { 
  HardDrive, 
  Trash2, 
  Clock, 
  Check, 
  RefreshCw, 
  Upload, 
  FileText, 
  ArrowRight, 
  Save, 
  TrendingDown, 
  DollarSign, 
  Database, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Search, 
  Calendar, 
  FileCheck, 
  ArrowDownToLine, 
  AlertCircle 
} from 'lucide-react';
import { BusinessProfile } from '../types';

interface Props {
  profile: BusinessProfile;
}

interface SimulatedAsset {
  id: string;
  name: string;
  category: 'image' | 'pdf' | 'metadata' | 'creative';
  isPermanent: boolean;
  originalSize: number; // bytes
  optimizedSize: number; // bytes
  uploadedAt: Date;
  expiresAt: Date | null;
  uploadedElapsedHours?: number;
  format: string;
  plan: 'free' | 'pro' | 'agency';
  thumbnailUrl?: string;
  originalUrl?: string;
  customUploaded?: boolean;
}

export default function AssetLifecycleCenter({ profile }: Props) {
  // Subscription Plan selection controls retention period rules
  const [activePlan, setActivePlan] = useState<'free' | 'pro' | 'agency'>('pro');
  
  // Simulated clock/time warp offset, allowing user to preview purges live
  const [timeWarpOffsetHours, setTimeWarpOffsetHours] = useState<number>(0);
  
  // Interactive Image Optimizer configurations
  const [imageQuality, setImageQuality] = useState<number>(80);
  const [imageMaxWidth, setImageMaxWidth] = useState<number>(800);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [optimizedImageObject, setOptimizedImageObject] = useState<{
    originalSize: number;
    optimizedSize: number;
    width: number;
    height: number;
    savingsPct: number;
    thumbnailSize: number;
    optimizedDataUrl: string;
    thumbnailDataUrl: string;
  } | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [optimizerError, setOptimizerError] = useState<string | null>(null);

  // Interactive PDF Optimizer variables
  const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);
  const [pdfOptimizedResult, setPdfOptimizedResult] = useState<{
    name: string;
    originalSize: number;
    optimizedSize: number;
    savingsPct: number;
    imagesCompressedCount: number;
    fontsSubsetFonts: string[];
    redundantAssetsRemoved: number;
  } | null>(null);
  const [pdfCompressionStep, setPdfCompressionStep] = useState<string>('');
  const [pdfTargetSize, setPdfTargetSize] = useState<number>(8.4); // MB

  // Simulated live storage audit log
  const [storageAuditLogs, setStorageAuditLogs] = useState<{
    id: string;
    timestamp: Date;
    action: string;
    details: string;
    badgeColor: string;
  }[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000 * 2),
      action: 'ISOLATION_INIT',
      details: 'SaaS Storage partition allocated and secure. Directory: /tenant-assets/demo-tenant/*',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 3600000 * 1.5),
      action: 'COMPRESSION_ENFORCED',
      details: 'Metadata persistence schema optimized to JSON lines compression format.',
      badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    }
  ]);

  // Initial registry of simulated assets under the active corporation/tenant
  const [assets, setAssets] = useState<SimulatedAsset[]>([
    // Permanent Storage (Critical business models)
    {
      id: 'asst-perm-1',
      name: `${profile.name}_Corporate_Profile.json`,
      category: 'metadata',
      isPermanent: true,
      originalSize: 84 * 1024,
      optimizedSize: 12 * 1024, // Optimized json structured formats
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 5),
      expiresAt: null,
      format: 'JSON',
      plan: 'pro'
    },
    {
      id: 'asst-perm-2',
      name: `${profile.name}_Verified_Personas.json`,
      category: 'metadata',
      isPermanent: true,
      originalSize: 142 * 1024,
      optimizedSize: 24 * 1024,
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 4),
      expiresAt: null,
      format: 'JSON',
      plan: 'pro'
    },
    {
      id: 'asst-perm-3',
      name: `${profile.name}_Brand_Identity_Guidelines.json`,
      category: 'metadata',
      isPermanent: true,
      originalSize: 310 * 1024,
      optimizedSize: 45 * 1024,
      uploadedAt: new Date(Date.now() - 3600000 * 24 * 3),
      expiresAt: null,
      format: 'JSON',
      plan: 'pro'
    },
    
    // Temporary Storage (High-occupancy assets, default expiration countdowns based on tenant plan)
    {
      id: 'asst-temp-1',
      name: 'Launch_Concept_Banners_Aero.png',
      category: 'image',
      isPermanent: false,
      originalSize: 4.8 * 1024 * 1024,
      optimizedSize: 420 * 1024, // Compressed WebP representation
      uploadedAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
      expiresAt: new Date(Date.now() + 3600000 * 20), // Expires according to current Pro plan configuration (mapped relatively for UI ease)
      format: 'WebP',
      plan: 'pro',
      thumbnailUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 'asst-temp-2',
      name: 'Autumn_Collection_VIP_Invites_Staged.png',
      category: 'image',
      isPermanent: false,
      originalSize: 3.2 * 1024 * 1024,
      optimizedSize: 310 * 1024,
      uploadedAt: new Date(Date.now() - 3600000 * 18), // 18 hours ago
      expiresAt: new Date(Date.now() + 3600000 * 6),
      format: 'WebP',
      plan: 'pro',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 'asst-temp-3',
      name: 'Enterprise_Sales_Brochure_PrintReady.pdf',
      category: 'pdf',
      isPermanent: false,
      originalSize: 18.5 * 1024 * 1024, // Bloated unoptimized size
      optimizedSize: 3.1 * 1024 * 1024, // Optimized PDF targeting <5MB guidelines
      uploadedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      expiresAt: new Date(Date.now() + 3600000 * 22),
      format: 'PDF',
      plan: 'pro'
    },
    {
      id: 'asst-temp-4',
      name: 'Instagram_Social_Carousel_Pack_Optimized.zip',
      category: 'creative',
      isPermanent: false,
      originalSize: 14.2 * 1024 * 1024,
      optimizedSize: 2.4 * 1024 * 1024,
      uploadedAt: new Date(Date.now() - 3600000 * 8), // 8 hours ago
      expiresAt: new Date(Date.now() + 3600000 * 16),
      format: 'ZIP',
      plan: 'pro'
    },
  ]);

  // Asset search state
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Auto-calculated stats and economics
  const [metrics, setMetrics] = useState<any>({
    originalTotal: 0,
    optimizedTotal: 0,
    savingsPct: 0,
    costBefore: 0,
    costAfter: 0,
    costSavingsPct: 0
  });

  const getRetentionLimitHours = (plan: 'free' | 'pro' | 'agency') => {
    if (plan === 'free') return 24;
    if (plan === 'pro') return 30 * 24;
    return 90 * 24;
  };

  // Recalculate size metrics dynamically based on active files in storage
  useEffect(() => {
    // Exclude pre-defined purged assets from active storage cost calculation
    const activeAssets = assets.filter(a => {
      if (a.isPermanent) return true;
      if (!a.expiresAt) return true;
      // If time wrap indicates expirations
      const timeRemainingMs = new Date(a.expiresAt).getTime() - (Date.now() + timeWarpOffsetHours * 3600000);
      return timeRemainingMs > 0;
    });

    const originalTotal = activeAssets.reduce((sum, item) => sum + item.originalSize, 0);
    const optimizedTotal = activeAssets.reduce((sum, item) => sum + item.optimizedSize, 0);
    
    // Unoptimized storage cost calculation: assume typical premium corporate CDN/Cloud Storage + transfer cost rate
    // Unoptimized: $0.14 per MB / month. Optimized: $0.028 per MB / month (due to size compression, fewer raw requests)
    const costBefore = (originalTotal / (1024 * 1024)) * 0.15;
    const costAfter = (optimizedTotal / (1024 * 1024)) * 0.03;

    setMetrics({
      originalTotal,
      optimizedTotal,
      savingsPct: originalTotal ? Math.round(((originalTotal - optimizedTotal) / originalTotal) * 100) : 0,
      costBefore: Number(costBefore.toFixed(2)),
      costAfter: Number(costAfter.toFixed(2)),
      costSavingsPct: costBefore ? Math.round(((costBefore - costAfter) / costBefore) * 100) : 0
    });
  }, [assets, timeWarpOffsetHours]);

  // Handle explicit "Save Asset" conversion to make storage permanent
  const handleMakePermanent = (assetId: string) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        // Log action in audit trace
        const logItem = {
          id: `log-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          action: 'ARCHIVE_PROMOTE',
          details: `Promoted document [${asset.name}] to Permanent Secure Archive status. Cleared expiry countdown.`,
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
        setStorageAuditLogs(history => [logItem, ...history]);
        return {
          ...asset,
          isPermanent: true,
          expiresAt: null
        };
      }
      return asset;
    }));
  };

  // Handle manual removal of item
  const handleDeleteAsset = (assetId: string) => {
    const deletedAsset = assets.find(a => a.id === assetId);
    setAssets(prev => prev.filter(asset => asset.id !== assetId));
    
    if (deletedAsset) {
      const logItem = {
        id: `log-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        action: 'ASSET_PURGED',
        details: `Deleted file ${deletedAsset.name} from tenant storage workspace manually.`,
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
      };
      setStorageAuditLogs(history => [logItem, ...history]);
    }
  };

  // Simulate background cleanup job
  const handleTriggerPurgeJob = () => {
    // Capture expired files
    const currentTimeMs = Date.now() + timeWarpOffsetHours * 3600000;
    const expiredAssets = assets.filter(a => !a.isPermanent && a.expiresAt && new Date(a.expiresAt).getTime() <= currentTimeMs);

    if (expiredAssets.length === 0) {
      const logItem = {
        id: `log-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        action: 'CRON_COMPLETED',
        details: `Daily cron cleanup job finished. 0 assets exceeded current retention threshold. Storage is healthy.`,
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm'
      };
      setStorageAuditLogs(history => [logItem, ...history]);
      return;
    }

    // Filter out expired assets from registry
    setAssets(prev => prev.filter(a => {
      if (a.isPermanent) return true;
      if (!a.expiresAt) return true;
      return new Date(a.expiresAt).getTime() > currentTimeMs;
    }));

    // Record aggregate results inside audit telemetry logs
    const logItem = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: 'CRON_SWEEP',
      details: `Daily background lifecycle job executed. Swept and reclaimed storage from ${expiredAssets.length} expired resources: (${expiredAssets.map(e => e.name).join(', ')}). Total unoptimized space recycled: ${Math.round(expiredAssets.reduce((s, x) => s + x.originalSize, 0) / (1024 * 1024))} MB.`,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm'
    };
    setStorageAuditLogs(history => [logItem, ...history]);
  };

  // Trigger Client-Side Canvas Image Optimization Pipeline
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setOptimizedImageObject(null);
      setOptimizerError(null);
    }
  };

  const executeImageCompression = () => {
    if (!imageFile) return;

    setIsProcessingImage(true);
    setOptimizerError(null);

    // Create a FileReader to read image and draw onto native HTML5 canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not acquire 2D Canvas Context");

          // Calculate aspect ratio boundaries matching target maximum width
          let width = img.width;
          let height = img.height;
          if (width > imageMaxWidth) {
            height = Math.round((height * imageMaxWidth) / width);
            width = imageMaxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Quality is bounded between 75-85
          const compressionQuality = imageQuality / 100;
          
          // Export WebP image data url
          const webpDataUrl = canvas.toDataURL('image/webp', compressionQuality);
          
          // Generate active thumbnail (e.g. 100px max width)
          const thumbCanvas = document.createElement('canvas');
          const thumbCtx = thumbCanvas.getContext('2d');
          if (thumbCtx) {
            const thumbW = 100;
            const thumbH = Math.round((height * thumbW) / width);
            thumbCanvas.width = thumbW;
            thumbCanvas.height = thumbH;
            thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);
          }
          const thumbnailDataUrl = thumbCanvas.toDataURL('image/webp', 0.6);

          // Calculate simulated byte sizes based on Base64 string lengths
          const estimatedWebpSize = Math.round((webpDataUrl.length - 22) * 3 / 4);
          const estimatedOriginalSize = imageFile.size;
          const estimatedThumbSize = Math.round((thumbnailDataUrl.length - 22) * 3 / 4);

          // Enforce 1:1 Optimized-Only Rule - Store only the optimized version
          setTimeout(() => {
            setOptimizedImageObject({
              originalSize: estimatedOriginalSize,
              optimizedSize: estimatedWebpSize,
              width,
              height,
              savingsPct: Math.round(((estimatedOriginalSize - estimatedWebpSize) / estimatedOriginalSize) * 100),
              thumbnailSize: estimatedThumbSize,
              optimizedDataUrl: webpDataUrl,
              thumbnailDataUrl: thumbnailDataUrl
            });
            setIsProcessingImage(false);

            // Print verification log to telemetry audits
            const logItem = {
              id: `log-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date(),
              action: 'IMAGE_OPTIMIZED',
              details: `Optimized image file [${imageFile.name}]. Resized to: ${width}x${height}px. WebP format, quality ${imageQuality}%. Reclaimed ${Math.round(((estimatedOriginalSize - estimatedWebpSize) / (1024 * 1024)) * 100) / 100}MB. (Optimized Only rule enforced)`,
              badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-100'
            };
            setStorageAuditLogs(history => [logItem, ...history]);
          }, 1200);

        } catch (err: any) {
          setOptimizerError(err.message || "Failed during canvas processing framework cycle.");
          setIsProcessingImage(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  };

  // Add the newly optimized image to our active temporary workspace
  const handleSaveOptimizedImage = () => {
    if (!optimizedImageObject || !imageFile) return;

    const retentionLimit = getRetentionLimitHours(activePlan);
    const expires = new Date(Date.now() + retentionLimit * 365 * 1000); // Expiration offset calculation (configured based on plan)
    
    const newAsset: SimulatedAsset = {
      id: `asst-opt-${Math.random().toString(36).substr(2, 9)}`,
      name: imageFile.name.replace(/\.[^/.]+$/, "") + "_optimized.webp",
      category: 'image',
      isPermanent: false,
      originalSize: optimizedImageObject.originalSize,
      optimizedSize: optimizedImageObject.optimizedSize,
      uploadedAt: new Date(),
      expiresAt: new Date(Date.now() + retentionLimit * 3600 * 1000), // Real dynamic plan expiration
      format: 'WebP',
      plan: activePlan,
      thumbnailUrl: optimizedImageObject.thumbnailDataUrl,
      customUploaded: true
    };

    setAssets(prev => [newAsset, ...prev]);

    // Reset Optimizer
    setImageFile(null);
    setImagePreviewUrl(null);
    setOptimizedImageObject(null);

    const logItem = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: 'ASSET_SAVED_TEMP',
      details: `Saved optimized asset ${newAsset.name} to Temporary workspace. Expiry set to ${retentionLimit} hours matching your ${activePlan.toUpperCase()} plan.`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    setStorageAuditLogs(history => [logItem, ...history]);
  };

  // Execute Simulated PDF Optimization pipeline (fonts optimization, duplicate structures stripping, target sub-5MB)
  const triggerPdfOptimization = () => {
    setIsProcessingPdf(true);
    setPdfOptimizedResult(null);

    const steps = [
      { msg: 'Reading PDF catalog file structure...', delay: 500 },
      { msg: 'Extracting fonts & resolving subset criteria (Inter -> SubsetFont)...', delay: 1100 },
      { msg: 'Downsampling and compressing internal bitmaps (Quality 75%)...', delay: 1800 },
      { msg: 'Identifying and purging duplicate binary objects...', delay: 2400 },
      { msg: 'Writing highly serialized optimized PDF stream...', delay: 2900 }
    ];

    steps.forEach((stepItem) => {
      setTimeout(() => {
        setPdfCompressionStep(stepItem.msg);
      }, stepItem.delay);
    });

    setTimeout(() => {
      // Create high optimization result targetting size under 5MB (from 18.2MB down to 3.4MB of corporate flyer PDF)
      const inputSize = pdfTargetSize * 1024 * 1024;
      const targetRatio = 0.22; // 78% average savings calculated
      const outputSize = inputSize * targetRatio;

      setPdfOptimizedResult({
        name: `${profile.name}_Enterprise_Product_Catalog_Optimized.pdf`,
        originalSize: inputSize,
        optimizedSize: outputSize,
        savingsPct: 78,
        imagesCompressedCount: 14,
        fontsSubsetFonts: ['Inter-RegularCustom', 'PlayfairDisplay-SemiBoldCustom'],
        redundantAssetsRemoved: 3
      });
      setIsProcessingPdf(false);

      // Log in ledger
      const logItem = {
        id: `log-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        action: 'PDF_COMPRESSED',
        details: `PDF Optimizer compiled catalog down from ${(pdfTargetSize).toFixed(1)}MB to ${(outputSize / (1024 * 1024)).toFixed(1)}MB. Downsampled 14 images to WebP streams and subsetted 2 corporate embedded style fonts.`,
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-100 shadow-sm'
      };
      setStorageAuditLogs(history => [logItem, ...history]);
    }, 3300);
  };

  // Save the optimized PDF to the temporary workspace library
  const handleSaveOptimizedPdf = () => {
    if (!pdfOptimizedResult) return;

    const retentionLimit = getRetentionLimitHours(activePlan);
    
    const newAsset: SimulatedAsset = {
      id: `asst-pdf-${Math.random().toString(36).substr(2, 9)}`,
      name: pdfOptimizedResult.name,
      category: 'pdf',
      isPermanent: false,
      originalSize: pdfOptimizedResult.originalSize,
      optimizedSize: pdfOptimizedResult.optimizedSize,
      uploadedAt: new Date(),
      expiresAt: new Date(Date.now() + retentionLimit * 3600 * 1000), // Mapped based on plan
      format: 'PDF',
      plan: activePlan
    };

    setAssets(prev => [newAsset, ...prev]);
    setPdfOptimizedResult(null);

    const logItem = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: 'PDF_SAVED',
      details: `Saved optimized PDF document to active temporary workspace, with automatic removal scheduled in ${retentionLimit} hours.`,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    };
    setStorageAuditLogs(history => [logItem, ...history]);
  };

  // Switch plans, automatically calculating adjusted expiration vectors for active temporary files
  const handlePlanChange = (plan: 'free' | 'pro' | 'agency') => {
    setActivePlan(plan);
    const retentionHours = getRetentionLimitHours(plan);

    setAssets(prev => prev.map(asset => {
      if (asset.isPermanent) return asset;
      // Adjust remaining expiration relatively from creation timestamp
      const adjustedExpiry = new Date(asset.uploadedAt.getTime() + retentionHours * 3600000);
      return {
        ...asset,
        plan,
        expiresAt: adjustedExpiry
      };
    }));

    // Record system adjustment trace
    const logItem = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: 'PLAN_MIGRATED',
      details: `Shifted active Tenant lifecycle profile to ${plan.toUpperCase()} tier. Storage retention policy set to ${retentionHours} hours. Expiring resources updated safely.`,
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-100 text-xs font-semibold'
    };
    setStorageAuditLogs(history => [logItem, ...history]);
  };

  // Simple formatter helper for file dimensions
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter list with user search
  const filteredAssets = assets.filter(a => {
    const term = searchTerm.toLowerCase();
    return a.name.toLowerCase().includes(term) || a.category.toLowerCase().includes(term) || a.format.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 pt-2 pb-12 animate-fade-in text-slate-800">
      
      {/* 1. ARCHITECTURAL HEADER & PERSISTENCE INSIGHT BAR */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <HardDrive className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase font-mono bg-indigo-500/25 border border-indigo-400/30 text-indigo-300 font-bold tracking-wider px-2 py-0.5 rounded-md">
              Resource Management Core
            </span>
            <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Isolate Partition: Enabled (demo-tenant)
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans">
            Cost-Optimized Asset Lifecycle System
          </h2>
          
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
            Retain vital metadata, company profiles, and brand guidelines permanently (<span className="text-emerald-400 font-semibold font-mono">0B wasted footprint</span>). 
            Generated imagery and PDF assets are auto-compressed from client source files and automatically purged under standard SLA thresholds unless explicitly archived.
          </p>
          
          <div className="pt-2 flex flex-wrap gap-3">
            <div className="text-xs text-slate-100 bg-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2 border border-white/5 font-medium">
              <span>ACTIVE LIFE PROFILE RETENTION:</span>
              <span className="text-yellow-300 font-mono font-bold tracking-tight uppercase">
                {activePlan === 'free' ? '24 Hours' : activePlan === 'pro' ? '30 Days' : '90 Days'}
              </span>
            </div>
            <div className="text-xs text-slate-200 bg-emerald-500/20 px-3.5 py-2 rounded-xl flex items-center gap-2 border border-emerald-500/20 font-bold active:bg-emerald-500/30 transition">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>STORAGE DENSITY SAVINGS:</span>
              <span className="text-emerald-400 font-mono">{metrics.savingsPct}% SAVED</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THREE-PANEL CORE ANALYTICS ENGINE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1 relative overflow-hidden text-slate-900">
          <div className="absolute top-2 right-2 text-slate-200">
            <Database className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Original Storage Volume</span>
          <p className="text-2xl font-black text-slate-400 font-mono">{formatBytes(metrics.originalTotal)}</p>
          <div className="text-[11px] text-slate-500 mt-1">If standard unoptimized multi-media uploads were saved.</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1 relative overflow-hidden text-slate-900">
          <div className="absolute top-2 right-4 text-teal-100">
            <Check className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block font-mono">Active Optimized Bulk</span>
          <p className="text-2xl font-black text-slate-900 font-mono">{formatBytes(metrics.optimizedTotal)}</p>
          <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
            Only Optimized Version Stored
          </span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-1 relative overflow-hidden">
          <div className="absolute top-3 right-3 text-emerald-500 bg-emerald-100/30 rounded-xl p-1.5">
            <TrendingDown className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block font-mono">SaaS Density Savings</span>
          <p className="text-3xl font-black text-emerald-600 font-mono tracking-tighter">-{metrics.savingsPct}%</p>
          <div className="text-[11px] text-emerald-800 font-medium">Reclaiming valuable cloud network headroom.</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1 relative overflow-hidden flex flex-col justify-between text-slate-900">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Monthly Estimated CDN Cost</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-slate-400 line-through font-mono text-sm">${metrics.costBefore}</span>
              <span className="text-slate-800 font-extrabold text-xl font-mono">${metrics.costAfter}</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded pr-2">-{metrics.costSavingsPct}%</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>RUN-RATE REDUCED BY 80%+</span>
            <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        </div>

      </div>

      {/* 3. STORAGE WORKBENCH COMPRESSION SIMULATOR (IMAGE + PDF COLLAPSIBLES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* IMAGE WEB-P SOURCE RESIZER & OPTIMIZER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-900">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sliders className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-sm font-sans">Active Image WebP Optimizer Pipeline</h3>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Resize oversized source photos, convert to native WebP, control compression quality and generates thumbnails automatically prior to ingestion.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">WebP Quality Ratio (75 - 85)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="75" 
                    max="85" 
                    value={imageQuality} 
                    onChange={(e) => setImageQuality(Number(e.target.value))}
                    className="flex-1 cursor-pointer accent-indigo-600 block h-2 bg-slate-100 rounded-lg appearance-none text-slate-900" 
                  />
                  <span className="text-xs font-bold font-mono text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                    {imageQuality}%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Target Bound Width</label>
                <select 
                  value={imageMaxWidth} 
                  onChange={(e) => setImageMaxWidth(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="500">500px (Aggressive Compact)</option>
                  <option value="800">800px (Brand Optimized - Default)</option>
                  <option value="1200">1200px (High Retina Presentation)</option>
                </select>
              </div>
            </div>

            {/* Upload Zone / Preset selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center bg-slate-50 relative group cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-indigo-500 transition" />
                <span className="text-[11px] font-bold text-slate-700">Click to choose image logo file</span>
                <span className="text-[9px] text-slate-400 mt-1">Accepts PNG, JPG, BMP</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImageFileChange}
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between text-slate-900">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Or Use Core Preset Logo</span>
                <button 
                  onClick={async () => {
                    const presetUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
                    setIsProcessingImage(true);
                    try {
                      const response = await fetch(presetUrl);
                      const blob = await response.blob();
                      const file = new File([blob], `${profile.name.toLowerCase()}_raw_unoptimized.png`, { type: 'image/png' });
                      setImageFile(file);
                      setImagePreviewUrl(presetUrl);
                      setOptimizedImageObject(null);
                      setIsProcessingImage(false);
                    } catch (e) {
                      setIsProcessingImage(false);
                      setOptimizerError("Failed to fetch preset image.");
                    }
                  }}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  Load Mock Logo Source
                </button>
              </div>
            </div>

            {optimizerError && (
              <div className="bg-rose-50 border border-rose-100 text-[11px] text-rose-700 p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{optimizerError}</span>
              </div>
            )}

            {/* Run compressor or display optimized asset dimensions */}
            {imageFile && !optimizedImageObject && (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-900">
                <div className="flex items-center gap-3">
                  {imagePreviewUrl && (
                    <img 
                      src={imagePreviewUrl} 
                      alt="Initial Source" 
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-sm"
                    />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight text-ellipsis max-w-[200px] overflow-hidden">{imageFile.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500 block">Raw size: {formatBytes(imageFile.size)}</span>
                  </div>
                </div>
                <button
                  onClick={executeImageCompression}
                  disabled={isProcessingImage}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isProcessingImage ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Optimizing Codec...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Compress to WebP Only
                    </>
                  )}
                </button>
              </div>
            )}

            {/* COMPRESSED OUTPUTS PREVIEW */}
            {optimizedImageObject && imageFile && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-4 shadow-inner text-slate-900">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={optimizedImageObject.optimizedDataUrl} 
                      alt="Optimized WebP" 
                      className="w-14 h-14 object-cover rounded-xl border border-emerald-200 shadow-sm"
                    />
                    <div>
                      <span className="text-[9px] font-bold text-emerald-600 font-mono tracking-wider block bg-emerald-100 inline-block px-1.5 rounded">WEBP OPTIMIZED (Ingestion target)</span>
                      <h4 className="text-xs font-bold text-slate-800 tracking-tight mt-1">{imageFile.name.replace(/\.[^/.]+$/, "")}_optimized.webp</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">Resized context: {optimizedImageObject.width}w x {optimizedImageObject.height}h px</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-brand-700 font-mono text-emerald-700">-{optimizedImageObject.savingsPct}% Saved</span>
                    <span className="text-[10px] block font-mono text-slate-500 mt-1">{formatBytes(optimizedImageObject.optimizedSize)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white/70 border border-emerald-100 p-3 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <img 
                      src={optimizedImageObject.thumbnailDataUrl} 
                      alt="Auto Thumbnail" 
                      className="w-8 h-8 rounded border border-slate-200 scale-90"
                    />
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 font-mono uppercase">Thumbnail Generated</span>
                      <span className="text-[10px] block font-mono text-slate-500">{formatBytes(optimizedImageObject.thumbnailSize)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase font-mono">1:1 Rule Compliance</span>
                    <span className="text-[9px] text-slate-400">Original payload discarded securely</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 gap-2">
                  <button 
                    onClick={() => {
                      setImageFile(null);
                      setOptimizedImageObject(null);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 text-xs transition cursor-pointer"
                  >
                    Reset Pipeline
                  </button>
                  <button 
                    onClick={handleSaveOptimizedImage}
                    className="px-4 py-1.5 bg-[#0F172A] hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Ingest into Temporary Workspace
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* VECTOR PDF STRUCTURAL COMPRESSION PIPELINE */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-900">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-violet-600">
              <FileCheck className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-sm font-sans">Corporate PDF Compression Engine</h3>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Strip repeated typeface layouts, downsample uncompressed marketing maps, and automatically scale down high-fidelity vector PDF catalog attachments to comply with target sizes under 5MB where possible.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Estimated Original PDF Size: {(pdfTargetSize).toFixed(1)} MB</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="4" 
                  max="25" 
                  step="0.5"
                  value={pdfTargetSize} 
                  onChange={(e) => {
                    setPdfTargetSize(Number(e.target.value));
                    setPdfOptimizedResult(null);
                  }}
                  className="flex-1 cursor-pointer accent-violet-600 block h-2 bg-slate-100 rounded-lg appearance-none text-slate-900" 
                />
                <span className="text-xs font-bold font-mono text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  {pdfTargetSize} MB
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between items-center text-center py-5 gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">Compiling target: {profile.name}_Enterprise_Product_Catalog.pdf</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Includes {Math.round(pdfTargetSize * 1.5)} embedded graphic layers and duplicate Helvetica/Times subsets.</p>
              </div>

              {!isProcessingPdf && !pdfOptimizedResult && (
                <button 
                  onClick={triggerPdfOptimization}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Compile & Optimize PDF
                </button>
              )}
            </div>

            {isProcessingPdf && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-slate-900">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-violet-600 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Running PDF optimizer script...
                  </span>
                  <span className="text-slate-400 font-mono shrink-0">Processing</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden text-slate-900">
                  <div className="bg-violet-600 h-1.5 rounded-full animate-[shimmer_1.5s_infinite]" style={{ width: '80%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono italic animate-pulse">⚙️ {pdfCompressionStep}</p>
              </div>
            )}

            {pdfOptimizedResult && !isProcessingPdf && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-4 text-slate-900">
                <div className="flex items-start justify-between pb-2 border-b border-emerald-100-dot">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold tracking-wider block">COMPRESSION SUCCESS (TARGET MET)</span>
                      <h4 className="text-xs font-extrabold text-slate-800 mt-0.5">{pdfOptimizedResult.name}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-700 font-mono">-{pdfOptimizedResult.savingsPct}% Saved</span>
                    <span className="text-[10px] block font-mono text-slate-400 mt-0.5">{formatBytes(pdfOptimizedResult.optimizedSize)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px] text-slate-600 font-mono">
                  <div className="bg-white/70 border border-slate-200 p-2 rounded-lg text-slate-900">
                    <span className="text-slate-400 block pb-0.5 uppercase tracking-wide">Downsampled</span>
                    <strong className="text-slate-700">{pdfOptimizedResult.imagesCompressedCount} Bitmaps</strong>
                  </div>
                  <div className="bg-white/70 border border-slate-200 p-2 rounded-lg text-slate-900">
                    <span className="text-slate-400 block pb-0.5 uppercase tracking-wide">Cleaned</span>
                    <strong className="text-slate-700">{pdfOptimizedResult.redundantAssetsRemoved} Duplicates</strong>
                  </div>
                  <div className="bg-white/70 border border-slate-200 p-2 rounded-lg text-slate-900">
                    <span className="text-slate-400 block pb-0.5 uppercase tracking-wide">Font Subsets</span>
                    <strong className="text-slate-700">Inter-Regular...</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] bg-emerald-100/30 text-emerald-800 p-2 rounded-xl border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Verified <strong>{(pdfOptimizedResult.optimizedSize / (1024 * 1024)).toFixed(2)} MB PDF</strong> layout compiles cleanly and aligns fully with target corporate upload standard sizes safely.</span>
                </div>

                <div className="flex justify-between items-center pt-1 gap-2">
                  <button 
                    onClick={() => setPdfOptimizedResult(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 text-xs transition cursor-pointer"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleSaveOptimizedPdf}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save PDF to Temporary Registry
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* 4. ACTIVE LEDGER CONTROL HUB (PERMANENT VS TEMPORARY REGISTERED MEDIA) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-900">
        
        {/* LEDGER BAR CAPABILITIES CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm font-sans flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-slate-400" />
              SaaS Multi-tenant Storage Vault & Expiration Registry
            </h3>
            <p className="text-slate-500 text-xs">Verify storage density, trigger mock cleanup schedules, and explicitly validate files assigned to expiration schedules.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mr-2">Subscription SLA Tier:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button 
                onClick={() => handlePlanChange('free')}
                className={`px-3 py-1 font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  activePlan === 'free' ? 'bg-white text-rose-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Free (24h)
              </button>
              <button 
                onClick={() => handlePlanChange('pro')}
                className={`px-3 py-1 font-bold rounded-lg transition-all duration-205 cursor-pointer ${
                  activePlan === 'pro' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pro (30d)
              </button>
              <button 
                onClick={() => handlePlanChange('agency')}
                className={`px-3 py-1 font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  activePlan === 'agency' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Agency (90d)
              </button>
            </div>
          </div>
        </div>

        {/* TIME WARPING / TESTING SUITE BOX */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center text-slate-900">
          
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span className="text-xs font-bold text-slate-800 font-sans">Ingestion Expiry Testing Control Suite</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Expedite logical cloud execution! Pull the time warp slider forward relative to the creation day. 
              Witness how remaining lifespans decay depending on whether the Tenant plan is Free, Pro, or Agency, then click standard "Sweep Cron Job" to clean expired assets.
            </p>
            
            <div className="pt-2 flex items-center gap-3">
              <input 
                type="range" 
                min="0" 
                max="2160" // Mapped up to 90 days of hours
                value={timeWarpOffsetHours} 
                onChange={(e) => setTimeWarpOffsetHours(Number(e.target.value))}
                className="flex-1 cursor-pointer accent-indigo-600 block h-2 bg-slate-200 rounded-lg appearance-none text-slate-900" 
              />
              <span className="text-xs font-black font-mono text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded shadow-sm shrink-0">
                Warp: +{Math.floor(timeWarpOffsetHours / 24)}d {timeWarpOffsetHours % 24}h
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between h-full gap-3 shadow-sm text-slate-900">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Warp State Sync</span>
            <button 
              onClick={handleTriggerPurgeJob}
              className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-900 text-white font-bold border border-slate-700 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm shadow-indigo-100"
            >
              <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Simulate Daily Cleanup Job 🧹</span>
            </button>
            <div className="text-[10px] text-slate-400 text-center font-mono">
              Enforcing secure background sweeps
            </div>
          </div>

        </div>

        {/* LEDGER ACTIVE SEARCH BAR */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search tenant storage index (e.g. .webp, pdf, guideline)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 font-medium placeholder-slate-400 flex-1 focus:outline-none"
          />
        </div>

        {/* THE ACTIVE LEDGER REGISTER ROWS */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white text-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Asset Metadata / Entity Name</th>
                  <th className="p-3.5">Category Tipo</th>
                  <th className="p-3.5">Original / Optimized (Compact)</th>
                  <th className="p-3.5">Lifetime SLA Status</th>
                  <th className="p-3.5 text-right pr-5">Execution Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredAssets.map((asset) => {
                  // Calculate time remaining with warp offset hours injected
                  let isExpired = false;
                  let timeLeftStr = 'Retained Forever (Durable Key)';
                  
                  if (!asset.isPermanent && asset.expiresAt) {
                    const elapsedSinceUploadHours = timeWarpOffsetHours;
                    const diffMs = new Date(asset.expiresAt).getTime() - (Date.now() + elapsedSinceUploadHours * 3600000);
                    
                    if (diffMs <= 0) {
                      isExpired = true;
                      timeLeftStr = 'EXPIRED (Reclamation pending sweeping cron)';
                    } else {
                      const diffHours = Math.floor(diffMs / 3600000);
                      const diffMins = Math.floor((diffMs % 3600000) / 60000);
                      if (diffHours >= 24) {
                        timeLeftStr = `Expires in ${Math.floor(diffHours/24)}d ${diffHours%24}h`;
                      } else {
                        timeLeftStr = `Expires in ${diffHours}h ${diffMins}m`;
                      }
                    }
                  }

                  return (
                    <tr 
                      key={asset.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isExpired ? 'opacity-40 bg-slate-50 line-through decoration-slate-300' : ''
                      }`}
                    >
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3.5">
                          {asset.thumbnailUrl ? (
                            <img 
                              src={asset.thumbnailUrl} 
                              alt="Thumbnail" 
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 shadow-xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 font-bold font-mono">
                              {asset.format}
                            </div>
                          )}
                          <div className="max-w-[180px] sm:max-w-xs md:max-w-md overflow-hidden text-ellipsis">
                            <h4 className="font-bold text-slate-800 truncate tracking-tight py-0.5">{asset.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <span>Uploaded:</span>
                              <strong>{asset.uploadedAt.toLocaleString()}</strong>
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3.5">
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded border uppercase font-bold tracking-tight ${
                          asset.category === 'metadata' 
                            ? 'bg-slate-50 text-slate-600 border-slate-200' 
                            : asset.category === 'image'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {asset.category}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-slate-400 line-through">{formatBytes(asset.originalSize)}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          <span className="font-extrabold text-slate-800">{formatBytes(asset.optimizedSize)}</span>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-600 mt-1 block font-bold">
                          -{Math.round(((asset.originalSize - asset.optimizedSize) / asset.originalSize) * 100)}% Compressed
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {!asset.isPermanent && !isExpired ? (
                            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          ) : asset.isPermanent ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                          <div>
                            <span className={`font-bold tracking-tight rounded text-[11px] font-medium leading-none block ${
                              asset.isPermanent 
                                ? 'text-emerald-700 font-sans' 
                                : isExpired 
                                  ? 'text-rose-600' 
                                  : 'text-slate-600'
                            }`}>
                              {timeLeftStr}
                            </span>
                            {!asset.isPermanent && !isExpired && (
                              <span className="text-[8px] text-slate-400 font-mono mt-0.5 block uppercase tracking-wider font-semibold">
                                Temp Space • SLA threshold
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-right pr-5">
                        <div className="flex justify-end gap-1.5">
                          {!asset.isPermanent && !isExpired && (
                            <button
                              onClick={() => handleMakePermanent(asset.id)}
                              className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-[10px] flex items-center gap-1 border border-indigo-100 transition cursor-pointer"
                              title="Convert to Permanent Secure State"
                            >
                              <Save className="w-3 h-3 text-indigo-600" />
                              <span>Save Asset Permanently🔒</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-200 hover:border-rose-100 cursor-pointer"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-mono">
                      No matching storage metadata entities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 5. BACKGROUND LIFECYCLE MONITORING AUDIT TRAILS (DAILY PURGE HISTORY) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="font-bold text-sm select-none">Automated Storage Retention Monitoring Audit</h3>
          </div>
          <span className="text-[9px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">
            Background Sweep Realtime Logger
          </span>
        </div>
        
        <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
          {storageAuditLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <span className={`font-mono text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${log.badgeColor}`}>
                {log.action}
              </span>
              <div className="space-y-1 flex-1">
                <p className="text-slate-300 leading-relaxed font-sans">{log.details}</p>
                <span className="text-[9px] text-slate-500 font-mono block">
                  Executed timestamps: {log.timestamp.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
