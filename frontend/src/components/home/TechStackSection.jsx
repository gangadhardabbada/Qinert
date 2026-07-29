import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/react";
import SectionHeader from "../shared/SectionHeader";
import { scaleIn, defaultViewport } from "../../utils/animations";
import { Database, HardDrives, PuzzlePiece, Palette, Pulse, Lightning, FileCode } from "@phosphor-icons/react";

export default function TechStackSection() {
  const stack = [
    { name: "React", icon: <PuzzlePiece size={24} className="text-[#61DAFB]" />, desc: "Component-driven UI" },
    { name: "Flask", icon: <HardDrives size={24} className="text-text-main" />, desc: "Lightweight Python backend" },
    { name: "Supabase", icon: <Database size={24} className="text-[#3ECF8E]" />, desc: "Open source Firebase alternative" },
    { name: "Qiskit", icon: <Pulse size={24} className="text-secondary-500" />, desc: "IBM Quantum computing SDK" },
    { name: "HeroUI", icon: <Palette size={24} className="text-primary-500" />, desc: "Beautiful, fast components" },
    { name: "Framer Motion", icon: <Lightning size={24} className="text-[#f5038f]" />, desc: "Production-ready animations" },
    { name: "Phosphor Icons", icon: <FileCode size={24} className="text-text-main" />, desc: "Clean, consistent iconography" }
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader 
          title="Built with the Best"
          subtitle="Qinert stands on the shoulders of industry-leading open source technologies."
          centered
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stack.map((tech, idx) => (
            <motion.div
              key={idx}
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              whileHover={{ y: -5 }}
            >
              <Card className="quantum-card group h-full rounded-sm cursor-pointer border-transparent hover:border-border-glow">
                <CardBody className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-sm bg-surface/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                    {tech.icon}
                  </div>
                  <h4 className="font-medium text-text-main group-hover:text-primary-400 transition-colors">{tech.name}</h4>
                  <p className="text-xs text-text-muted">{tech.desc}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
