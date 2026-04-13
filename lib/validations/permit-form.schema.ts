import { z } from "zod";

// ─── Genre options ────────────────────────────────────────────────────────────

export const GENRE_OPTIONS = [
  { value: "feature_film", label: "Feature Film" },
  { value: "documentary", label: "Documentary" },
  { value: "reality_show", label: "Video - Reality Show" },
  { value: "tv_series", label: "TV Series" },
  { value: "tv_commercial", label: "TV Commercial" },
  { value: "student_project", label: "Student Project" },
  { value: "stills_photography", label: "Stills Photography" },
  { value: "short_film", label: "Short Film" },
  { value: "music_video", label: "Music Video" },
] as const;

// ─── Equipment options ────────────────────────────────────────────────────────

export const EQUIPMENT_OPTIONS = [
  { value: "animals", label: "Animals" },
  { value: "base_camp", label: "Base Camp" },
  { value: "building_blackout", label: "Building BlackOut" },
  { value: "camera_crane", label: "Camera Crane" },
  { value: "camera_truck", label: "Camera Truck" },
  { value: "cherry_pickers", label: "Cherry Pickers" },
  { value: "children", label: "Children" },
  { value: "driving_sequence", label: "Driving Sequence" },
  { value: "fire_effects", label: "Fire Effects" },
  { value: "generator", label: "Generator" },
  { value: "lighting_tower", label: "Lighting Tower" },
] as const;

// ─── Full permit form schema ──────────────────────────────────────────────────

export const permitFormSchema = z.object({
  // Structured fields → DB columns
  projectName: z.string().min(1, "Project name is required"),
  siteAddress: z.string().min(1, "Site address is required"),

  // Dynamic fields → form_data jsonb
  formData: z.object({
    // Step 1 — Project details
    companyName: z.string().min(1, "Company name is required"),
    projectTitle: z.string().min(1, "Project title is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    descriptionOfScenes: z.string().optional(),
    tags: z.string().optional(),

    // Step 2 — Location & more information
    locationName: z.string().min(1, "Location name is required"),
    locationAddress: z.string().min(1, "Location address is required"),
    applicantContactNumber: z.string().min(1, "Contact number is required"),
    startTime: z.string().min(1, "Start time is required"),
    wrapTime: z.string().min(1, "Wrap time is required"),
    genre: z.enum(
      [
        "feature_film",
        "documentary",
        "reality_show",
        "tv_series",
        "tv_commercial",
        "student_project",
        "stills_photography",
        "short_film",
        "music_video",
      ] as const,
      { error: "Genre is required" },
    ),

    // Step 3 — Equipment & special requirements
    equipment: z.array(z.string()).default([]),

    // Step 4 — Crew & SFX
    numberOfCrew: z.number().min(0).optional(),
    numberOfCars: z.number().min(0).optional(),
    numberOfCast: z.string().optional(),
    numberOfExtras: z.string().optional(),
    requiresSfxPermit: z.enum(["yes", "no"] as const, {
      error: "SFX permit answer is required",
    }),
    gunSupervisorName: z.string().optional(),
    sfxGunSupervisorContact: z.string().optional(),
    initiationDetails: z.string().optional(),
    numberOfRounds: z.string().optional(),
    numberOfResets: z.string().optional(),

    // Step 5 — Traffic control
    requiresTrafficControl: z.enum(["yes", "no"] as const, {
      error: "Traffic control answer is required",
    }),
    roadIntersectionName: z.string().optional(),
    dateTrafficControlRequired: z.string().optional(),
    trafficControlStartDate: z.string().optional(),
    trafficControlEndDate: z.string().optional(),
    trafficStartTimeAndWrapTime: z.string().optional(),
    involveDroneFilming: z.enum(["yes", "no"] as const, {
      error: "Drone filming answer is required",
    }),

    // Step 6 — Drone filming (conditional — only when involveDroneFilming = 'yes')
    proposedActivityDetails: z.string().optional(),
    droneOperatorHasLicense: z.enum(["yes", "no"] as const).optional(),
    droneProposedActivityDetails: z.string().optional(),

    // Step 7 — Documents & submit
    showAfterCreated: z.boolean().default(true),
  }),
});

export type PermitFormValues = z.infer<typeof permitFormSchema>;

// ─── Per-step schemas (used to validate each step before advancing) ───────────

export const step1Schema = permitFormSchema.pick({ projectName: true }).extend({
  formData: permitFormSchema.shape.formData.pick({
    companyName: true,
    projectTitle: true,
    startDate: true,
    endDate: true,
    descriptionOfScenes: true,
    tags: true,
  }),
});

export const step2Schema = permitFormSchema.pick({ siteAddress: true }).extend({
  formData: permitFormSchema.shape.formData.pick({
    locationName: true,
    locationAddress: true,
    applicantContactNumber: true,
    startTime: true,
    wrapTime: true,
    genre: true,
  }),
});

export const step3Schema = z.object({
  formData: permitFormSchema.shape.formData.pick({
    equipment: true,
  }),
});

export const step4Schema = z.object({
  formData: permitFormSchema.shape.formData.pick({
    numberOfCrew: true,
    numberOfCars: true,
    numberOfCast: true,
    numberOfExtras: true,
    requiresSfxPermit: true,
    gunSupervisorName: true,
    sfxGunSupervisorContact: true,
    initiationDetails: true,
    numberOfRounds: true,
    numberOfResets: true,
  }),
});

export const step5Schema = z.object({
  formData: permitFormSchema.shape.formData.pick({
    requiresTrafficControl: true,
    roadIntersectionName: true,
    dateTrafficControlRequired: true,
    trafficControlStartDate: true,
    trafficControlEndDate: true,
    trafficStartTimeAndWrapTime: true,
    involveDroneFilming: true,
  }),
});

export const step6Schema = z.object({
  formData: permitFormSchema.shape.formData.pick({
    proposedActivityDetails: true,
    droneOperatorHasLicense: true,
    droneProposedActivityDetails: true,
  }),
});

export const step7Schema = z.object({
  formData: permitFormSchema.shape.formData.pick({
    showAfterCreated: true,
  }),
});

// Ordered array — index 0 = step 1. Step 6 (drone) inserted conditionally by the wizard.
export const stepSchemas = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
] as const;
