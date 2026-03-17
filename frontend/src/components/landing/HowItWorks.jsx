import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Transaction Initiated',
    description:
      'User submits a deposit, withdrawal, or transfer via the REST API.',
  },
  {
    number: '02',
    title: 'Risk Engine Analyzes',
    description:
      'Five fraud rules evaluate in parallel: amount, velocity, time of day, account age, and transfer patterns.',
  },
  {
    number: '03',
    title: 'Score Calculated',
    description:
      'Risk score determines outcome: auto-approve, log and approve, flag for review, or block entirely.',
  },
  {
    number: '04',
    title: 'Admin Reviews',
    description:
      'Flagged transactions appear in the admin dashboard for manual approval or rejection.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

export default function HowItWorks() {
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      style={{
        padding: '120px 24px',
        background: 'var(--bg-secondary)',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 12,
          }}
        >
          Process
        </p>

        {/* Section Title */}
        <h2
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 64,
            lineHeight: 1.25,
          }}
        >
          How Fraud Detection Works
        </h2>

        {/* Timeline */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: isMobile ? 16 : 32,
              }}
            >
              {/* Left side: number + vertical line */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                  width: isMobile ? 48 : 72,
                }}
              >
                {/* Step number */}
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: isMobile ? 32 : 48,
                    fontWeight: 700,
                    color: 'var(--accent)',
                    opacity: 0.3,
                    lineHeight: 1,
                    userSelect: 'none',
                    flexShrink: 0,
                  }}
                >
                  {step.number}
                </span>

                {/* Vertical connector line */}
                {index < steps.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 24,
                      background: 'var(--accent)',
                      opacity: 0.15,
                      borderRadius: 1,
                    }}
                  />
                )}
              </div>

              {/* Right side: card */}
              <div
                style={{
                  flex: 1,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  marginBottom: index < steps.length - 1 ? 20 : 0,
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 17,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: 1.35,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.65,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
