export function normalizeUrl(input: string): string {
  let url = input.trim().toLowerCase();
  url = url.replace(/\/+$/, "");
  url = url.replace(/^https?:\/\//, "");
  url = "https://" + url;
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname.replace(/\/+$/, "") + parsed.search;
  } catch {
    return url;
  }
}

export function isValidUrl(input: string): boolean {
  try {
    let url = input.trim().toLowerCase();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export type Status = "trusted" | "suspicious" | "scam" | "pending";

export const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bg: string; border: string }
> = {
  trusted: {
    label: "Trusted",
    color: "text-green-700",
    bg: "bg-green-100",
    border: "border-green-300",
  },
  suspicious: {
    label: "Suspicious",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    border: "border-yellow-300",
  },
  scam: {
    label: "Scam",
    color: "text-red-700",
    bg: "bg-red-100",
    border: "border-red-300",
  },
  pending: {
    label: "Pending",
    color: "text-gray-700",
    bg: "bg-gray-100",
    border: "border-gray-300",
  },
};

export const CATEGORIES = [
  "Online Shop",
  "Job / Hiring",
  "Facebook Page",
  "Instagram Page",
  "Service / Company",
  "Other",
] as const;
