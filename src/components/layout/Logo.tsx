export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="180"
      height="36"
      viewBox="0 0 180 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ThreadShare"
      className={className}
    >
      {/*
        Wordmark-only logo — clean geometric sans-serif
        "Thread" full opacity · "Share" at 50% opacity
        A small accent dot sits above the "T" as a brand mark
      */}

      {/* Accent dot — sits above the T, acts as the brand mark */}
      <circle cx="6" cy="5" r="3" fill="currentColor" opacity="0.9" />

      {/* "Thread" — full weight */}
      <text
        x="0"
        y="28"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="24"
        fontWeight="800"
        letterSpacing="-0.8"
        fill="currentColor"
      >
        Thread
      </text>

      {/* "Share" — lighter weight, reduced opacity for two-tone effect */}
      <text
        x="84"
        y="28"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="24"
        fontWeight="400"
        letterSpacing="-0.4"
        fill="currentColor"
        opacity="0.4"
      >
        Share
      </text>
    </svg>
  );
}
