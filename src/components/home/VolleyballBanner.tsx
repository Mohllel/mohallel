/** غلاف افتراضي لكرة الطائرة — يُستخدم إلى أن يرفع النادي صورته الخاصة من الإعدادات */
export function VolleyballBanner() {
  return (
    <svg viewBox="0 0 600 220" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="banner-bg" x1="0" y1="0" x2="600" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
        <radialGradient id="banner-glow" cx="0.72" cy="0.4" r="0.55">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="600" height="220" fill="url(#banner-bg)" />
      <rect width="600" height="220" fill="url(#banner-glow)" />

      {/* أرضية الملعب */}
      <path d="M0,190 Q300,165 600,190 L600,220 L0,220 Z" fill="#ffffff" opacity="0.06" />
      <path d="M0,196 Q300,172 600,196" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />

      {/* شبكة الإرسال */}
      <line x1="70" y1="140" x2="70" y2="196" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
      <line x1="70" y1="140" x2="230" y2="150" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={i}
          x1={70 + i * 20}
          y1={140 + i * 1.2}
          x2={70 + i * 20}
          y2={196}
          stroke="#ffffff"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
      ))}

      {/* الكرة */}
      <g transform="translate(430,95)">
        <circle r="62" fill="#ffffff" opacity="0.97" />
        <circle r="62" fill="none" stroke="#1e3a8a" strokeOpacity="0.15" strokeWidth="2" />
        <path d="M-44,-30 Q0,-58 44,-30" fill="none" stroke="#2563eb" strokeWidth="4" opacity="0.85" />
        <path d="M-44,30 Q0,58 44,30" fill="none" stroke="#2563eb" strokeWidth="4" opacity="0.85" />
        <path d="M-58,-6 Q-20,0 -58,10" fill="none" stroke="#f97316" strokeWidth="4" opacity="0.9" />
        <path d="M58,-6 Q20,0 58,10" fill="none" stroke="#f97316" strokeWidth="4" opacity="0.9" />
        <circle r="62" fill="none" stroke="#1e3a8a" strokeWidth="1.5" opacity="0.2" />
      </g>

      {/* خطوط حركة */}
      <path d="M330,60 Q380,40 425,55" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      <path d="M340,78 Q385,64 418,72" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
