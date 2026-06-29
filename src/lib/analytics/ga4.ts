export const GA_MEASUREMENT_ID = "G-FRNYRD148Y";

export function getGaMeasurementId(): string {
  return GA_MEASUREMENT_ID;
}

export function isGa4Enabled(): boolean {
  return true;
}

type GtagCommand = "config" | "event" | "js" | "set";

declare global {
  interface Window {
    gtag?: (command: GtagCommand, ...args: unknown[]) => void;
  }
}

function gtag(command: GtagCommand, ...args: unknown[]): void {
  if (typeof window.gtag !== "function") return;
  window.gtag(command, ...args);
}

export function trackGa4PageView(path: string): void {
  gtag("config", GA_MEASUREMENT_ID, { page_path: path });
}

export function trackGa4Event(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  gtag("event", eventName, params);
}
