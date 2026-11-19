import * as SecureStore from "expo-secure-store";

export const DEFAULT_API =
  "https://popular-pharmacology-translation-slim.trycloudflare.com";

const ACCESS_KEY = "vortemis.access";
const REFRESH_KEY = "vortemis.refresh";

let base = DEFAULT_API;

export function setApiBase(value: string): void {
  base = value.trim().replace(/\/+$/, "");
}

export function apiBase(): string {
  return base;
}

export type Summary = {
  total_flows: number;
  anomalies: number;
  by_tactic: Record<string, number>;
};

export type TimelinePoint = {
  bucket_start: string;
  flows: number;
  anomalies: number;
};

export type FlowRecord = {
  ts: string;
  flow_id: string;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  conn_state: string | null;
  iat_ms: number | null;
  orig_bytes: number;
  resp_bytes: number;
  duration: number;
  anomaly_probability: number;
  is_anomaly: boolean;
  mitre_tactic: string | null;
};

export type ModelMetadata = {
  architecture: string;
  feature_dim: number;
  tau: number;
  mean: number[];
  std: number[];
};

export type Identity = {
  username: string;
  role: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function raw<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = await SecureStore.getItemAsync(ACCESS_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${base}${path}`, { ...init, headers });
  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      response.status,
      (payload as { detail?: string }).detail ?? response.statusText,
    );
  }
  return payload as T;
}

async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

async function rotate(): Promise<boolean> {
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refresh) return false;

  const response = await fetch(`${base}/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!response.ok) {
    await clearSession();
    return false;
  }

  const payload = (await response.json()) as {
    access_token: string;
    refresh_token: string;
  };
  await SecureStore.setItemAsync(ACCESS_KEY, payload.access_token);
  await SecureStore.setItemAsync(REFRESH_KEY, payload.refresh_token);
  return true;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  try {
    return await raw<T>(path, init);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      if (await rotate()) return raw<T>(path, init);
    }
    throw error;
  }
}

export async function login(
  username: string,
  password: string,
): Promise<Identity> {
  const payload = await raw<{
    access_token: string;
    refresh_token: string;
    role: string;
  }>(
    "/v1/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    false,
  );

  await SecureStore.setItemAsync(ACCESS_KEY, payload.access_token);
  await SecureStore.setItemAsync(REFRESH_KEY, payload.refresh_token);
  return { username, role: payload.role };
}

export async function logout(): Promise<void> {
  try {
    await request("/v1/auth/logout", { method: "POST" });
  } finally {
    await clearSession();
  }
}

export async function hasSession(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(ACCESS_KEY);
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  return Boolean(token || refresh);
}

export async function me(): Promise<Identity> {
  return request<Identity>("/v1/auth/me");
}

export async function summary(threshold: number): Promise<Summary> {
  return request<Summary>(`/v1/stats/summary?threshold=${threshold}`);
}

export async function timeline(
  threshold: number,
  bucketSeconds: number,
): Promise<TimelinePoint[]> {
  return request<TimelinePoint[]>(
    `/v1/stats/timeline?threshold=${threshold}&bucket_seconds=${bucketSeconds}`,
  );
}

export async function recentFlows(
  threshold: number,
  limit: number,
): Promise<FlowRecord[]> {
  const page = await request<{ records: FlowRecord[] }>(
    `/v1/flows?min_probability=${threshold}&limit=${limit}`,
  );
  return page.records;
}

export async function metadata(): Promise<ModelMetadata> {
  return request<ModelMetadata>("/v1/engine/metadata");
}
