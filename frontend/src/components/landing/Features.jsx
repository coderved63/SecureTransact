import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Wallet, ArrowLeftRight, Shield, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Multi-Account Management',
    description:
      'Open savings and checking accounts instantly. Track balances in real time across all your accounts.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Instant Transactions',
    description:
      'Send deposits, withdrawals, and transfers with confidence. Every transaction is validated and processed atomically.',
  },
  {
    icon: Shield,
    title: 'Intelligent Fraud Detection',
    description:
      'Suspicious activity is caught before it causes harm. Every transaction is scored against multiple risk signals in real time.',
  },
  {
    icon: BarChart3,
    title: 'Admin Control Center',
    description:
      'Live dashboard with transaction metrics, risk case management, and a full audit log of every system action.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Features() {
  const [columns, setColumns] = useState(2);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setColumns(mobile ? 1 : 2);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      style={{
        padding: isMobile ? '72px 20px' : '120px 24px',
        background: 'var(--bg-primary)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
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
          Features
        </p>

        {/* Section Title */}
        <h2
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 26 : 36,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: isMobile ? 40 : 60,
            lineHeight: 1.25,
          }}
        >
          Built for Modern Banking
        </h2>

        {/* Feature Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: columns === 2 ? '1fr 1fr' : '1fr',
            gap: 20,
          }}
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }) {
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: window.innerWidth <= 768 ? 24 : 32,
        cursor: 'default',
        transition: 'background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
        boxShadow: hovered ? 'var(--shadow-md)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        overflow: 'hidden',
      }}
    >
      {/* Top gradient line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          background:
            'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)',
        }}
      />

      {/* Icon circle */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--accent-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={22} style={{ color: 'var(--accent)' }} />
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginTop: 20,
          marginBottom: 0,
          lineHeight: 1.35,
        }}
      >
        {feature.title}
      </h3>

      {/* Description */}
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
        {feature.description}
      </p>
    </motion.div>
  );
}
