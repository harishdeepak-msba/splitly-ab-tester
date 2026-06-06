import type { Experiment, CreateExperimentInput, ExperimentStatus } from './types';

// For local dev: '/api' (proxied by Vite to localhost:3001)
// For production: set VITE_API_URL to your Render backend URL
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getExperiments: () => req<Experiment[]>('/experiments'),
  getExperiment: (id: string) => req<Experiment>(`/experiments/${id}`),
  createExperiment: (data: CreateExperimentInput) =>
    req<Experiment>('/experiments', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: ExperimentStatus) =>
    req<{ success: boolean }>(`/experiments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteExperiment: (id: string) =>
    req<{ success: boolean }>(`/experiments/${id}`, { method: 'DELETE' }),
  seedData: (id: string) =>
    req<{ success: boolean }>(`/track/seed/${id}`, { method: 'POST' }),
};
