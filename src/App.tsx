import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  ApiService,
  type PatientDataValidationResult,
} from "./services/ApiService";
import { RiskEvaluation } from "./services/RiskEvaluation";
import type { PatientData } from "./schema/ApiSchema";

const HIGH_RISK_THRESHOLD = 4;
const TEMP_RISK_THRESHOLD = 1;

const VIEW_MODE = {
  ALL_PATIENTS: 0,
  HIGH_RISK_ONLY: 1,
  FEVER_ONLY: 2,
  DATA_QUALITY_ISSUES_ONLY: 3,
};

function App() {
  const [high_risk_patients, setHighRiskPatients] = useState<string[]>([]);
  const [fever_patients, setFeverPatients] = useState<string[]>([]);
  const [data_quality_issues, setDataQualityIssues] = useState<string[]>([]);
  const [patientDataArray, setPatientDataArray] = useState<PatientData[]>([]);
  const [currentViewMode, setCurrentViewMode] = useState<number>(
    VIEW_MODE.ALL_PATIENTS
  );
  const [filteredPatientDataArray, setFilteredPatientData] = useState<
    PatientData[]
  >([]);

  useEffect(() => {
    ApiService.GetPatientData().then(
      (validationResults: PatientDataValidationResult[] | null) => {
        if (!validationResults) {
          return;
        }
        const high_risk_patients: string[] = [];
        const fever_patients: string[] = [];
        const data_quality_issues: string[] = [];
        for (const validationResult of validationResults) {
          const data = validationResult.patientData;
          if (!data.patient_id) {
            continue;
          }
          if (!validationResult.valid) {
            data_quality_issues.push(data.patient_id);
          }
          let bpRiskScore = 0;
          let tempRiskScore = 0;
          let ageRiskScore = 0;
          try {
            bpRiskScore = RiskEvaluation.GetBloodPressureRiskScore(data);
          } catch (e) {
            console.warn(e);
          }
          try {
            tempRiskScore = RiskEvaluation.GetTemperatureRiskScore(data);
          } catch (e) {
            console.warn(e);
          }
          try {
            ageRiskScore = RiskEvaluation.GetAgeRiskScore(data);
          } catch (e) {
            console.warn(e);
          }
          if (
            bpRiskScore + tempRiskScore + ageRiskScore >=
            HIGH_RISK_THRESHOLD
          ) {
            high_risk_patients.push(data.patient_id);
          }
          if (tempRiskScore >= TEMP_RISK_THRESHOLD) {
            fever_patients.push(data.patient_id);
          }
        }

        setHighRiskPatients(high_risk_patients);
        setFeverPatients(fever_patients);
        setDataQualityIssues(data_quality_issues);
        setPatientDataArray(
          validationResults.map((results) => results.patientData)
        );
        setFilteredPatientData(
          validationResults.map((results) => results.patientData)
        );
      }
    );
  }, []);

  const changeViewMode = (newViewMode: number) => {
    switch (newViewMode) {
      case VIEW_MODE.ALL_PATIENTS:
        setFilteredPatientData([...patientDataArray]);
        break;
      case VIEW_MODE.HIGH_RISK_ONLY:
        setFilteredPatientData(
          patientDataArray.filter(
            (patientData) =>
              patientData.patient_id &&
              high_risk_patients.includes(patientData.patient_id)
          )
        );
        break;
      case VIEW_MODE.FEVER_ONLY:
        setFilteredPatientData(
          patientDataArray.filter(
            (patientData) =>
              patientData.patient_id &&
              fever_patients.includes(patientData.patient_id)
          )
        );
        break;
      case VIEW_MODE.DATA_QUALITY_ISSUES_ONLY:
        setFilteredPatientData(
          patientDataArray.filter(
            (patientData) =>
              patientData.patient_id &&
              data_quality_issues.includes(patientData.patient_id)
          )
        );
        break;
    }
    setCurrentViewMode(newViewMode);
  };

  const submitData = () => {
    ApiService.SubmitPatientRiskEvaluation({
      high_risk_patients,
      fever_patients,
      data_quality_issues,
    });
  };

  return (
    <>
      {patientDataArray?.length ? (
        <>
          <div className="submit-button-container">
            <button onClick={(_) => submitData()}>Submit</button>
          </div>
          <div className="table-mode-tabs">
            <div
              className={
                "table-mode-tab" +
                (currentViewMode === VIEW_MODE.ALL_PATIENTS ? " active " : "")
              }
              onClick={(_) => changeViewMode(VIEW_MODE.ALL_PATIENTS)}
            >
              All Patients
            </div>
            <div
              className={
                "table-mode-tab" +
                (currentViewMode === VIEW_MODE.HIGH_RISK_ONLY ? " active " : "")
              }
              onClick={(_) => changeViewMode(VIEW_MODE.HIGH_RISK_ONLY)}
            >
              High Risk Patients
            </div>
            <div
              className={
                "table-mode-tab" +
                (currentViewMode === VIEW_MODE.FEVER_ONLY ? " active " : "")
              }
              onClick={(_) => changeViewMode(VIEW_MODE.FEVER_ONLY)}
            >
              Fever Patients
            </div>
            <div
              className={
                "table-mode-tab" +
                (currentViewMode === VIEW_MODE.DATA_QUALITY_ISSUES_ONLY
                  ? " active "
                  : "")
              }
              onClick={(_) =>
                changeViewMode(VIEW_MODE.DATA_QUALITY_ISSUES_ONLY)
              }
            >
              Data Quality Issues
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <td>ID</td>
                <td>Name</td>
                <td>Gender</td>
                <td>Temperature</td>
                <td>BP</td>
                <td>Visit Date</td>
                <td>Diagnosis</td>
                <td>Medications</td>
              </tr>
            </thead>
            <tbody>
              {filteredPatientDataArray.map((patientData) => (
                <tr key={patientData.patient_id}>
                  <td>{patientData.patient_id}</td>
                  <td>{patientData.name}</td>
                  <td>{patientData.gender}</td>
                  <td>{patientData.temperature}</td>
                  <td>{patientData.blood_pressure}</td>
                  <td>{patientData.visit_date}</td>
                  <td>{patientData.diagnosis}</td>
                  <td>{patientData.medications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <div className="loading-message">
            <p>Fetching data, please wait...</p>
          </div>
        </>
      )}
    </>
  );
}

export default App;
