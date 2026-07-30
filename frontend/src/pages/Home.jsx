import HeroSection from "../components/home/HeroSection";
import WhyQinertSection from "../components/home/WhyQinertSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import DeveloperExperienceSection from "../components/home/DeveloperExperienceSection";
import TechStackSection from "../components/home/TechStackSection";
import CTASection from "../components/home/CTASection";
import StorytellingTour from "../components/home/StorytellingTour";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-grid-pattern min-h-screen text-text-main font-sans selection:bg-primary-500/30 relative">
      {/* Global Ambient Kinetic Energy Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] bg-[radial-gradient(circle_at_center,rgba(15,98,254,0.03)_0%,rgba(94,43,255,0.02)_40%,transparent_70%)] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-[radial-gradient(circle_at_center,rgba(138,63,252,0.03)_0%,rgba(51,177,255,0.02)_50%,transparent_70%)] rounded-full mix-blend-screen" />
        
        {/* Animated ambient particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              background: i % 2 === 0 ? 'var(--color-primary-500)' : 'var(--color-secondary-500)',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3 + 0.1,
              boxShadow: `0 0 10px ${i % 2 === 0 ? 'var(--color-primary-500)' : 'var(--color-secondary-500)'}`
            }}
            animate={{
              y: [0, Math.random() * -100 - 50],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0, Math.random() * 0.5 + 0.2, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <HeroSection />
        <WhyQinertSection />
        <HowItWorksSection />
        <DeveloperExperienceSection />
        <TechStackSection />
        <CTASection />
      </div>
      <StorytellingTour />
    </div>
  );
}
