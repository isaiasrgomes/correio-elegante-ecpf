export async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}> {
  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      const text = (await res.text()).trim();
      const message =
        text && !text.startsWith("<")
          ? text
          : `Erro ${res.status}. Tente novamente em instantes.`;
      return { ok: false, status: res.status, data: null, error: message };
    }

    const data = (await res.json()) as T;
    if (!res.ok) {
      const payload = data as { error?: string };
      return {
        ok: false,
        status: res.status,
        data,
        error: payload.error ?? `Erro ${res.status}.`,
      };
    }

    return { ok: true, status: res.status, data, error: null };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : "Erro de conexão.",
    };
  }
}
