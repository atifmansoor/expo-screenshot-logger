export type ScreenshotFormat = 'jpg' | 'png';

export interface ScreenshotOptions {
  format?: ScreenshotFormat;
  quality?: number; // 0..1
}

/**
 * Initialize the screenshot logger hook.
 * Call once in your root component (development only behavior).
 */
export function useScreenshotLogger(): void;

/**
 * Capture a screenshot and send it to the devtools panel.
 * Returns a data URI string (or null on failure) in development.
 */
export function captureScreenshot(
  label?: string,
  options?: ScreenshotOptions
): Promise<string | null>;

/**
 * Set the global capture function used internally by the hook.
 */
export function setCaptureFunction(
  fn: (label?: string, options?: ScreenshotOptions) => Promise<string | null>
): void;

export {}; // ensure this file is treated as a module

