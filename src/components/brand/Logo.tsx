interface LogoProps {
  size?: number
  className?: string
}

/** كرة طائرة بأعمدة بيانية صاعدة بداخلها ونقطة برتقالية عند القمة */
export function Logo({ size = 28, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="مُحلّل"
    >
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#logo-g)" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#fff" strokeWidth="3" />
      <path d="M18,50 Q50,24 82,50" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.85" />
      <path d="M18,50 Q50,76 82,50" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.85" />
      <rect x="35" y="52" width="7" height="14" rx="2" fill="#fff" />
      <rect x="45" y="44" width="7" height="22" rx="2" fill="#fff" />
      <rect x="55" y="35" width="7" height="31" rx="2" fill="#fff" />
      <circle cx="58.5" cy="33" r="4.5" fill="#F97316" stroke="#060B18" strokeWidth="1" />
    </svg>
  )
}
