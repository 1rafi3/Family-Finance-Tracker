export interface ApiErrorBody {
  code: string
  message: string
  details?: unknown
}

export interface ApiErrorEnvelope {
  error: ApiErrorBody
}

export interface FieldError {
  field: string
  code: string
  message: string
}
