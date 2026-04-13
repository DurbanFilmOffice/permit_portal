export type ActionResponse<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export function actionSuccess<T>(data?: T): ActionResponse<T> {
  return { success: true, data };
}

export function actionError(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): ActionResponse {
  if (err instanceof Error) {
    return { success: false, error: err.message };
  }
  return { success: false, error: fallback };
}
