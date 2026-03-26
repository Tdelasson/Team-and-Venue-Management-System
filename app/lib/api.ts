export async function apiFetch(path: string, options?: RequestInit) {
  const userId = typeof window !== "undefined" ? localStorage.getItem("mockUserId") : null;
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-mock-user-id": userId } : {}),
      ...options?.headers,
    },
  });
}
