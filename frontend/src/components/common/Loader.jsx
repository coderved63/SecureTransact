import { Shield } from 'lucide-react';

/* CSS keyframes injected once */
const keyframes = `
@keyframes loader-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
}
@keyframes loader-spin {
  to { transform: rotate(360deg); }
}
@keyframes loader-ring {
  0% { opacity: 0.15; transform: scale(0.8); }
  50% { opacity: 0.08; transform: scale(1.1); }
  100% { opacity: 0.15; transform: scale(0.8); }
}
`;

/**
 * Full-page loader with pulsing shield logo
 */
export default function Loader() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      zIndex: 9999,
    }}>
      <style>{keyframes}</style>

      {/* Pulse rings */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: '1.5px solid var(--accent)',
          animation: 'loader-ring 2s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: 110,
          height: 110,
          borderRadius: '50%',
          border: '1px solid var(--accent)',
          animation: 'loader-ring 2s ease-in-out infinite 0.3s',
        }} />

        {/* Shield icon */}
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'loader-pulse 1.8s ease-in-out infinite',
          boxShadow: 'var(--shadow-accent)',
        }}>
          <Shield size={24} color="#fff" strokeWidth={2.2} />
        </div>
      </div>

      <p style={{
        marginTop: 28,
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        color: 'var(--text-muted)',
        letterSpacing: '0.04em',
      }}>
        Loading...
      </p>
    </div>
  );
}

/**
 * Small inline spinner for buttons and inline loading states
 */
export function Spinner({ size = 16, color = 'currentColor' }) {
  return (
    <>
      <style>{keyframes}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: 'loader-spin 0.7s linear infinite', flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </>
  );
}
