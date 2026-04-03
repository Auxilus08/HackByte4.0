export const fetcher = (url: string) => fetch(url).then((res) => res.json());

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ROUTES = {
  health: `${BACKEND_URL}/health`,
  accidents: `${BACKEND_URL}/api/v1/accidents/`,
  accident: (id: string) => `${BACKEND_URL}/api/v1/accidents/${id}`,
  volunteers: `${BACKEND_URL}/api/v1/volunteers/`,
  volunteer: (id: string) => `${BACKEND_URL}/api/v1/volunteers/${id}`,
  tasks: `${BACKEND_URL}/api/v1/tasks/`,
  task: (id: string) => `${BACKEND_URL}/api/v1/tasks/${id}`,
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
};
