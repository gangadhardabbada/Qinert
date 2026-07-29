import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { ArrowRight, BookOpen } from "@phosphor-icons/react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-text-main leading-[1.1]">
            Quantum Authentication<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-secondary-500">
              Built for Modern Security
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-muted max-w-xl leading-relaxed">
            Qinert uses the BB84 Quantum Key Distribution with upgraded security to establish secure authentication while detecting eavesdropping attempts before trust is established.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button size="lg" className="bg-primary-500 hover:bg-primary-400 hover:shadow-[0_0_20px_rgba(15,98,254,0.4)] transition-all text-white font-medium rounded-sm px-8" endContent={<ArrowRight size={18} />}>
              Get Started
            </Button>
            <Button size="lg" variant="bordered" className="border-secondary-500/50 text-text-main font-medium rounded-sm px-8 hover:bg-secondary-900/50 hover:border-secondary-400 hover:shadow-[0_0_20px_rgba(138,63,252,0.2)] transition-all" startContent={<BookOpen size={18} />}>
              Documentation
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col gap-4">
            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Powered by</p>
            <div className="flex flex-wrap gap-4 text-text-muted/60 text-sm font-mono items-center">
              <span>React</span>
              <span className="w-1 h-1 rounded-full bg-border-subtle" />
              <span>Flask</span>
              <span className="w-1 h-1 rounded-full bg-border-subtle" />
              <span>Qiskit</span>
              <span className="w-1 h-1 rounded-full bg-border-subtle" />
              <span>Supabase</span>
              <span className="w-1 h-1 rounded-full bg-border-subtle" />
              <span>HeroUI</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Afrofuturistic Quantum Centerpiece */}
        <div className="relative h-150 w-full flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="relative w-125 h-125 flex items-center justify-center"
          >
            {/* Magnetic Energy Field */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(94,43,255,0.15)_0%,transparent_60%)] animate-pulse" style={{ animationDuration: '4s' }} />

            {/* Kinetic Outer Rings */}
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.02, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear", scale: { duration: 5, repeat: Infinity } }}
              className="absolute inset-5 border border-secondary-500/30 rounded-full border-dashed"
            />
            <motion.div 
              animate={{ rotate: -360, scale: [1, 1.05, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear", scale: { duration: 6, repeat: Infinity } }}
              className="absolute inset-15 border-2 border-primary-500/20 rounded-full shadow-[inset_0_0_20px_rgba(15,98,254,0.1)]"
            />
            
            {/* Inner Glowing Lattice Mesh */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-25 rounded-full overflow-hidden mask-[radial-gradient(circle,black,transparent)]"
            >
              <div className="w-[150%] h-[150%] top-[-25%] left-[-25%] absolute opacity-30 bg-hex-pattern" />
            </motion.div>

            {/* Core Photon Streams */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500">
              <defs>
                <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary-400)" stopOpacity="0" />
                  <stop offset="50%" stopColor="var(--color-secondary-400)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--color-accent-400)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[...Array(3)].map((_, i) => (
                <motion.ellipse
                  key={`stream-${i}`}
                  cx="250" cy="250" rx="140" ry="40"
                  fill="none"
                  stroke="url(#streamGrad)"
                  strokeWidth="2"
                  animate={{ rotate: [i * 60, i * 60 + 360] }}
                  transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "center" }}
                />
              ))}
            </svg>

            {/* Central Multiverse Quantum Core */}
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 40px rgba(138, 63, 252, 0.4), inset 0 0 20px rgba(15, 98, 254, 0.6)",
                  "0 0 80px rgba(138, 63, 252, 0.6), inset 0 0 40px rgba(15, 98, 254, 0.8)",
                  "0 0 40px rgba(138, 63, 252, 0.4), inset 0 0 20px rgba(15, 98, 254, 0.6)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-50 bg-linear-to-br from-secondary-500 via-background-main to-primary-600 rounded-full z-20 flex items-center justify-center border border-secondary-400/50"
            >
              {/* Inner singularity */}
              <div className="w-12 h-12 bg-white rounded-full blur-[2px] opacity-90 shadow-[0_0_30px_#fff]" />
            </motion.div>
            
            {/* Interconnected Nodes */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`node-${i}`}
                className="absolute inset-0 pointer-events-none z-30"
                style={{ transformOrigin: "center" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 25 - i * 2, repeat: Infinity, ease: "linear", delay: i }}
              >
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary-300 rounded-full shadow-[0_0_15px_#3385ff] border border-white" />
              </motion.div>
            ))}
            
          </motion.div>
        </div>

      </div>
    </section>
  );
}
