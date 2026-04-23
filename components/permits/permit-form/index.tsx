"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

import {
  permitFormSchema,
  type PermitFormValues,
  DOCUMENT_TYPES,
} from "@/lib/validations/permit-form.schema";
import {
  createDraftAction,
  submitPermitAction,
} from "@/app/(applicant)/applications/new/actions";
import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import type { PermitDocument } from "@/db/schema/permit-documents";

import { PermitFormNavigation } from "./permit-form-navigation";
import { Step01ProductionDetails } from "./steps/step-01-production-details";
import { Step02LocationApplication } from "./steps/step-02-location-application";
import { Step03TrafficAssistance } from "./steps/step-03-traffic-assistance";
import { Step04SfxPyrotechnics } from "./steps/step-04-sfx-pyrotechnics";
import { Step05AerialFilming } from "./steps/step-05-aerial-filming";
import { Step06SpecialRequirements } from "./steps/step-06-special-requirements";
import { Step07ProductionDocuments } from "./steps/step-07-production-documents";

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: "Production Details", optional: false },
  { id: 2, title: "Location Application", optional: false },
  { id: 3, title: "Traffic Assistance", optional: true },
  { id: 4, title: "SFX / Pyrotechnics", optional: true },
  { id: 5, title: "Aerial Filming", optional: false },
  { id: 6, title: "Special Requirements", optional: false },
  { id: 7, title: "Production Documents", optional: false },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface PermitFormProps {
  mode?: "create" | "edit";
  permitId?: string;
  initialData?: PermitFormValues;
  isReturned?: boolean;
  isIncomplete?: boolean;
  isDraft?: boolean;
  existingDocuments?: PermitDocument[];
}

function sanitiseFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Empty defaults (create mode) ────────────────────────────────────────────

const EMPTY_DEFAULTS: PermitFormValues = {
  projectName: "",
  siteAddress: "",
  description: "",
  formData: {
    // Step 1
    productionCompany: "",
    productionTitle: "",
    startDate: "",
    endDate: "",
    synopsis: "",
    productionType: undefined as never,
    applicationTimeframe: undefined,
    estimatedBudget: "",
    producingEmail: "",
    producingTelephone: "",
    producingWebsite: "",
    producingAddress: "",
    producingCellphone: "",
    contactFullName: "",
    contactCellphone: "",
    contactAltCellphone: "",
    contactDesignation: "",
    productionBackground: "",
    accommodationBooked: undefined,
    numberOfRoomsBooked: "",
    // Step 2
    filmingLocationName: "",
    filmingLocationAddress: "",
    onSetContactNumber: "",
    callTime: "",
    wrapTime: "",
    descriptionOfScenes: "",
    crewCount: undefined,
    castTalentCount: undefined,
    backgroundCastCount: undefined,
    localBackgroundCastTalent: "",
    vehicleCars: undefined,
    vehicleVans: undefined,
    vehicleTrucks: undefined,
    vehicleBuses: undefined,
    roadPortionFilmed: undefined,
    // Step 3
    roadClosureType: undefined,
    numberOfLanes: "",
    estimatedParkingDuration: "",
    numberOfPublicBaysRequired: undefined,
    truckSizeTons: "",
    dateTrafficControlRequired: "",
    trafficControlStartDate: "",
    trafficControlEndDate: "",
    trafficStartAndWrapTime: "",
    // Step 4
    firingPointDischargeArea: "",
    materialList: "",
    emergencyPlan: "",
    // Step 5
    involvesAerialFilming: "no",
    aerialFilmingLocation: "",
    proposedActivityDetails: "",
    droneProposedActivityDetails: "",
    // Step 6
    equipment: [],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PermitForm({
  mode = "create",
  permitId: initialPermitId,
  initialData,
  isReturned = false,
  isIncomplete = false,
  isDraft = false,
  existingDocuments = [],
}: PermitFormProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [permitId, setPermitId] = useState<string | null>(
    initialPermitId ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const handleFileChange = (documentType: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [documentType]: file }));
  };

  const resolvedDefaults: PermitFormValues = initialData
    ? {
        ...initialData,
        siteAddress: initialData.siteAddress ?? "",
        projectName: initialData.projectName ?? "",
        description: initialData.description ?? "",
        formData: {
          ...EMPTY_DEFAULTS.formData,
          ...initialData.formData,
        },
      }
    : EMPTY_DEFAULTS;

  const form = useForm<PermitFormValues, unknown, PermitFormValues>({
    resolver: zodResolver(permitFormSchema) as Resolver<PermitFormValues>,
    shouldUnregister: false,
    defaultValues: resolvedDefaults,
    mode: "onTouched",
  });

  const totalSteps = STEPS.length;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const currentStepConfig = STEPS[currentStep - 1];

  // Whether this mode should enforce validation (create or draft submitting)
  const shouldValidate = mode === "create" || isDraft;

  // Check if a document type is satisfied — either a new file selected
  // or an existing uploaded document covers it
  const isDocSatisfied = (documentType: string): boolean => {
    if (files[documentType]) return true;
    return existingDocuments.some((d) => d.documentType === documentType);
  };

  // ── Step 5 aerial document validation ─────────────────────────────────────

  const validateStep5 = (): boolean => {
    const involves = form.getValues("formData.involvesAerialFilming");
    if (involves !== "yes") return true;
    const required = [
      DOCUMENT_TYPES.ROC_CERTIFICATE,
      DOCUMENT_TYPES.RPL_LICENCE,
      DOCUMENT_TYPES.ASL_LICENCE,
      DOCUMENT_TYPES.AERIAL_PUBLIC_LIABILITY,
      DOCUMENT_TYPES.AERIAL_DISASTER_FORM,
    ];
    return required.every((dt) => isDocSatisfied(dt));
  };

  // ── Per-step validation ────────────────────────────────────────────────────

  const validateCurrentStep = async (): Promise<boolean> => {
    if (!shouldValidate) return true;

    if (currentStep === 1) {
      return form.trigger([
        "formData.productionCompany",
        "formData.productionTitle",
        "formData.startDate",
        "formData.productionType",
        "formData.producingEmail",
        "formData.producingCellphone",
        "formData.contactFullName",
        "formData.contactCellphone",
        "formData.contactDesignation",
      ]);
    }

    if (currentStep === 2) {
      return form.trigger([
        "formData.filmingLocationName",
        "formData.filmingLocationAddress",
        "formData.onSetContactNumber",
        "formData.callTime",
        "formData.wrapTime",
      ]);
    }

    if (currentStep === 5) {
      const docsValid = validateStep5();
      if (!docsValid) {
        setSubmitError(
          "Please upload all required aerial filming documents before continuing.",
        );
        return false;
      }
      setSubmitError(null);
      return true;
    }

    return true;
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;

    if (currentStep === 1 && permitId === null && !isDraft) {
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
    setSubmitError(null);
    setCurrentStep((s) => s - 1);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    // Enforce mandatory documents on create and draft —
    // satisfied by either a new file OR an existing uploaded document
    if (mode === "create" || isDraft) {
      const mandatoryDocs = [
        DOCUMENT_TYPES.PUBLIC_LIABILITY_INSURANCE,
        DOCUMENT_TYPES.CITY_INDEMNITY,
      ];
      const missingMandatory = mandatoryDocs.filter(
        (dt) => !isDocSatisfied(dt),
      );
      if (missingMandatory.length > 0) {
        setSubmitError(
          "Please upload all mandatory documents before submitting.",
        );
        return;
      }
    }

    // Sync DB columns from form fields before final validation
    const filmingLocationAddress = form.getValues(
      "formData.filmingLocationAddress",
    );
    const productionTitle = form.getValues("formData.productionTitle");
    const synopsis = form.getValues("formData.synopsis");

    form.setValue("siteAddress", filmingLocationAddress, {
      shouldValidate: false,
      shouldDirty: false,
    });
    form.setValue("projectName", productionTitle, {
      shouldValidate: false,
      shouldDirty: false,
    });
    form.setValue("description", synopsis ?? "", {
      shouldValidate: false,
      shouldDirty: false,
    });

    const valid = await form.trigger();
    if (!valid) return;
    if (!permitId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convert File objects to base64 for Server Action
      const fileEntries = Object.entries(files).filter(
        (entry): entry is [string, File] => entry[1] !== null,
      );

      const fileData = await Promise.all(
        fileEntries.map(async ([documentType, f]) => {
          const buffer = await f.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );
          return {
            documentType,
            name: sanitiseFilename(f.name),
            type: f.type,
            size: f.size,
            base64,
          };
        }),
      );

      // Draft in edit mode — submit like a new application
      if (mode === "edit" && isDraft) {
        const result = await submitPermitAction(
          permitId,
          form.getValues(),
          fileData,
        );
        if (!result.success) {
          setSubmitError(
            result.error ?? "Validation failed. Please check your answers.",
          );
          return;
        }
      } else if (mode === "edit" && isIncomplete) {
        const { resubmitPermitAction } =
          await import("@/app/(applicant)/applications/[id]/edit/actions");
        const result = await resubmitPermitAction(
          permitId,
          form.getValues(),
          fileData,
        );
        if (result && !result.success) {
          setSubmitError(
            typeof result.error === "string"
              ? result.error
              : "Validation failed. Please check your answers.",
          );
          return;
        }
      } else if (mode === "edit") {
        const { updatePermitAction } =
          await import("@/app/(applicant)/applications/[id]/edit/actions");
        const result = await updatePermitAction(
          permitId,
          form.getValues(),
          fileData,
        );
        if (result && !result.success) {
          setSubmitError(
            typeof result.error === "string"
              ? result.error
              : "Validation failed. Please check your answers.",
          );
          return;
        }
      } else {
        // Create flow
        const result = await submitPermitAction(
          permitId,
          form.getValues(),
          fileData,
        );
        if (!result.success) {
          setSubmitError(
            result.error ?? "Validation failed. Please check your answers.",
          );
          return;
        }
      }

      router.push("/applications");
    } catch (err) {
      // Next.js redirect() throws internally — don't treat it as an error
      if (
        err instanceof Error &&
        (err.message === "NEXT_REDIRECT" ||
          err.message.includes("NEXT_REDIRECT"))
      ) {
        return;
      }
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step renderer ──────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (currentStepConfig.id) {
      case 1:
        return <Step01ProductionDetails form={form} />;
      case 2:
        return (
          <Step02LocationApplication
            form={form}
            files={files}
            onFileChange={handleFileChange}
            existingDocuments={existingDocuments}
          />
        );
      case 3:
        return (
          <Step03TrafficAssistance
            form={form}
            files={files}
            onFileChange={handleFileChange}
            existingDocuments={existingDocuments}
          />
        );
      case 4:
        return (
          <Step04SfxPyrotechnics
            form={form}
            files={files}
            onFileChange={handleFileChange}
            existingDocuments={existingDocuments}
          />
        );
      case 5:
        return (
          <Step05AerialFilming
            form={form}
            files={files}
            onFileChange={handleFileChange}
            existingDocuments={existingDocuments}
          />
        );
      case 6:
        return <Step06SpecialRequirements form={form} />;
      case 7:
        return (
          <Step07ProductionDocuments
            form={form}
            files={files}
            onFileChange={handleFileChange}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            mode={mode}
            isIncomplete={isIncomplete}
            existingDocuments={existingDocuments}
          />
        );
    }
  };

  const submitLabel =
    mode === "edit"
      ? isIncomplete
        ? "Resubmit Application"
        : isDraft
          ? "Submit Application"
          : "Save Changes"
      : "Submit Application";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Form {...form}>
      <div className="space-y-8">
        {/* Step indicator */}
        <nav aria-label="Form progress">
          <ol className="flex flex-wrap items-center gap-2">
            {STEPS.map((step, index) => {
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
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>{step.title}</span>
                    {step.optional && (
                      <span className="ml-1 text-sm opacity-70">
                        (Optional)
                      </span>
                    )}
                  </div>

                  {/* Connector */}
                  {index < STEPS.length - 1 && (
                    <span className="text-muted-foreground" aria-hidden="true">
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
        <div className="rounded-md border bg-card p-6 shadow-sm max-h-[70vh] overflow-y-auto">
          {renderStep()}
        </div>

        {/* Root-level error */}
        {(form.formState.errors.root || submitError) && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0 text-destructive mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="text-base font-medium text-destructive">
                Something went wrong
              </p>
              <p className="text-sm text-destructive/80 mt-0.5">
                {form.formState.errors.root?.message ?? submitError}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        {/* Save as draft button intentionally commented out */}
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
