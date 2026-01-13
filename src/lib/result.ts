/**
 * A discriminated union type for representing success/failure outcomes.
 * Use this for operations that can fail with an error message.
 */
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };
