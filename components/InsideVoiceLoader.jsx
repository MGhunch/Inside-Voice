/**
 * InsideVoiceLoader
 * 
 * Animated logo loader for Inside Voice Hub.
 * Four formations: Logo → Person → Arrow → Tower → Logo
 * 
 * Usage:
 *   <InsideVoiceLoader />
 *   <InsideVoiceLoader size={120} />
 *   <InsideVoiceLoader size={80} speed="fast" />
 */

export default function InsideVoiceLoader({ size = 100, speed = "normal" }) {
  const duration = speed === "fast" ? 8 : speed === "slow" ? 16 : 12;

  return (
    <svg
      width={size}
      height={size * 0.825}
      viewBox="0 0 200 165"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Loading"
    >
      <style>{`
        @keyframes iv-circle {
          0%, 15% { transform: translate(0, 0); }
          26%, 40% { transform: translate(0, 36px); }
          51%, 65% { transform: translate(0, 0); }
          76%, 90% { transform: translate(0, 36px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes iv-square {
          0%, 15% { transform: translate(0, 0); }
          26%, 40% { transform: translate(0, 36px); }
          51%, 65% { transform: translate(0, 0); }
          76%, 90% { transform: translate(0, -36px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes iv-triangle {
          0%, 15% { transform: translate(0, 0) rotate(0deg); }
          26%, 40% { transform: translate(-36px, -24px) rotate(180deg); }
          51%, 65% { transform: translate(-6px, 6px) rotate(270deg); }
          76%, 90% { transform: translate(-36px, 36px) rotate(360deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
        .iv-c { animation: iv-circle ${duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .iv-s { animation: iv-square ${duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .iv-t { animation: iv-triangle ${duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite; transform-origin: 136px 54px; }
      `}</style>

      <g className="iv-c">
        <circle cx="100" cy="18" r="18" fill="#00CEB4" />
      </g>
      <g className="iv-s">
        <rect x="82" y="36" width="36" height="36" fill="#584E9F" />
      </g>
      <g className="iv-t">
        <polygon points="118,36 154,36 136,72" fill="#FEC514" />
      </g>
    </svg>
  );
}
