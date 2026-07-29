import { motion } from "framer-motion";
import SectionHeader from "../shared/SectionHeader";
import { fadeInLeft, fadeInUp, defaultViewport } from "../../utils/animations";
import { Terminal, Lightning, Shield, Code } from "@phosphor-icons/react";

export default function DeveloperExperienceSection() {
  const highlights = [
    {
      icon: <Lightning size={20} className="text-primary-400" />,
      title: "Easy Integration",
      desc: "Drop-in SDKs for React, Node, Python and Go. Get up and running in minutes."
    },
    {
      icon: <Shield size={20} className="text-secondary-400" />,
      title: "Quantum Security",
      desc: "Abstracts away the complex BB84 protocol into a simple unified API."
    },
    {
      icon: <Code size={20} className="text-accent-400" />,
      title: "Developer First",
      desc: "Type-safe, fully documented, and built with modern developer workflows in mind."
    }
  ];

  return (
    <section className="py-24 px-6 bg-surface/30 border-y border-border-subtle relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side - Code Editor */}
        <motion.div 
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="w-full rounded-sm border border-border-subtle bg-background shadow-2xl overflow-hidden relative"
        >
          {/* Subtle glow behind editor */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-500/20 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface/50">
            <div className="flex gap-2" aria-hidden="true">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex items-center gap-2 text-text-muted/60 text-xs font-mono" aria-hidden="true">
              <Terminal size={14} /> index.js
            </div>
          </div>
          <div className="p-6 font-mono text-sm md:text-base leading-loose overflow-x-auto text-text-main">
            <span className="text-secondary-400">import</span> {'{'} Qinert {'}'} <span className="text-secondary-400">from</span> <span className="text-accent-300">"@qinert/sdk"</span>;<br/><br/>
            <span className="text-text-muted/50">{'// Initialize the quantum client'}</span><br/>
            <span className="text-secondary-400">const</span> client = <span className="text-secondary-400">new</span> <span className="text-primary-400">Qinert</span>();<br/><br/>
            <span className="text-secondary-400">await</span> client.<span className="text-primary-400">authenticate</span>({'{'}<br/>
            &nbsp;&nbsp;username: <span className="text-accent-300">"alice"</span><br/>
            {'}'});
          </div>
        </motion.div>

        {/* Right Side - Highlights */}
        <div className="flex flex-col gap-10">
          <SectionHeader 
            title="Developer Experience"
            subtitle="We built Qinert to feel invisible. Integrating quantum-safe authentication shouldn't require a PhD in physics."
          />

          <div className="flex flex-col gap-8">
            {highlights.map((item, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-sm bg-surface border border-border-subtle flex items-center justify-center shrink-0" aria-hidden="true">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-text-main">{item.title}</h4>
                  <p className="text-text-muted mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
