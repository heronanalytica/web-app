export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

type Primitive = string | number | boolean | null | undefined;
type QueryValue = Primitive | Primitive[];

export type RequestOptions = RequestInit & {
  params?: Record<string, QueryValue>;
};

type BackendResponse<T> = {
  message?: string;
  error?: string | null;
  data?: T;
};

type ParsedResponse<T> = {
  data: T | undefined;
  json?: BackendResponse<T>;
  text?: string;
};

export class FetcherError extends Error {
  status: number;
  statusText: string;
  response?: Response;
  data?: unknown;

  constructor({
    message,
    status,
    statusText,
    response,
    data,
  }: {
    message: string;
    status: number;
    statusText: string;
    response?: Response;
    data?: unknown;
  }) {
    super(message);
    this.name = "FetcherError";
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.data = data;
  }
}

function buildUrl(path: string, params?: Record<string, QueryValue>) {
  const url = new URL(`${BASE_URL}${path}`);

  if (!params) return url;

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const values = Array.isArray(value) ? value : [value];
    values.forEach((entry) => {
      if (entry === undefined || entry === null) return;
      url.searchParams.append(key, String(entry));
    });
  });

  return url;
}

async function parseResponse<T>(res: Response): Promise<ParsedResponse<T>> {
  if (res.status === 204 || res.status === 205) {
    return { data: undefined };
  }

  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const json = (await res.json()) as BackendResponse<T>;
    return { data: json.data, json };
  }

  const text = await res.text();
  return { data: undefined, text };
}

function getErrorMessage<T>(
  res: Response,
  parsed: ParsedResponse<T>,
  fallback: string
) {
  if (parsed.json?.error) return parsed.json.error;
  if (parsed.json?.message) return parsed.json.message;
  if (parsed.text?.trim()) return parsed.text.trim();
  return fallback;
}

async function request<T>(
  path: string,
  {
    method = "GET",
    headers,
    params,
    body,
    ...rest
  }: RequestOptions & { body?: BodyInit | null } = {},
  fallbackMessage = "Request failed"
): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url.toString(), {
    method,
    credentials: "include",
    headers,
    body,
    ...rest,
  });

  const parsed = await parseResponse<T>(res);

  if (!res.ok || parsed.json?.error) {
    throw new FetcherError({
      message: getErrorMessage(res, parsed, fallbackMessage),
      status: res.status,
      statusText: res.statusText,
      response: res,
      data: parsed.json?.data,
    });
  }

  return parsed.data as T;
}

export const fetcher = {
  get: async <T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers, ...rest } = options;

    return request<T>(
      path,
      {
        ...rest,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(headers || {}),
        },
      },
      "Request failed"
    );
  },

  post: async <T = unknown>(
    path: string,
    body: unknown = {},
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers, ...rest } = options;

    return request<T>(
      path,
      {
        ...rest,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(headers || {}),
        },
        body: JSON.stringify(body),
      },
      "Request failed"
    );
  },

  delete: async <T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers, ...rest } = options;

    return request<T>(
      path,
      {
        ...rest,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(headers || {}),
        },
      },
      "Request failed"
    );
  },

  patch: async <T = unknown>(
    path: string,
    body: unknown = {},
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers, ...rest } = options;

    return request<T>(
      path,
      {
        ...rest,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers || {}),
        },
        body: JSON.stringify(body),
      },
      "Request failed"
    );
  },

  put: async <T = unknown>(
    path: string,
    body: unknown = {},
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers, ...rest } = options;

    return request<T>(
      path,
      {
        ...rest,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(headers || {}),
        },
        body: JSON.stringify(body),
      },
      "Request failed"
    );
  },

  raw: async (path: string, options: RequestInit = {}) => {
    const url = buildUrl(path);
    return fetch(url.toString(), {
      credentials: "include",
      ...options,
    });
  },

  upload: async <T = unknown>(
    path: string,
    formData: FormData,
    options: RequestOptions = {}
  ): Promise<T> => {
    const { headers, ...rest } = options;

    return request<T>(
      path,
      {
        ...rest,
        method: "POST",
        headers: {
          ...(headers || {}),
        },
        body: formData,
      },
      "Upload failed"
    );
  },
};
