import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@heroui/react';
import { X, ArrowRight, ArrowLeft } from '@phosphor-icons/react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const TOUR_STEPS = [
  {
    title: "Welcome to Qinert",
    content: "Discover how we leverage quantum mechanics to guarantee secure authentication. In this guided tour, we'll walk through the BB84 protocol.",
    target: "home"
  },
  {
    title: "The BB84 Protocol",
    content: "We encode information in the quantum states of single photons. Any attempt to intercept these photons permanently changes their state, alerting us to eavesdroppers.",
    target: "home"
  },
  {
    title: "Try the Simulation",
    content: "Ready to see it in action? Let's head over to the BB84 Explorer where you can intercept photons yourself.",
    target: "bb84",
    path: "/bb84-explorer?tour=true"
  }
];

export default function StorytellingTour() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isTourActive = searchParams.get('tour') === 'true';
  const [currentStep, setCurrentStep] = useState(0);

  if (!isTourActive) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = TOUR_STEPS[currentStep + 1];
      if (nextStep.path) {
        navigate(nextStep.path);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleClose = () => {
    searchParams.delete('tour');
    setSearchParams(searchParams);
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50 w-80 glass-panel p-6 shadow-2xl border-primary-500/30"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-main"
        >
          <X size={16} />
        </button>
        
        <div className="font-mono-data text-xs text-primary-500 mb-2 tracking-widest uppercase">
          Guided Tour • {currentStep + 1}/{TOUR_STEPS.length}
        </div>
        
        <h3 className="text-lg font-semibold text-text-main mb-2">
          {step.title}
        </h3>
        
        <p className="text-sm text-text-muted mb-6 leading-relaxed">
          {step.content}
        </p>
        
        <div className="flex justify-between items-center">
          <Button 
            size="sm" 
            variant="light" 
            isDisabled={currentStep === 0}
            onClick={handlePrev}
            className="text-text-muted"
          >
            <ArrowLeft size={14} className="mr-1" /> Back
          </Button>
          
          <Button 
            size="sm" 
            className="bg-primary-500 text-white font-medium rounded-md px-4"
            onClick={handleNext}
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
