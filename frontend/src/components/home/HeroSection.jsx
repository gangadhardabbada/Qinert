import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { ArrowRight, BookOpen } from "@phosphor-icons/react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 px-6 overflow-hidden bg-background-main">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border-subtle rounded-full text-xs font-mono-data text-primary-500 w-fit mb-4">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            QPS/1.0 Protocol Active
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-text-main leading-[1.1]">
            Qonsole<br />
            <span className="text-primary-500">
              Built for Modern Security
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-muted max-w-xl leading-relaxed mt-2">
            Qinert uses the BB84 Quantum Key Distribution with upgraded security to establish secure authentication while detecting eavesdropping attempts before trust is established.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md px-8 h-12 border border-transparent transition-all" endContent={<ArrowRight size={18} />}>
              Get Started
            </Button>
            <Button size="lg" variant="bordered" className="bg-surface border-border-subtle text-text-main font-medium rounded-md px-8 h-12 hover:border-primary-400 hover:text-primary-500 transition-all" startContent={<BookOpen size={18} />}>
              Documentation
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col gap-4">
            <p className="text-sm font-mono-data text-text-muted uppercase tracking-wider">Powered by</p>
            <div className="flex flex-wrap gap-4 text-text-muted/80 text-sm font-mono-data items-center">
              <span>React</span>
              <span className="w-1 h-1 bg-border-subtle" />
              <span>Flask</span>
              <span className="w-1 h-1 bg-border-subtle" />
              <span>Qiskit</span>
              <span className="w-1 h-1 bg-border-subtle" />
              <span>Supabase</span>
              <span className="w-1 h-1 bg-border-subtle" />
              <span>HeroUI</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side - IBM Quantum / macOS Structural Centerpiece */}
        <div className="relative h-150 w-full flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-lg h-125 flex items-center justify-center quantum-card p-8"
          >
            {/* Grid Lines Overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-50 mix-blend-overlay pointer-events-none" />

            <div className="relative z-10 w-full h-full flex flex-col justify-between border border-border-subtle p-6 bg-background-main/50 backdrop-blur-md rounded-lg">
              
              <div className="flex justify-between items-center border-b border-border-subtle pb-4 mb-4">
                <div className="font-mono-data text-xs text-text-muted tracking-widest uppercase">BB84 Simulation</div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Minimalist Quantum Circuit Rep */}
              <div className="flex-1 flex flex-col justify-center gap-6 relative">
                {[...Array(4)].map((_, i) => (
                  <div key={`wire-${i}`} className="w-full h-px bg-border-subtle relative flex items-center">
                    <div className="absolute left-0 text-[10px] font-mono-data text-text-muted -ml-4">q[{i}]</div>
                    
                    {/* Animated Gates */}
                    <motion.div 
                      initial={{ x: 0 }}
                      animate={{ x: "100%" }}
                      transition={{ 
                        duration: 3 + Math.random() * 2, 
                        repeat: Infinity, 
                        ease: "linear",
                        delay: Math.random() * 2
                      }}
                      className="absolute left-4 w-8 h-8 bg-primary-500/10 border border-primary-500 rounded-sm flex items-center justify-center"
                    >
                      <span className="text-[10px] font-mono-data text-primary-500">{['H', 'X', 'Z', 'Y'][i % 4]}</span>
                    </motion.div>
                  </div>
                ))}
                
                {/* Measurement Lines */}
                <div className="w-full h-px border-t border-dashed border-border-subtle mt-4 relative">
                  <div className="absolute left-0 text-[10px] font-mono-data text-text-muted -ml-4">c[4]</div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border-subtle grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-text-muted font-mono-data mb-1">STATE</div>
                  <div className="text-sm font-semibold text-text-main">Superposition</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-muted font-mono-data mb-1">QBER</div>
                  <div className="text-sm font-semibold text-primary-500">{'< 0.01%'}</div>
                </div>
              </div>

            </div>
            
          </motion.div>
        </div>

      </div>
    </section>
  );
}

