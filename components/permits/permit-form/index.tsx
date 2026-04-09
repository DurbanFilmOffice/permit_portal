"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

import {
  permitFormSchema,
  type PermitFormValues,
} from "@/lib/validations/permit-form.schema";
import {
  createDraftAction,
  submitPermitAction,
} from "@/app/(applicant)/applications/new/actions";
import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";

import { PermitFormNavigation } from "./permit-form-navigation";
import { Step01ProjectDetails } from "./steps/step-01-project-details";
import { Step02Location } from "./steps/step-02-location";
import { Step03Equipment } from "./steps/step-03-equipment";
import { Step04CrewSfx } from "./steps/step-04-crew-sfx";
import { Step05TrafficDrone } from "./steps/step-05-traffic-drone";
import { Step06Drone } from "./steps/step-06-drone";
import { Step07Documents } from "./steps/step-07-documents";

// ─── Step field map — used for per-step validation ───────────────────────────

const STEP_FIELDS: Record<number, string[]> = {
  1: [
    "projectName",
    "formData.companyName",
    "formData.projectTitle",
    "formData.startDate",
    "formData.endDate",
    "formData.descriptionOfScenes",
    "formData.tags",
  ],
  2: [
    "siteAddress",
    "formData.locationName",
    "formData.locationAddress",
    "formData.applicantContactNumber",
    "formData.startTime",
    "formData.wrapTime",
    "formData.genre",
  ],
  3: ["formData.equipment"],
  4: [
    "formData.numberOfCrew",
    "formData.numberOfCars",
    "formData.numberOfCast",
    "formData.numberOfExtras",
    "formData.requiresSfxPermit",
    "formData.gunSupervisorName",
    "formData.sfxGunSupervisorContact",
    "formData.initiationDetails",
    "formData.numberOfRounds",
    "formData.numberOfResets",
  ],
  5: [
    "formData.requiresTrafficControl",
    "formData.roadIntersectionName",
    "formData.dateTrafficControlRequired",
    "formData.trafficControlStartDate",
    "formData.trafficControlEndDate",
    "formData.trafficStartTimeAndWrapTime",
    "formData.involveDroneFilming",
  ],
  6: [
    "formData.proposedActivityDetails",
    "formData.droneOperatorHasLicense",
    "formData.droneProposedActivityDetails",
  ],
  7: ["formData.showAfterCreated"],
};

// ─── Static step config ───────────────────────────────────────────────────────

const BASE_STEPS = [
  { id: 1, title: "Project Details" },
  { id: 2, title: "Location & Information" },
  { id: 3, title: "Equipment" },
  { id: 4, title: "Crew & SFX" },
  { id: 5, title: "Traffic Control" },
  { id: 7, title: "Documents & Submit" },
] as const;

const DRONE_STEP = { id: 6, title: "Drone Filming" } as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface PermitFormProps {
  mode?: "create" | "edit";
  permitId?: string;
  initialData?: PermitFormValues;
  isReturned?: boolean;
}

// ─── Empty defaults (create mode) ────────────────────────────────────────────

const EMPTY_DEFAULTS: PermitFormValues = {
  projectName: "",
  siteAddress: "",
  formData: {
    companyName: "",
    projectTitle: "",
    startDate: "",
    endDate: "",
    descriptionOfScenes: "",
    tags: "",
    locationName: "",
    locationAddress: "",
    applicantContactNumber: "",
    startTime: "",
    wrapTime: "",
    genre: undefined as never,
    equipment: [],
    numberOfCrew: undefined,
    numberOfCars: undefined,
    numberOfCast: "",
    numberOfExtras: "",
    requiresSfxPermit: undefined as never,
    gunSupervisorName: "",
    sfxGunSupervisorContact: "",
    initiationDetails: "",
    numberOfRounds: "",
    numberOfResets: "",
    requiresTrafficControl: undefined as never,
    roadIntersectionName: "",
    dateTrafficControlRequired: "",
    trafficControlStartDate: "",
    trafficControlEndDate: "",
    trafficStartTimeAndWrapTime: "",
    involveDroneFilming: undefined as never,
    proposedActivityDetails: "",
    droneOperatorHasLicense: undefined,
    droneProposedActivityDetails: "",
    showAfterCreated: true,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PermitForm({
  mode = "create",
  permitId: initialPermitId,
  initialData,
  isReturned = false,
}: PermitFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [permitId, setPermitId] = useState<string | null>(
    initialPermitId ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Merge initialData safely — guarantees no undefined on required string fields
  const resolvedDefaults: PermitFormValues = initialData
    ? {
        ...initialData,
        siteAddress: initialData.siteAddress ?? "",
        projectName: initialData.projectName ?? "",
        formData: {
          ...EMPTY_DEFAULTS.formData,
          ...initialData.formData,
        },
      }
    : EMPTY_DEFAULTS;

  const form = useForm<PermitFormValues>({
    resolver: zodResolver(permitFormSchema),
    shouldUnregister: false,
    defaultValues: resolvedDefaults,
    mode: "onTouched",
  });

  // siteAddress has no visible input in the wizard — RHF drops unregistered
  // fields from getValues(). Force-write it on mount in edit mode so it is
  // present when the form is submitted.
  // useEffect(() => {
  //   if (mode === "edit" && initialData?.siteAddress) {
  //     form.setValue("siteAddress", initialData.siteAddress, {
  //       shouldValidate: false,
  //       shouldDirty: false,
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const involveDroneFilming = form.watch("formData.involveDroneFilming");
  const includeDroneStep = involveDroneFilming === "yes";

  // Build the ordered step list, inserting drone step conditionally
  const steps = includeDroneStep
    ? [...BASE_STEPS.slice(0, 5), DRONE_STEP, BASE_STEPS[5]]
    : [...BASE_STEPS];

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  // Map UI step position → logical step id for field validation
  const currentStepConfig = steps[currentStep - 1];
  const logicalStepId = currentStepConfig.id;

  const handleNext = async () => {
    // In edit mode with pre-populated data, skip per-step validation
    // Full validation runs on final submit via form.trigger()
    if (mode !== "edit") {
      const fields = STEP_FIELDS[logicalStepId] ?? [];
      const valid = await form.trigger(
        fields.length > 0
          ? (fields as Parameters<typeof form.trigger>[0])
          : undefined,
      );
      if (!valid) return;
    }

    // Step 1 advance: in edit mode the permit already exists — skip draft creation
    if (currentStep === 1 && permitId === null) {
      if (mode === "edit") {
        form.setError("root", {
          message: "Permit ID missing. Please refresh and try again.",
        });
        return;
      }

      try {
        const result = await createDraftAction();
        setPermitId(result.permitId);
      } catch {
        form.setError("root", {
          message: "Failed to save draft. Please try again.",
        });
        return;
      }
    }

    setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])));
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    console.log("handleSubmit fired", { mode, permitId, isReturned });
    // siteAddress has no input in the wizard — derive it from locationAddress
    const locationAddress = form.getValues("formData.locationAddress");
    form.setValue("siteAddress", locationAddress, {
      shouldValidate: false,
      shouldDirty: false,
    });

    const valid = await form.trigger();
    if (!valid) return;
    if (!permitId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (mode === "edit") {
        const { updatePermitAction, resubmitPermitAction } =
          await import("@/app/(applicant)/applications/[id]/edit/actions");
        const action = isReturned ? resubmitPermitAction : updatePermitAction;
        const result = await action(permitId, form.getValues());

        if (result && "error" in result) {
          setSubmitError(
            typeof result.error === "string"
              ? result.error
              : "Validation failed. Please check your answers.",
          );
          return;
        }

        return;
      }

      // ── Create flow (unchanged) ──────────────────────────────────────────
      const fileData = await Promise.all(
        files.map(async (f) => {
          const buffer = await f.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );
          return { name: f.name, type: f.type, size: f.size, base64 };
        }),
      );

      const result = await submitPermitAction(
        permitId,
        form.getValues(),
        fileData,
      );

      if ("error" in result) {
        setSubmitError(
          typeof result.error === "string"
            ? result.error
            : "Validation failed. Please check your answers.",
        );
        return;
      }

      router.push("/applications");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (logicalStepId) {
      case 1:
        return <Step01ProjectDetails form={form} />;
      case 2:
        return <Step02Location form={form} />;
      case 3:
        return <Step03Equipment form={form} />;
      case 4:
        return <Step04CrewSfx form={form} />;
      case 5:
        return <Step05TrafficDrone form={form} />;
      case 6:
        return <Step06Drone form={form} />;
      case 7:
        return mode === "edit" ? (
          <p className="text-base text-muted-foreground">
            Document upload will be available soon.
          </p>
        ) : (
          <Step07Documents form={form} files={files} onFilesChange={setFiles} />
        );
    }
  };

  const submitLabel =
    mode === "edit"
      ? isReturned
        ? "Resubmit Application"
        : "Save Changes"
      : "Submit Application";

  return (
    <Form {...form}>
      <div className="space-y-8">
        {/* Step indicator */}
        <nav aria-label="Form progress">
          <ol className="flex flex-wrap items-center gap-2">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = completedSteps.includes(stepNumber);
              const isCurrent = currentStep === stepNumber;

              return (
                <li key={step.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-base transition-colors",
                      isCurrent &&
                        "bg-primary text-primary-foreground font-medium",
                      isCompleted && !isCurrent && "bg-primary/10 text-primary",
                      !isCurrent &&
                        !isCompleted &&
                        "bg-muted text-muted-foreground",
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                    <span>{step.title}</span>
                  </div>

                  {/* Connector */}
                  {index < steps.length - 1 && (
                    <span className="text-muted-foreground" aria-hidden>
                      ›
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
            />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </nav>

        {/* Step content */}
        <div className="rounded-lg border-2 bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">
            {currentStepConfig.title}
          </h2>
          {renderStep()}
        </div>

        {/* Root-level error */}
        {(form.formState.errors.root || submitError) && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root?.message ?? submitError}
          </p>
        )}

        {/* Navigation */}
        <PermitFormNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          submitLabel={submitLabel}
        />
      </div>
    </Form>
  );
}
