import type { PatientData } from "../schema/ApiSchema";
import type { PatientDataValidationResult } from "./ApiService";

export const INVALID_DATA_ERROR =
  "Invalid patient data passed to risk evaluation function";

export const NORMAL_RISK = 0;

export const SYSTOLIC_NORMAL_UPPER_BOUND = 119;
export const SYSTOLIC_ELEVATED_UPPER_BOUND = 129;
export const SYSTOLIC_STAGE_1_UPPER_BOUND = 139;
export const DIASTOLIC_NORMAL_UPPER_BOUND = 79;
export const DIASTOLIC_STAGE_1_UPPER_BOUND = 89;

export const BP_STAGE_2_RISK = 3;
export const BP_STAGE_1_RISK = 2;
export const BP_ELEVATED_RISK = 1;

export const TEMP_NORMAL_UPPER_BOUND = 99.5;
export const TEMP_LOW_FEVER_UPPER_BOUND = 100.9;

export const TEMP_HIGH_FEVER_RISK = 2;
export const TEMP_LOW_FEVER_RISK = 1;

export const MIDDLE_AGE_LOWER_BOUND = 40;
export const SENIOR_LOWER_BOUND = 66;

export const AGE_HIGH_RISK = 2;
export const AGE_LOW_RISK = 1;

export const RiskEvaluation = {
  GetBloodPressureRiskScore: (patientData: PatientData): number => {
    const split = patientData?.blood_pressure?.split("/");
    if (!split || split.length !== 2 || split.some((value) => !+value)) {
      throw new Error(INVALID_DATA_ERROR);
    }

    const [systolic, diastolic]: [number, number] = split.map(
      (stringValue) => +stringValue
    ) as [number, number];

    // Higher bounds are checked first, since
    // higher risk stages should be used if systolic
    // and diastolic fall into different categories
    if (
      systolic > SYSTOLIC_STAGE_1_UPPER_BOUND ||
      diastolic > DIASTOLIC_STAGE_1_UPPER_BOUND
    ) {
      return BP_STAGE_2_RISK;
    }

    if (
      systolic > SYSTOLIC_ELEVATED_UPPER_BOUND ||
      diastolic > DIASTOLIC_NORMAL_UPPER_BOUND
    ) {
      return BP_STAGE_1_RISK;
    }

    if (systolic > SYSTOLIC_NORMAL_UPPER_BOUND) {
      return BP_ELEVATED_RISK;
    }

    return NORMAL_RISK;
  },
  GetTemperatureRiskScore: (patientData: PatientData): number => {
    if (!patientData?.temperature || !+patientData.temperature) {
      throw INVALID_DATA_ERROR;
    }
    const numericTemp: number = +patientData.temperature;
    if (numericTemp > TEMP_LOW_FEVER_UPPER_BOUND) {
      return TEMP_HIGH_FEVER_RISK;
    }
    if (numericTemp > TEMP_NORMAL_UPPER_BOUND) {
      return TEMP_LOW_FEVER_RISK;
    }
    return NORMAL_RISK;
  },
  GetAgeRiskScore: (patientData: PatientData): number => {
    if (!patientData?.age || !+patientData.age) {
      throw new Error(INVALID_DATA_ERROR);
    }
    const numericAge = +patientData.age;
    if (numericAge >= SENIOR_LOWER_BOUND) {
      return AGE_HIGH_RISK;
    }
    if (numericAge >= MIDDLE_AGE_LOWER_BOUND) {
      return AGE_LOW_RISK;
    }
    return NORMAL_RISK;
  },
};
