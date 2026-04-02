"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PermitFormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function PermitFormNavigation({
  onBack,
  onNext,
  onSubmit,
  isSubmitting,
  isFirstStep,
  isLastStep,
}: PermitFormNavigationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Back — hidden on step 1 */}
        {!isFirstStep && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Save as draft — always visible; navigates away (draft already saved) */}
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <Link href="/applications">Save as draft</Link>
        </Button>

        {/* Next — hidden on last step */}
        {!isLastStep && (
          <Button type="button" onClick={onNext} disabled={isSubmitting}>
            Next
          </Button>
        )}

        {/* Submit — only on last step */}
        {isLastStep && (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Submitting…" : "Submit Application"}
          </Button>
        )}
      </div>
    </div>
  );
}
