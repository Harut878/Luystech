// LuysTech — կապ PHP backend-ի հետ (/api/)։
// Բոլոր հարցումները գնում են նույն դոմենի /api/index.php-ին. ադմինի նստաշրջանը՝ PHP session cookie։

export type ApiResult = { ok: boolean; error?: string; [k: string]: any };

const BASE = "/api/";

async function call(action: string, opts: { method?: "GET" | "POST"; body?: unknown; form?: FormData; query?: Record<string, string> } = {}): Promise<ApiResult> {
  const qs = new URLSearchParams({ a: action, ...(opts.query || {}) }).toString();
  const init: RequestInit = {
    method: opts.method || (opts.body !== undefined || opts.form ? "POST" : "GET"),
    credentials: "same-origin",
    cache: "no-store",
    // Custom header-ը CSRF-ից պաշտպանում է. այլ կայքից եկած form-ը այն չի կարող ավելացնել
    headers: { "X-LT": "1", ...(opts.form ? {} : { "Content-Type": "application/json" }) },
  };
  if (opts.form) init.body = opts.form;
  else if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  try {
    const res = await fetch(`${BASE}?${qs}`, init);
    let data: ApiResult;
    try { data = await res.json(); } catch { data = { ok: false, error: `server error (${res.status})` }; }
    if (!res.ok && data.ok !== false) data = { ...data, ok: false };
    if (res.status === 401) data.unauthorized = true;
    return data;
  } catch {
    return { ok: false, error: "Կապի սխալ. ստուգեք ինտերնետը" };
  }
}

// ── Հանրային ──
export const getContent = () => call("content");
export const sendContact = (data: Record<string, string>) => call("contact", { body: data });

// ── Մուտք ──
export const login = (email: string, password: string) => call("login", { body: { email, password } });
export const logout = () => call("logout", { method: "POST", body: {} });
export const me = () => call("me");
export const changePassword = (current: string, next: string) => call("password", { body: { current, next } });

// ── Ադմին ──
export const getDashboard = () => call("dashboard");
export const listRows = (table: string) => call("list", { query: { t: table } });
export const getRequests = () => call("requests");

export const saveTexts = (data: unknown) => call("texts", { body: { data } });
export const saveSettings = (data: unknown) => call("settings", { body: { data } });
export const setSection = (key: string, on: boolean) => call("section", { body: { key, on } });
export const upsertRow = (table: string, row: Record<string, any>) => call("upsert", { body: { table, row } });
export const deleteRow = (table: string, id: string) => call("delete", { body: { table, id } });
export const setRequestStatus = (id: string, status: "new" | "contacted" | "done") => call("request_status", { body: { id, status } });
export const deleteRequest = (id: string) => call("request_delete", { body: { id } });

export async function uploadImage(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  return call("upload", { form: formData });
}
