const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  detail: any;

  constructor(status: number, message: string, detail?: any) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function parseError(res: Response) {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

export async function api<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  let body: BodyInit | undefined = undefined;

  // JSON body (außer FormData)
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body,
    credentials: "include", // <-- SESSION COOKIE !!!
  });

  if (!res.ok) {
    const detail = await parseError(res);
    const msg =
      (detail && (detail.detail || detail.message)) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, detail);
  }

  // No content
  if (res.status === 204) return undefined as T;

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  // fallback text
  return (await res.text()) as unknown as T;
}
