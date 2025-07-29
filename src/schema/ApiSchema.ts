import { z } from "zod";

const BLOOD_PRESSURE_REGEX = /^[0-9]+\/[0-9]+$/;
const AGE_REGEX = /^\d+$/;
type Gender = "M" | "F";

export const RequiredPatientDataSchema = z.object({
  age: z.union([z.number(), z.string().regex(AGE_REGEX)]),
  blood_pressure: z.string().regex(BLOOD_PRESSURE_REGEX),
  temperature: z.number(),
});

export type PatientData = {
  patient_id?: string | null;
  name?: string | null;
  age?: string | number | null;
  blood_pressure?: string | null;
  temperature?: string | number | null;
  gender?: Gender | null;
  visit_date?: string | null;
  diagnosis?: string | null;
  medications?: string | null;
};

export const PatientDataPaginationInfoSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});
export type PatientDataPaginationInfo = z.infer<
  typeof PatientDataPaginationInfoSchema
>;

export const PatientDataApiResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: PatientDataPaginationInfoSchema,
});

export type PatientDataMetadata = {
  timestamp: string;
  version: string;
  requestId: string;
};

export type PatientDataApiResponse = {
  data?: PatientData[];
  pagination?: PatientDataPaginationInfo;
  metadata?: PatientDataMetadata;
};

export type RiskEvaluationRequestbody = {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
};
