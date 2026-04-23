import { z } from "zod";

// Production Type options (replaces old GENRE_OPTIONS)
export const PRODUCTION_TYPE_OPTIONS = [
  { value: "web_content", label: "Web Content" },
  { value: "corporate_industrial", label: "Corporate / Industrial" },
  { value: "animation", label: "Animation" },
  { value: "drama_series", label: "Drama Series" },
  { value: "telenovela", label: "Telenovela" },
  { value: "other", label: "Other" },
] as const;

export type ProductionType = (typeof PRODUCTION_TYPE_OPTIONS)[number]["value"];

// Application timeframe options
export const TIMEFRAME_OPTIONS = [
  {
    value: "micro_shoot",
    label: "Micro shoot: 24–48 working hours",
  },
  {
    value: "medium_shoot",
    label: "Medium-scale shoot: 3–7 working days",
  },
  {
    value: "large_shoot",
    label: "Large-scale / Complex shoot: 14–30 working days",
  },
] as const;

// Road portion options
export const ROAD_PORTION_OPTIONS = [
  { value: "sidewalk", label: "Sidewalk" },
  { value: "traffic_island", label: "Traffic Island" },
  { value: "travel_lane", label: "Travel Lane" },
] as const;

// Road closure type options
export const ROAD_CLOSURE_OPTIONS = [
  {
    value: "intermittent",
    label: "Intermittent (specify number of lanes)",
  },
  {
    value: "stop_and_go",
    label: "Stop & Go (specify number of lanes)",
  },
  {
    value: "full_closure",
    label: "Full Road Closure",
  },
] as const;

// Equipment options (step 6)
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

// Document type identifiers — used in permit_documents table
export const DOCUMENT_TYPES = {
  // Step 2
  LOCATION_ILLUSTRATION: "location_illustration",
  // Step 3
  TRAFFIC_ILLUSTRATION: "traffic_illustration",
  // Step 4
  SFX_SKETCH: "sfx_sketch",
  PYROTECHNICIAN_QUALIFICATIONS: "pyrotechnician_qualifications",
  // Step 5
  ROC_CERTIFICATE: "roc_certificate",
  RPL_LICENCE: "rpl_licence",
  ASL_LICENCE: "asl_licence",
  AERIAL_PUBLIC_LIABILITY: "aerial_public_liability",
  AERIAL_DISASTER_FORM: "aerial_disaster_form",
  // Step 7
  PUBLIC_LIABILITY_INSURANCE: "public_liability_insurance",
  CITY_INDEMNITY: "city_indemnity",
  PROOF_OF_PAYMENT: "proof_of_payment",
  FILMING_SCHEDULE: "filming_schedule",
  SCRIPT_SYNOPSIS: "script_synopsis",
  APPROVED_RISK_LETTER: "approved_risk_letter",
  APPROVED_DISASTER_MANAGEMENT: "approved_disaster_management",
  COMPANY_LETTERHEAD: "company_letterhead",
  APPLICANT_ID: "applicant_id",
  ADDITIONAL_1: "additional_1",
  ADDITIONAL_2: "additional_2",
  ADDITIONAL_3: "additional_3",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

// Main form schema — all text/select/checkbox fields only.
// File fields are NOT in this schema — handled separately
// as File objects in React state.
export const permitFormSchema = z.object({
  // DB columns
  projectName: z.string().min(1, "Production title is required"),
  siteAddress: z.string().min(1, "Filming location address is required"),
  description: z.string().optional(), // ← now optional

  formData: z.object({
    // ── Step 1 — Production Details ──────────────────────
    productionCompany: z.string().min(1, "Production company is required"),
    productionTitle: z.string().min(1, "Production title is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    synopsis: z.string().optional(),
    productionType: z.enum(
      [
        "web_content",
        "corporate_industrial",
        "animation",
        "drama_series",
        "telenovela",
        "other",
      ],
      { error: "Production type is required" },
    ),
    applicationTimeframe: z
      .enum(["micro_shoot", "medium_shoot", "large_shoot"])
      .optional(),
    estimatedBudget: z.string().optional(),

    // Producing Contact Details
    producingEmail: z.string().email("Invalid email address"),
    producingTelephone: z.string().optional(),
    producingWebsite: z.string().optional(),
    producingAddress: z.string().optional(),
    producingCellphone: z.string().min(1, "Cellphone is required"),

    // Production Contact Person
    contactFullName: z.string().min(1, "Contact name is required"),
    contactCellphone: z.string().min(1, "Contact cellphone is required"),
    contactAltCellphone: z.string().optional(),
    contactDesignation: z.string().min(1, "Designation is required"),

    productionBackground: z.string().optional(),
    accommodationBooked: z.enum(["yes", "no"]).optional(),
    numberOfRoomsBooked: z.string().optional(),

    // ── Step 2 — Location Application ────────────────────
    filmingLocationName: z.string().min(1, "Filming location name is required"),
    filmingLocationAddress: z
      .string()
      .min(1, "Filming location address is required"),
    onSetContactNumber: z.string().min(1, "On-set contact number is required"),
    callTime: z.string().min(1, "Call time is required"),
    wrapTime: z.string().min(1, "Wrap time is required"),
    descriptionOfScenes: z.string().optional(),

    // Crew & Cast
    crewCount: z.number().min(0).optional(),
    castTalentCount: z.number().min(0).optional(),
    backgroundCastCount: z.number().min(0).optional(),
    localBackgroundCastTalent: z.string().optional(),

    // Vehicle Count
    vehicleCars: z.number().min(0).optional(),
    vehicleVans: z.number().min(0).optional(),
    vehicleTrucks: z.number().min(0).optional(),
    vehicleBuses: z.number().min(0).optional(),

    roadPortionFilmed: z
      .enum(["sidewalk", "traffic_island", "travel_lane"])
      .optional(),

    // ── Step 3 — Traffic Assistance ──────────────────────
    roadClosureType: z
      .enum(["intermittent", "stop_and_go", "full_closure"])
      .optional(),
    numberOfLanes: z.string().optional(),
    estimatedParkingDuration: z.string().optional(),
    numberOfPublicBaysRequired: z.number().min(0).optional(),
    truckSizeTons: z.string().optional(),
    dateTrafficControlRequired: z.string().optional(), // ← new
    trafficControlStartDate: z.string().optional(), // ← new
    trafficControlEndDate: z.string().optional(), // ← new
    trafficStartAndWrapTime: z.string().optional(), // ← new

    // ── Step 4 — SFX / Pyrotechnics ──────────────────────
    firingPointDischargeArea: z.string().optional(),
    materialList: z.string().optional(),
    emergencyPlan: z.string().optional(),

    // ── Step 5 — Aerial Filming ───────────────────────────
    involvesAerialFilming: z.enum(["yes", "no"]),
    aerialFilmingLocation: z.string().optional(),
    proposedActivityDetails: z.string().optional(), // ← new
    droneProposedActivityDetails: z.string().optional(), // ← new

    // ── Step 6 — Special Requirements ────────────────────
    equipment: z.array(z.string()).default([]),
  }),
});

export type PermitFormValues = z.infer<typeof permitFormSchema>;

// Per-step schemas for step-by-step validation
export const step1Schema = permitFormSchema
  .pick({
    projectName: true,
    // description removed — now optional
  })
  .extend({
    formData: permitFormSchema.shape.formData.pick({
      productionCompany: true,
      productionTitle: true,
      startDate: true,
      // synopsis: true,
      productionType: true,
      producingEmail: true,
      producingCellphone: true,
      contactFullName: true,
      contactCellphone: true,
      contactDesignation: true,
    }),
  });

export const step2Schema = permitFormSchema.shape.formData.pick({
  filmingLocationName: true,
  filmingLocationAddress: true,
  onSetContactNumber: true,
  callTime: true,
  wrapTime: true,
});
