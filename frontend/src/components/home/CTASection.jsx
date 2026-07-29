import { motion } from "framer-motion";
import { fadeInUp, defaultViewport } from "../../utils/animations";
import { Button } from "@heroui/react";
import { ArrowRight, BookOpen } from "@phosphor-icons/react";

export default function CTASection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden border-t border-border-subtle">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-200 h-200 bg-[radial-gradient(circle_at_center,rgba(15,98,254,0.15)_0%,rgba(138,63,252,0.05)_40%,transparent_70%)] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        <motion.h2 
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight"
        >
          Ready to Build with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-accent-400">
            Quantum Authentication?
          </span>
        </motion.h2>
        
        <motion.p 
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-xl text-text-muted mt-6 max-w-2xl"
        >
          Join forward-thinking developers securing their applications against the quantum threat. Setup takes less than 5 minutes.
        </motion.p>
        
        <motion.div 
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <Button size="lg" className="bg-primary-500 text-white font-medium rounded-sm px-8" endContent={<ArrowRight size={18} />}>
            Get Started
          </Button>
          <Button size="lg" variant="bordered" className="border-border-subtle text-text-main font-medium rounded-sm px-8 hover:bg-surface" startContent={<BookOpen size={18} />}>
            Read Documentation
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
