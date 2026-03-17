import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import IntroAnimation from '../components/landing/IntroAnimation';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Architecture from '../components/landing/Architecture';
import TechStack from '../components/landing/TechStack';
import Footer from '../components/landing/Footer';

/* ── Scroll-animated section wrapper ── */
function AnimatedSection({ id, children, style }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px 0px' });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        width: '100%',
        ...style,
      }}
    >
      {children}
    </motion.section>
  );
}

export default function LandingPage() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Intro animation plays first ── */}
      <IntroAnimation onComplete={() => setIntroComplete(true)} />

      {/* ── Main content fades in after intro ── */}
      <AnimatePresence>
        {introComplete && (
          <motion.div
            key="landing-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <Navbar />

            <main>
              <AnimatedSection id="hero">
                <Hero />
              </AnimatedSection>

              <AnimatedSection id="features">
                <Features />
              </AnimatedSection>

              <AnimatedSection id="how-it-works">
                <HowItWorks />
              </AnimatedSection>

              <AnimatedSection id="architecture">
                <Architecture />
              </AnimatedSection>

              <AnimatedSection id="tech-stack">
                <TechStack />
              </AnimatedSection>
            </main>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
