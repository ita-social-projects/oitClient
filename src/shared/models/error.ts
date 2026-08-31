export interface BackendErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  code: string;
  path: string;
  traceId: string;
  details?: BackendErrorDetails;
}

export interface BackendErrorDetails {
  errors?: Record<string, string>;
  [key: string]: any;
}
