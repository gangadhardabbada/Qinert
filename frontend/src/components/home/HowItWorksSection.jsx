import { motion } from "framer-motion";
import SectionHeader from "../shared/SectionHeader";
import { fadeInUp, defaultViewport } from "../../utils/animations";
import { SignIn, Graph, Key, CheckCircle, ShieldCheck, ArrowRight } from "@phosphor-icons/react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <SignIn size={20} />,
      title: "Auth Request",
      desc: "Client requests access"
    },
    {
      icon: <Graph size={20} />,
      title: "QKD Protocol",
      desc: "Polarized photons transmitted"
    },
    {
      icon: <Key size={20} />,
      title: "Shared Secret",
      desc: "Keys securely established"
    },
    {
      icon: <CheckCircle size={20} />,
      title: "Verification",
      desc: "Checking for interception"
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "Secure Auth",
      desc: "Access granted safely"
    }
  ];

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="How It Works" />

        <div className="relative flex flex-col lg:flex-row justify-between gap-8 lg:gap-4 mt-12">
          {/* Horizontal connection line for desktop */}
          <div className="hidden lg:block absolute top-6 left-10 right-10 h-px bg-border-subtle" />
          
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="relative z-10 flex flex-col items-start lg:items-center gap-4 flex-1"
            >
              <div className="w-12 h-12 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-primary-400 shrink-0 shadow-[0_0_15px_rgba(15,98,254,0.1)]" aria-hidden="true">
                {step.icon}
              </div>
              <div className="lg:text-center">
                <h4 className="font-medium text-text-main">{step.title}</h4>
                <p className="text-sm text-text-muted mt-1">{step.desc}</p>
              </div>
              {/* Vertical connector for mobile */}
              {idx !== steps.length - 1 && (
                <div className="lg:hidden w-px h-8 bg-border-subtle ml-6 mt-2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
