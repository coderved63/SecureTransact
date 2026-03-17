import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DURATION = 2800;
const SESSION_KEY = 'st-intro-played';

/* ─── Shield SVG path (clean geometric shield with checkmark) ─── */
const SHIELD_PATH =
  'M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z';
const CHECK_PATH = 'M9 12.5l2 2 4.5-4.5';
const SHIELD_STROKE_LEN = 62;
const CHECK_STROKE_LEN = 12;

/* ─── Brand name split into letters ─── */
const BRAND = 'SecureTransact';

export default function IntroAnimation({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0); // 0=draw, 1=fill, 2=text, 3=line, 4=exit

  useEffect(() => {
    // Skip if already played this session
    if (sessionStorage.getItem(SESSION_KEY)) {
      setVisible(false);
      onComplete?.();
      return;
    }

    const timers = [
      setTimeout(() => setPhase(1), 500),    // shield fill
      setTimeout(() => setPhase(2), 900),    // text reveal
      setTimeout(() => setPhase(3), 1500),   // line expand
      setTimeout(() => setPhase(4), 2100),   // exit
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem(SESSION_KEY, '1');
        onComplete?.();
      }, DURATION),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            overflow: 'hidden',
          }}
        >
          {/* ── Dot grid background ── */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle, var(--border-light) 0.8px, transparent 0.8px)`,
            backgroundSize: '28px 28px',
            opacity: phase >= 1 ? 0.5 : 0.2,
            transition: 'opacity 0.8s ease-out',
            maskImage: 'radial-gradient(ellipse 50% 50% at center, black 30%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at center, black 30%, transparent 70%)',
          }} />

          {/* ── Outer glow ring ── */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={phase >= 1
              ? { scale: 1, opacity: 0.12 }
              : { scale: 0.6, opacity: 0 }
            }
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Main content (scales down on exit) ── */}
          <motion.div
            animate={phase >= 4
              ? { scale: 0.85, opacity: 0, y: -20 }
              : { scale: 1, opacity: 1, y: 0 }
            }
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* ── Shield SVG ── */}
            <svg
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              style={{ overflow: 'visible' }}
            >
              {/* Shield outline — stroke draw animation */}
              <motion.path
                d={SHIELD_PATH}
                stroke="var(--accent)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ strokeDasharray: SHIELD_STROKE_LEN, strokeDashoffset: SHIELD_STROKE_LEN }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              />

              {/* Shield fill — fades in */}
              <motion.path
                d={SHIELD_PATH}
                fill="url(#shieldGradient)"
                initial={{ opacity: 0 }}
                animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />

              {/* Checkmark — draws after fill */}
              <motion.path
                d={CHECK_PATH}
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ strokeDasharray: CHECK_STROKE_LEN, strokeDashoffset: CHECK_STROKE_LEN, opacity: 0 }}
                animate={phase >= 1
                  ? { strokeDashoffset: 0, opacity: 1 }
                  : { strokeDashoffset: CHECK_STROKE_LEN, opacity: 0 }
                }
                transition={{ duration: 0.4, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--accent-hover)" />
                </linearGradient>
              </defs>
            </svg>

            {/* ── Brand name — letter-by-letter ── */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 0,
              marginTop: 28,
              height: 36,
              overflow: 'hidden',
            }}>
              {BRAND.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={phase >= 2
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 14 }
                  }
                  transition={{
                    duration: 0.3,
                    delay: i * 0.035,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: i === 6 ? '0.02em' : '-0.01em', // slight gap before "T"
                    display: 'inline-block',
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* ── Tagline ── */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 400,
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: 8,
              }}
            >
              Transaction Security
            </motion.p>

            {/* ── Expanding line ── */}
            <div style={{
              position: 'relative',
              width: 200,
              height: 1,
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={phase >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  width: '100%',
                  height: 1,
                  background: `linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%)`,
                  transformOrigin: 'center',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
