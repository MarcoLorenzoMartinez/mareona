export interface ToastOptions {
  description?: string;
  duration?: number;
}

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

function dispatchToast(type: ToastType, message: string, options?: ToastOptions): void {
  if (typeof window === "undefined") return;
  const detail: ToastItem = {
    id: Math.random().toString(36).slice(2),
    type,
    message,
    description: options?.description,
  };
  window.dispatchEvent(new CustomEvent("mareona_toast_notify", { detail }));
}

export const toast = {
  success: (message: string, options?: ToastOptions) => dispatchToast("success", message, options),
  error: (message: string, options?: ToastOptions) => dispatchToast("error", message, options),
  info: (message: string, options?: ToastOptions) => dispatchToast("info", message, options),
};
