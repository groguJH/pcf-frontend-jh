export const DEFAULT_API_ERROR_MESSAGE =
  "요청을 처리할 수 없습니다. 관리자에게 문의해주세요.";

export class ApiClientError extends Error {
  status?: number;

  constructor(message = DEFAULT_API_ERROR_MESSAGE, status?: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

type FetchJsonOptions = {
  errorMessage?: string;
};

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: FetchJsonOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch {
    throw new ApiClientError(options.errorMessage);
  }

  if (!response.ok) {
    throw new ApiClientError(options.errorMessage, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiClientError(options.errorMessage, response.status);
  }
}
