import React, { useState, useEffect } from 'react';
import { getPlatformLogoSettings, PlatformLogoSettings, DEFAULT_PLATFORM_LOGOS } from '../lib/platformBranding';

interface LogoProps {
  className?: string;
  glow?: boolean;
  showTagline?: boolean;
  showText?: boolean;
  variant?: 'emblem' | 'full' | 'horizontal' | 'header';
  alt?: string;
}

export function usePlatformLogo() {
  const [logos, setLogos] = useState<PlatformLogoSettings>(getPlatformLogoSettings);

  useEffect(() => {
    const handleUpdate = () => {
      setLogos(getPlatformLogoSettings());
    };

    window.addEventListener('platform_logo_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('platform_logo_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return logos;
}

/**
 * MarketForge OS Emblem Logo Mark
 */
export const MarketForgeEmblem: React.FC<{ className?: string; glow?: boolean }> = ({ 
  className = "w-9 h-9", 
  glow = true 
}) => {
  const logos = usePlatformLogo();
  const [imgSrc, setImgSrc] = useState(logos.emblemUrl);

  useEffect(() => {
    setImgSrc(logos.emblemUrl);
  }, [logos.emblemUrl]);

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img 
        src={imgSrc} 
        alt="MarketForge OS Emblem" 
        onError={() => setImgSrc(DEFAULT_PLATFORM_LOGOS.emblemUrl)}
        className={`w-full h-full object-contain ${glow ? 'drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]' : ''}`}
      />
    </div>
  );
};

/**
 * MarketForge OS Dynamic Logo Component
 */
export const MarketForgeLogo: React.FC<LogoProps> = ({ 
  className, 
  glow = true,
  showTagline = false,
  showText = true,
  variant = 'horizontal',
  alt = 'MarketForge OS'
}) => {
  const logos = usePlatformLogo();

  if (variant === 'emblem') {
    return <MarketForgeEmblem className={className} glow={glow} />;
  }

  if (variant === 'full') {
    const [fullSrc, setFullSrc] = useState(logos.fullLogoUrl);

    useEffect(() => {
      setFullSrc(logos.fullLogoUrl);
    }, [logos.fullLogoUrl]);

    return (
      <div className={className || "w-full flex items-center justify-center"}>
        <img 
          src={fullSrc} 
          alt={alt} 
          onError={() => setFullSrc(DEFAULT_PLATFORM_LOGOS.fullLogoUrl)}
          className={`w-full h-auto object-contain max-w-full ${glow ? 'filter drop-shadow-[0_10px_30px_rgba(56,189,248,0.35)]' : ''}`}
        />
      </div>
    );
  }

  // Horizontal/Header Logo for top navigation bars (Image + High-Contrast Brand Text)
  const [headerSrc, setHeaderSrc] = useState(logos.headerLogoUrl);

  useEffect(() => {
    setHeaderSrc(logos.headerLogoUrl);
  }, [logos.headerLogoUrl]);

  const defaultImageClass = className || "h-9 md:h-11 w-auto max-h-14 object-contain";
  const brandName = logos.brandName || 'MarketForge OS';
  const taglineText = logos.tagline || 'A TRUE BUSINESS TRANSFORMATION';
  const displayHeaderText = showText && logos.showTextInHeader !== false;

  return (
    <div className="inline-flex items-center gap-2.5 shrink-0 select-none">
      {/* Header Logo Image / Asset */}
      <img 
        src={headerSrc} 
        alt={alt} 
        onError={() => setHeaderSrc(DEFAULT_PLATFORM_LOGOS.headerLogoUrl)}
        className={`${defaultImageClass} ${glow ? 'filter drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]' : ''}`}
      />

      {/* High-Visibility Crisp Brand Typography + Tagline */}
      {displayHeaderText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1">
            <span className="text-lg md:text-xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-sans">
              {brandName.includes('MarketForge') ? (
                <>
                  MarketForge <span className="text-cyan-400 font-black">OS</span>
                </>
              ) : (
                <span className="text-cyan-300 font-black">{brandName}</span>
              )}
            </span>
          </div>
          <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider mt-0.5">
            {taglineText}
          </span>
        </div>
      )}
    </div>
  );
};

export default MarketForgeLogo;
