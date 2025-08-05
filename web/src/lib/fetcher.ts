const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

type RequestOptions = RequestInit & {
  params?: Record<string, any>;
};

type BackendResponse<T> = {
  message: string;
  error: string | null;
  data: T;
};

export const fetcher = {
  get: async <T = any>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const url = new URL(`${BASE_URL}${path}`);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) =>
        url.searchParams.append(key, String(value))
      );
    }

    const { headers, ...rest } = options;
    const res = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      ...rest,
    });

    const json: BackendResponse<T> = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error || json.message || "Request failed");
    }

    return json.data;
  },

  post: async <T = any>(
    path: string,
    body: any = {},
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers, ...rest } = options;
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      body: JSON.stringify(body),
      ...rest,
    });

    const json: BackendResponse<T> = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error || json.message || "Request failed");
    }

    return json.data;
  },

  delete: async <T = any>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers, ...rest } = options;
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      ...rest,
    });

    const json: BackendResponse<T> = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error || json.message || "Request failed");
    }

    return json.data;
  },

  patch: async <T = any>(
    path: string,
    body: any = {},
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers, ...rest } = options;
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      body: JSON.stringify(body),
      ...rest,
    });

    const json: BackendResponse<T> = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error || json.message || "Request failed");
    }

    return json.data;
  },

  /**
   * Returns the raw fetch Response (for file downloads, etc)
   */
  raw: async (path: string, options: RequestInit = {}) => {
    const url = new URL(`${BASE_URL}${path}`);
    const res = await fetch(url.toString(), {
      credentials: "include",
      ...options,
    });
    return res;
  },

  upload: async <T = any>(
    path: string,
    formData: FormData,
    options: RequestOptions = {}
  ): Promise<T> => {
    const url = new URL(`${BASE_URL}${path}`);
    const { headers, ...rest } = options;

    const res = await fetch(url.toString(), {
      method: "POST",
      credentials: "include",
      body: formData,
      headers: {
        // Don't set Content-Type header, let the browser set it with the correct boundary
        ...(headers || {}),
      },
      ...rest,
    });

    const json: BackendResponse<T> = await res.json();

    if (!res.ok || json.error) {
      throw new Error(json.error || json.message || "Upload failed");
    }

    return json.data;
  },
};
