// Type pour les erreurs de validation
export interface ValidationError {
  errors?: Record<string, string>;
  message?: string;
}
