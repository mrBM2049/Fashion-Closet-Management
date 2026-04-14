export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="220"
      height="52"
      viewBox="0 0 220 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ThreadShare"
      className={className}
    >
      {/* Spool — top flange */}
      <rect x="3" y="3" width="30" height="8" rx="4" fill="currentColor" />
      {/* Spool — bottom flange */}
      <rect x="3" y="34" width="30" height="8" rx="4" fill="currentColor" />
      {/* Spool — body */}
      <rect x="6" y="10" width="24" height="25" rx="2" fill="currentColor" />
      {/* Thread wrap lines */}
      <line x1="13" y1="10" x2="13" y2="35" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
      <line x1="18" y1="10" x2="18" y2="35" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
      <line x1="23" y1="10" x2="23" y2="35" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
      {/* Thread arc off spool */}
      <path d="M33 22 Q42 10 48 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Needle eye */}
      <circle cx="48" cy="22" r="2" fill="currentColor" />

      {/* Wordmark — "Thread" */}
      <text
        x="58"
        y="33"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        Thread
      </text>
      {/* Wordmark — "Share" in muted color */}
      <text
        x="131"
        y="33"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="-0.5"
        fill="currentColor"
        opacity="0.45"
      >
        Share
      </text>
    </svg>
  );
}
