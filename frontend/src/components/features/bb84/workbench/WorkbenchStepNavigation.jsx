import React from 'react';
import { Button } from '@heroui/react';
import { CaretLeft, CaretRight, Play, Lock } from '@phosphor-icons/react';
import Badge from "../../../shared/Badge";

export default function WorkbenchStepNavigation({ activeStep, setActiveStep, totalSteps }) {
  const handlePrev = () => setActiveStep(Math.max(0, activeStep - 1));
  const handleNext = () => setActiveStep(Math.min(totalSteps - 1, activeStep + 1));

  return (
    <div className="flex items-center justify-between border-t border-border-subtle pt-6 mt-6">
      <div className="flex gap-3">
        <Button 
          variant="flat" 
          className="bg-surface border border-border-subtle text-text-main hover:bg-background-main disabled:opacity-50"
          startContent={<CaretLeft size={16} />}
          onClick={handlePrev}
          isDisabled={activeStep === 0}
        >
          Previous
        </Button>
        <Button 
          variant="flat" 
          className="bg-surface border border-border-subtle text-text-main hover:bg-background-main disabled:opacity-50"
          endContent={<CaretRight size={16} />}
          onClick={handleNext}
          isDisabled={activeStep === totalSteps - 1}
        >
          Next Step
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="coming">
          <Lock size={10} aria-hidden="true" />
          Milestone 2
        </Badge>
        <Button 
          color="primary" 
          className="font-medium bg-primary-500/50 text-white/50 cursor-not-allowed"
          startContent={<Play size={16} weight="fill" />}
          isDisabled
        >
          Run Full Simulation
        </Button>
      </div>
    </div>
  );
}
