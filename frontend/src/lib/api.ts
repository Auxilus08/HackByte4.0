export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const authedFetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.json());
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ROUTES = {
  health: `${BACKEND_URL}/health`,
  accidents: `${BACKEND_URL}/api/v1/accidents/`,
  accident: (id: string) => `${BACKEND_URL}/api/v1/accidents/${id}`,
  volunteers: `${BACKEND_URL}/api/v1/volunteers/`,
  volunteer: (id: string) => `${BACKEND_URL}/api/v1/volunteers/${id}`,
  tasks: `${BACKEND_URL}/api/v1/tasks/`,
  task: (id: string) => `${BACKEND_URL}/api/v1/tasks/${id}`,
  taskProofs: (id: string) => `${BACKEND_URL}/api/v1/tasks/${id}/proofs`,
  poolInfo: `${BACKEND_URL}/api/v1/tasks/pool-info`,
  // Auth
  login: `${BACKEND_URL}/api/v1/auth/login`,
  register: `${BACKEND_URL}/api/v1/auth/register`,
  adminLogin: `${BACKEND_URL}/api/v1/auth/admin/login`,
  me: `${BACKEND_URL}/api/v1/auth/me`,
};

export type Point = {
  lat: number;
  lng: number;
};

export type Accident = {
  id: string;
  source_id: string;
  description: string | null;
  location_name: string;
  location: Point;
  criticality: "Moderate" | "Highly Critical" | string;
  assistance_required: string[];
  status: "reported" | "assessing" | "dispatched" | "resolved";
  created_at: string;
  updated_at: string;
};

export type Volunteer = {
  id: string;
  name: string;
  phone: string;
  wallet_address: string | null;
  location: Point | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  accident_id: string;
  volunteer_id: string;
  status: "pending" | "accepted" | "in-progress" | "completed" | "verified";
  assigned_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  verified_at: string | null;
  reward_tx_hash: string | null;
  proof_images: string[] | null;
  verification_results: VerificationResult[] | null;
};

export type VerificationResult = {
  image_url: string;
  is_accident?: boolean;
  accident_confidence?: number;
  label?: string;
  ai_generated?: boolean | null;
  ai_generated_confidence?: number | null;
  ai_generated_label?: string | null;
  error?: string;
};

// ── API helper functions ─────────────────────────────────────

export async function apiPatch(url: string, body: Record<string, unknown>) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function apiPost(url: string, body: Record<string, unknown>) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function apiDelete(url: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return true;
}
