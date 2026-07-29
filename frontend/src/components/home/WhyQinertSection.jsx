import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/react";
import SectionHeader from "../shared/SectionHeader";
import { fadeInUp, defaultViewport } from "../../utils/animations";
import { Shield, EyeClosed, Code, SquaresFour } from "@phosphor-icons/react";

export default function WhyQinertSection() {
  const features = [
    {
      icon: <Shield size={24} className="text-primary-400" />,
      title: "Quantum Authentication",
      description: "Authenticate using BB84 Quantum Key Distribution for unbreakable identity verification."
    },
    {
      icon: <EyeClosed size={24} className="text-secondary-500" />,
      title: "Eavesdropping Detection",
      description: "Detect interception attempts before authentication succeeds by measuring quantum states."
    },
    {
      icon: <Code size={24} className="text-accent-400" />,
      title: "Developer Friendly",
      description: "REST APIs with a simple integration workflow. Wrap your app in three lines of code."
    },
    {
      icon: <SquaresFour size={24} className="text-text-main" />,
      title: "Modern Architecture",
      description: "Built with React, Flask, Supabase, and Qiskit for scalability and enterprise readiness."
    }
  ];

  return (
    <section className="py-24 px-6 bg-surface/30 border-y border-border-subtle relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-primary-500/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <SectionHeader 
          title="Why Qinert"
          subtitle="Traditional cryptography is vulnerable to quantum attacks. Qinert secures your application using the fundamental laws of physics."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
            >
              <Card className="quantum-card h-full rounded-sm">
                <CardBody className="p-8 gap-4">
                  <div className="w-12 h-12 bg-surface/50 border border-border-subtle rounded-sm flex items-center justify-center" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium">{feature.title}</h3>
                  <p className="text-text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
