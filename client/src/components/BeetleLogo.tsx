interface BeetleLogoProps {
  className?: string;
  size?: number;
}

export default function BeetleLogo({ className = "", size = 40 }: BeetleLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Beetle Body */}
      <ellipse cx="32" cy="38" rx="12" ry="18" fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="2"/>
      
      {/* Head */}
      <ellipse cx="32" cy="18" rx="8" ry="6" fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="2"/>
      
      {/* Left Wing */}
      <ellipse cx="22" cy="32" rx="8" ry="14" fill="#D4A942" stroke="currentColor" strokeWidth="2" transform="rotate(-15 22 32)"/>
      <path d="M18 25 L26 25 M18 30 L26 30 M18 35 L26 35 M18 40 L26 40" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
      
      {/* Right Wing */}
      <ellipse cx="42" cy="32" rx="8" ry="14" fill="#D4A942" stroke="currentColor" strokeWidth="2" transform="rotate(15 42 32)"/>
      <path d="M38 25 L46 25 M38 30 L46 30 M38 35 L46 35 M38 40 L46 40" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
      
      {/* Antennae */}
      <path d="M28 15 Q25 10 22 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M36 15 Q39 10 42 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="22" cy="8" r="2" fill="#D4A942"/>
      <circle cx="42" cy="8" r="2" fill="#D4A942"/>
      
      {/* Legs */}
      <path d="M20 45 Q15 50 12 55" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M25 50 Q20 55 18 60" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M32 52 Q32 57 32 62" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M39 50 Q44 55 46 60" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M44 45 Q49 50 52 55" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      
      {/* Body Details */}
      <line x1="32" y1="25" x2="32" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <ellipse cx="32" cy="30" rx="3" ry="2" fill="currentColor" opacity="0.3"/>
      <ellipse cx="32" cy="40" rx="4" ry="2" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}
