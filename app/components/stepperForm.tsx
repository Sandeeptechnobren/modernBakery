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
  cancelButtonText?: string;
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
  cancelButtonText = "Cancel",
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
      <div className="flex flex-col sm:flex-row justify-center items-center w-full mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(step, index);
          const styles = getStepStyles(status, stepNumber);
          const isClickable = onStepClick && (status === "completed" || status === "active");
          const isLastStep = index === steps.length - 1;
          const lineColor = step.isCompleted ? "bg-[#22c55e]" : "bg-[#E4E9F2]";
          return (
            <div key={step.id} className="flex flex-col sm:flex-row items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-xs sm:text-lg transition-all duration-200 ${styles.circle} ${isClickable ? "hover:scale-105" : ""}`}
                  style={{ fontWeight: status === 'active' ? 700 : 600, zIndex: 1 }}
                  onClick={() => isClickable && onStepClick(stepNumber)}
                >
                  {styles.icon ? (
                    <Icon icon={styles.icon} width={18} height={18} />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className={`mt-2 text-[10px] sm:text-xs text-center max-w-24 leading-tight ${styles.label}`}>{step.label}</span>
              </div>
              {/* Render line except after last circle */}
              {!isLastStep && (
                <div className={`w-1 h-[40px] mb-6 sm:w-[80px] sm:h-1 md:w-[120px] ${lineColor} rounded mx-auto`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="mb-6 w-full max-w-full px-2 sm:px-0">
        {children}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 w-full px-2 sm:px-0">
        <button
          onClick={onBack}
          className="px-4 py-2 h-10 rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors w-full sm:w-auto"
          type="button"
        >
          { currentStep === 1 ? cancelButtonText : backButtonText}
        </button>

        {showNextButton && !isLastStep && (
          <div className="w-full sm:w-auto">
            <SidebarBtn
              label={nextButtonText}
              isActive={true}
              leadingIcon="mdi:arrow-right"
              onClick={onNext}
            />
          </div>
        )}

        {showSubmitButton && isLastStep && (
          <div className="w-full sm:w-auto">
            <SidebarBtn
              label={submitButtonText}
              isActive={true}
              leadingIcon="mdi:check"
              onClick={onSubmit}
            />
          </div>
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