/* Produce illustrations for the onboarding flow, ported from the design.
   Pure inline SVG — no assets, no dependencies. */

/** FreshKart leaf mark used in the welcome header. */
export function BrandLeaf({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3C8 6 6.5 10 6.5 14a5.5 5.5 0 0 0 11 0c0-4-1.5-8-5.5-11Z"
        fill="#22C55E"
      />
      <path
        d="M12 8v9"
        stroke="#0A5C2E"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Hero crate of produce on the welcome screen. */
export function HeroProduce({ className }: { className?: string }) {
  return (
    <svg
      width="300"
      height="260"
      viewBox="0 0 300 260"
      fill="none"
      className={className}
    >
      <circle cx="150" cy="118" r="104" fill="#16A34A" opacity="0.5" />
      <circle cx="150" cy="118" r="72" fill="#22C55E" opacity="0.45" />
      {/* leafy bunch */}
      <g transform="translate(150 56)">
        <ellipse cx="-16" cy="0" rx="15" ry="8" transform="rotate(-32 -16 0)" fill="#2FA34B" />
        <ellipse cx="16" cy="0" rx="15" ry="8" transform="rotate(32 16 0)" fill="#27913F" />
        <ellipse cx="0" cy="-8" rx="13" ry="7" fill="#3CB85A" />
      </g>
      {/* lemon */}
      <ellipse cx="196" cy="132" rx="38" ry="33" fill="#FFC233" />
      <ellipse cx="184" cy="120" rx="11" ry="7" fill="#FFD86B" opacity="0.8" />
      {/* tomato */}
      <circle cx="112" cy="124" r="44" fill="#FF5E3A" />
      <ellipse cx="98" cy="108" rx="13" ry="8" fill="#FF8A6B" opacity="0.75" />
      <g transform="translate(112 88)" fill="#2E7D32">
        <ellipse cx="-9" cy="0" rx="9" ry="4" transform="rotate(-28 -9 0)" />
        <ellipse cx="9" cy="0" rx="9" ry="4" transform="rotate(28 9 0)" />
        <ellipse cx="0" cy="-3" rx="8" ry="4" />
      </g>
      {/* crate */}
      <path
        d="M64 150 L236 150 L218 232 Q216 242 206 242 L94 242 Q84 242 82 232 Z"
        fill="#CE8A45"
      />
      <path d="M64 150 L236 150 L232 172 L68 172 Z" fill="#E2A35C" />
      <g stroke="#B0732F" strokeWidth="3" opacity="0.6">
        <path d="M108 172 L102 240" />
        <path d="M150 172 L150 242" />
        <path d="M192 172 L198 240" />
      </g>
      <rect x="60" y="146" width="180" height="10" rx="5" fill="#E2A35C" />
      {/* chilli accent */}
      <path d="M232 150 q22 -4 30 -26 q-22 6 -30 26Z" fill="#1E9E45" />
    </svg>
  );
}

/** Soft floating lemon (mobile-number screen). */
export function FloatingLemon() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="40" fill="#FFE7AE" />
      <ellipse cx="60" cy="60" rx="26" ry="22" fill="#FFC233" />
    </svg>
  );
}

/** Soft floating tomato (verify-code screen). */
export function FloatingTomato() {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
      <circle cx="55" cy="60" r="34" fill="#FF5E3A" />
      <ellipse cx="46" cy="50" rx="10" ry="6" fill="#FF8A6B" opacity=".7" />
    </svg>
  );
}

/** Celebration check badge with two orbiting fruits (all-set screen). */
export function SuccessBadge() {
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-white/10" />
      <div className="flex h-[108px] w-[108px] items-center justify-center rounded-full bg-[#FFC233] shadow-[0_12px_30px_rgba(0,0,0,.25)]">
        <svg width="52" height="52" viewBox="0 0 52 52">
          <path
            d="M14 27l9 9 16-19"
            stroke="#0A5C2E"
            strokeWidth="5.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="absolute left-2.5 top-1.5 animate-floaty">
        <svg width="30" height="30" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12" fill="#FF5E3A" />
        </svg>
      </div>
      <div className="absolute bottom-2 right-1.5 animate-floaty-slow">
        <svg width="26" height="26" viewBox="0 0 26 26">
          <ellipse cx="13" cy="13" rx="12" ry="10" fill="#22C55E" />
        </svg>
      </div>
    </div>
  );
}

/** Map pin used in the delivery-area control. */
export function PinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7Z"
        fill="#129E47"
      />
      <circle cx="12" cy="9" r="2.5" fill="#fff" />
    </svg>
  );
}
