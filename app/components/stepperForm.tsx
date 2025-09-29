"use client";

import { Icon } from "@iconify-icon/react";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { ReactNode, useState } from "react";

export interface StepperStep {
  id: number;
  label: string;
  isCompleted?: boolean;
  isActive?: boolean;
}

interface StepperFormProps {
  steps: StepperStep[];
  currentStep: number;
  children: ReactNode;
  onStepClick?: (stepId: number) => void;
  showBackButton?: boolean;
  showNextButton?: boolean;
  showSubmitButton?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  submitButtonText?: string;
  className?: string;
}

export default function StepperForm({
  steps,
  currentStep,
  children,
  onStepClick,
  showBackButton = true,
  showNextButton = true,
  showSubmitButton = false,
  onBack,
  onNext,
  onSubmit,
  backButtonText = "Go Back",
  nextButtonText = "Save & Next",
  submitButtonText = "Submit",
  className = "",
}: StepperFormProps) {
  const isLastStep = currentStep === steps.length;


  // Returns 'completed', 'active', or 'pending'
  // When going back, the previous step should be 'active' (red) just like the current step
  const getStepStatus = (step: StepperStep, index: number) => {
    const stepNumber = index + 1;
    if (stepNumber === currentStep) {
      return "active";
    } else if (step.isCompleted) {
      return "completed";
    } else {
      return "pending";
    }
  };

  // Returns style classes and icon for each step
  const getStepStyles = (status: string, stepNumber: number) => {
    switch (status) {
      case "completed":
        return {
          circle: "bg-[#22c55e] text-white border-[#22c55e]", // green fill
          label: "text-[#222B45] font-semibold",
          icon: "mdi:check"
        };
      case "active":
        return {
          circle: "bg-[#ef233c] text-white border-[#ef233c]", // solid red fill
          label: "text-[#222B45] font-bold",
          icon: null
        };
      default:
        return {
          circle: "bg-[#E4E9F2] text-[#8F9BB3] border-[#E4E9F2]", // light gray fill
          label: "text-[#8F9BB3] font-medium",
          icon: null
        };
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Stepper Header */}
        <div className="flex items-center justify-center gap-30 w-full mb-4">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const status = getStepStatus(step, index);
            const styles = getStepStyles(status, stepNumber);
            const isClickable = onStepClick && (status === "completed" || status === "active");
            const isLastStep = index === steps.length - 1;
            // Green line if THIS step is completed, else gray
            const lineColor = step.isCompleted ? "bg-[#22c55e]" : "bg-[#E4E9F2]";

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-200 ${styles.circle} ${isClickable ? "hover:scale-105" : ""}`}
                      style={{zIndex: 1, position: 'relative', fontWeight: status === 'active' ? 700 : 600}}
                      onClick={() => isClickable && onStepClick(stepNumber)}
                    >
                      {styles.icon ? (
                        <Icon icon={styles.icon} width={22} height={22} />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    {/* Connecting Line - only show if not the last step */}
                    {!isLastStep && (
                      <div className={`absolute top-1/2 left-full ml-4 -translate-y-1/2 h-1 ${lineColor} transition-colors duration-300`} style={{width: 90, borderRadius: 2}} />
                    )}
                  </div>
                  <span className={`mt-2 text-xs text-center max-w-20 leading-tight ${styles.label}`}>{step.label}</span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Form Content */}
      <div className="mb-6">
        {children}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {showBackButton && currentStep > 1 && (
          <button
            onClick={onBack}
            className="px-4 py-2 h-10 rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            type="button"
          >
            {backButtonText}
          </button>
        )}

        {showNextButton && !isLastStep && (
          <SidebarBtn
            label={nextButtonText}
            isActive={true}
            leadingIcon="mdi:arrow-right"
            onClick={onNext}
          />
        )}

        {showSubmitButton && isLastStep && (
          <SidebarBtn
            label={submitButtonText}
            isActive={true}
            leadingIcon="mdi:check"
            onClick={onSubmit}
          />
        )}
      </div>
    </div>
  );
}

// Helper hook for managing stepper state
export function useStepperForm(totalSteps: number, initialStep: number = 1) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Mark current step as completed
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const markStepCompleted = (step: number) => {
    setCompletedSteps(prev => [...new Set([...prev, step])]);
  };

  const isStepCompleted = (step: number) => {
    return completedSteps.includes(step);
  };

  const resetStepper = () => {
    setCurrentStep(initialStep);
    setCompletedSteps([]);
  };

  return {
    currentStep,
    completedSteps,
    goToStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    resetStepper,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
  };
}