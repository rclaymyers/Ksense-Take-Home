import { safeParse, type ZodSchema } from "zod";
import {
  PatientDataApiResponseSchema,
  RequiredPatientDataSchema,
  type PatientData,
  type PatientDataApiResponse,
  type RiskEvaluationRequestbody,
} from "../schema/ApiSchema";

export type PatientDataValidationResult = {
  valid: boolean;
  patientData: PatientData;
};
type HttpMethod = "POST" | "GET";

const apiKey = import.meta.env.VITE_API_KEY;
const RETRY_AFTER_KEY = "retry_after";
const PATIENT_DATA_API_ENDPOINT =
  "https://assessment.ksensetech.com/api/patients";
const ASSESSMENT_SUBMISSION_API_ENDPOINT =
  "https://assessment.ksensetech.com/api/submit-assessment";

class ApiRequest<T extends object> {
  public method: HttpMethod;
  public url: string;
  public body: string | FormData | null = null;
  public authToken: string | null = null;
  constructor(method: HttpMethod, url: string) {
    this.method = method;
    this.url = url;
  }

  withJsonBody(objectToStringify: any): ApiRequest<T> {
    try {
      this.body = JSON.stringify(objectToStringify);
    } catch (e) {
      console.warn("Unable to stringify object:", objectToStringify);
      console.error(e);
    }
    return this;
  }

  withFormDataBody(formData: FormData): ApiRequest<T> {
    this.body = formData;
    return this;
  }

  withAuthToken(token: string): ApiRequest<T> {
    this.authToken = token;
    return this;
  }

  async execute(): Promise<T | null> {
    const headers: HeadersInit =
      this.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" };
    if (this.authToken) {
      headers["x-api-key"] = this.authToken;
    }
    return fetch(this.url, {
      method: this.method,
      body: this.body,
      headers,
    })
      .then(async (response: Response) => {
        if (response.status === 413) {
          return;
        }
        if (!response.ok) {
          let error;
          try {
            error = await response.json();
          } catch (e) {
            console.warn("Unable to parse error from failed API call");
            console.error(e);
          }
          console.error("API call failed:", this, error);
          if (error && RETRY_AFTER_KEY in error) {
            return error;
          }
          return null;
        }
        const data = await response.json();
        return data;
      })
      .catch((_) => {
        return null;
      });
  }

  async executeWithRetry(interval: number, schema: ZodSchema): Promise<T> {
    while (true) {
      const response: T | null = await this.execute();
      if (response && safeParse(schema, response).success) {
        try {
          const parseResult = safeParse(schema, response);
          if (parseResult.success) {
            return response;
          }
        } catch (e) {
          console.warn("Invalid response shape, trying again");
        }
      }
      const retryInterval =
        response &&
        RETRY_AFTER_KEY in response &&
        typeof response[RETRY_AFTER_KEY] === "number"
          ? response[RETRY_AFTER_KEY] * 1000
          : interval;

      console.warn("Retrying after", retryInterval);
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
      interval += 100;
    }
  }
}

export const ApiService = {
  FetchPatientDataPage: async (
    pageNumber: number,
    limit: number
  ): Promise<PatientDataApiResponse> => {
    return new ApiRequest<PatientDataApiResponse>(
      "GET",
      `${PATIENT_DATA_API_ENDPOINT}?page=${pageNumber}&limit=${limit}`
    )
      .withAuthToken(apiKey)
      .executeWithRetry(200, PatientDataApiResponseSchema);
  },
  GetPatientData: async (): Promise<PatientDataValidationResult[] | null> => {
    const fetchedData: PatientData[] = [];
    let page = 1;
    const initialResponse = await ApiService.FetchPatientDataPage(page, 20);
    if (initialResponse.data) {
      fetchedData.push(...initialResponse.data);
    }
    let hasNext = initialResponse.pagination?.hasNext ?? false;
    const totalPages = initialResponse.pagination?.totalPages ?? 0;
    while (hasNext) {
      page++;
      const response = await ApiService.FetchPatientDataPage(page, 20);
      if (response.data) {
        fetchedData.push(...response.data);
      }
      hasNext = page < totalPages;
    }
    return (
      fetchedData.map((patientData: PatientData) => {
        const validatedPatientData: PatientDataValidationResult = {
          valid: true,
          patientData,
        };
        if (!safeParse(RequiredPatientDataSchema, patientData).success) {
          validatedPatientData.valid = false;
        }
        return validatedPatientData;
      }) ?? null
    );
  },
  SubmitPatientRiskEvaluation: async (
    requestBody: RiskEvaluationRequestbody
  ): Promise<any> => {
    new ApiRequest("POST", ASSESSMENT_SUBMISSION_API_ENDPOINT)
      .withAuthToken(apiKey)
      .withJsonBody(requestBody)
      .execute();
  },
};
