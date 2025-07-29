import {
  AGE_HIGH_RISK,
  AGE_LOW_RISK,
  BP_ELEVATED_RISK,
  BP_STAGE_1_RISK,
  BP_STAGE_2_RISK,
  INVALID_DATA_ERROR,
  NORMAL_RISK,
  RiskEvaluation,
  TEMP_HIGH_FEVER_RISK,
  TEMP_LOW_FEVER_RISK,
} from "./RiskEvaluation";

describe("Get blood pressure risk score", () => {
  //Systolic tests
  it("Returns stage 2 risk for systolic >= 140", () => {
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "140/70" })
    ).toBe(BP_STAGE_2_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "141/70" })
    ).toBe(BP_STAGE_2_RISK);

    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "139/70" })
    ).not.toBe(BP_STAGE_2_RISK);
  });

  it("Returns stage 1 risk for systolic 130-139", () => {
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "130/70" })
    ).toBe(BP_STAGE_1_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "139/70" })
    ).toBe(BP_STAGE_1_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "129/70" })
    ).not.toBe(BP_STAGE_1_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "140/70" })
    ).not.toBe(BP_STAGE_1_RISK);
  });

  it("Returns elevated risk for systolic 120-129", () => {
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "120/70" })
    ).toBe(BP_ELEVATED_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "129/70" })
    ).toBe(BP_ELEVATED_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "119/70" })
    ).not.toBe(BP_ELEVATED_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "130/70" })
    ).not.toBe(BP_ELEVATED_RISK);
  });

  it("Returns normal risk for systolic < 120", () => {
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "119/70" })
    ).toBe(NORMAL_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "120/70" })
    ).not.toBe(NORMAL_RISK);
  });
  //Diastolic tests
  it("Returns stage 2 risk for diastolic >= 90", () => {
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "119/90" })
    ).toBe(BP_STAGE_2_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "119/91" })
    ).toBe(BP_STAGE_2_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "119/89" })
    ).not.toBe(BP_STAGE_2_RISK);
  });

  it("Returns stage 1 risk for diastolic 80-89", () => {
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "119/89" })
    ).toBe(BP_STAGE_1_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "119/80" })
    ).toBe(BP_STAGE_1_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "119/79" })
    ).not.toBe(BP_STAGE_1_RISK);
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "119/90" })
    ).not.toBe(BP_STAGE_1_RISK);
  });

  //Multiple risk stage prioritization test
  it("Uses systolic risk stage if systolic risk greater than diastolic risk", () => {
    //systolic stage 2, diastolic stage 1
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "141/85" })
    ).toBe(BP_STAGE_2_RISK);
  });
  it("Uses diastolic risk stage if diastolic risk greater than systolic risk", () => {
    //systolic elevated risk, diastolic stage 1
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "125/85" })
    ).toBe(BP_STAGE_1_RISK);
    //systolic stage 1, diastolic stage 2
    expect(
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "135/91" })
    ).toBe(BP_STAGE_2_RISK);
  });

  //Invalid data handling
  it("Throws an error on invalid values", () => {
    expect(() =>
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "150/" })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() =>
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "/90" })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() =>
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "INVALID" })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() =>
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: "" })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() =>
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: null })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() =>
      RiskEvaluation.GetBloodPressureRiskScore({ blood_pressure: undefined })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() => RiskEvaluation.GetBloodPressureRiskScore({ age: 50 })).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() => RiskEvaluation.GetBloodPressureRiskScore({} as any)).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() => RiskEvaluation.GetBloodPressureRiskScore(null as any)).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() =>
      RiskEvaluation.GetBloodPressureRiskScore(undefined as any)
    ).toThrow(INVALID_DATA_ERROR);
  });
});

describe("Get temperature risk score", () => {
  it("Returns normal risk for <= 99.5", () => {
    expect(RiskEvaluation.GetTemperatureRiskScore({ temperature: 99.5 })).toBe(
      NORMAL_RISK
    );
    expect(RiskEvaluation.GetTemperatureRiskScore({ temperature: 98 })).toBe(
      NORMAL_RISK
    );
    expect(
      RiskEvaluation.GetTemperatureRiskScore({ temperature: 99.6 })
    ).not.toBe(NORMAL_RISK);
  });

  it("Returns low fever risk for 99.6-100.9", () => {
    expect(RiskEvaluation.GetTemperatureRiskScore({ temperature: 99.6 })).toBe(
      TEMP_LOW_FEVER_RISK
    );
    expect(RiskEvaluation.GetTemperatureRiskScore({ temperature: 100.9 })).toBe(
      TEMP_LOW_FEVER_RISK
    );
    expect(
      RiskEvaluation.GetTemperatureRiskScore({ temperature: 99.5 })
    ).not.toBe(TEMP_LOW_FEVER_RISK);
    expect(
      RiskEvaluation.GetTemperatureRiskScore({ temperature: 101 })
    ).not.toBe(TEMP_LOW_FEVER_RISK);
  });

  it("Returns high fever risk for >=101", () => {
    expect(RiskEvaluation.GetTemperatureRiskScore({ temperature: 101 })).toBe(
      TEMP_HIGH_FEVER_RISK
    );
    expect(RiskEvaluation.GetTemperatureRiskScore({ temperature: 102 })).toBe(
      TEMP_HIGH_FEVER_RISK
    );
    expect(
      RiskEvaluation.GetTemperatureRiskScore({ temperature: 100.9 })
    ).not.toBe(TEMP_HIGH_FEVER_RISK);
  });

  it("Throws an error on invalid values", () => {
    expect(() =>
      RiskEvaluation.GetTemperatureRiskScore({ temperature: "TEMP_ERROR" })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() =>
      RiskEvaluation.GetTemperatureRiskScore({ temperature: "" })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() =>
      RiskEvaluation.GetTemperatureRiskScore({ temperature: null })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() =>
      RiskEvaluation.GetTemperatureRiskScore({ temperature: undefined })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() => RiskEvaluation.GetTemperatureRiskScore({} as any)).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() => RiskEvaluation.GetTemperatureRiskScore(null as any)).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() =>
      RiskEvaluation.GetTemperatureRiskScore(undefined as any)
    ).toThrow(INVALID_DATA_ERROR);
  });
});

describe("Get age risk score", () => {
  it("Returns normal risk for under 40", () => {
    expect(RiskEvaluation.GetAgeRiskScore({ age: 39 })).toBe(NORMAL_RISK);
    expect(RiskEvaluation.GetAgeRiskScore({ age: 40 })).not.toBe(NORMAL_RISK);
  });

  it("Returns lower age risk for 40-65 inclusive", () => {
    expect(RiskEvaluation.GetAgeRiskScore({ age: 30 })).not.toBe(AGE_LOW_RISK);
    expect(RiskEvaluation.GetAgeRiskScore({ age: 40 })).toBe(AGE_LOW_RISK);
    expect(RiskEvaluation.GetAgeRiskScore({ age: 65 })).toBe(AGE_LOW_RISK);
    expect(RiskEvaluation.GetAgeRiskScore({ age: 66 })).not.toBe(AGE_LOW_RISK);
  });

  it("Returns higher age risk for 65 and over", () => {
    expect(RiskEvaluation.GetAgeRiskScore({ age: 65 })).not.toBe(AGE_HIGH_RISK);
    expect(RiskEvaluation.GetAgeRiskScore({ age: 66 })).toBe(AGE_HIGH_RISK);
  });

  it("Throws an error on invalid ages", () => {
    expect(() =>
      RiskEvaluation.GetAgeRiskScore({ age: "fifty-three" })
    ).toThrow(INVALID_DATA_ERROR);
    expect(() => RiskEvaluation.GetAgeRiskScore({ age: "" })).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() => RiskEvaluation.GetAgeRiskScore({ age: null })).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() => RiskEvaluation.GetAgeRiskScore({ age: undefined })).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() => RiskEvaluation.GetAgeRiskScore({ temperature: 100 })).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() => RiskEvaluation.GetAgeRiskScore({} as any)).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() => RiskEvaluation.GetAgeRiskScore(null as any)).toThrow(
      INVALID_DATA_ERROR
    );
    expect(() => RiskEvaluation.GetAgeRiskScore(undefined as any)).toThrow(
      INVALID_DATA_ERROR
    );
  });
});
