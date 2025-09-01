import { config } from "../../config";
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const url = `${config.serverUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: "include", // Important for cookies
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Create a custom error object that preserves error arrays
      const error = new Error(
        Array.isArray(data) ? data[0] || response.statusText : data || response.statusText
      ) as Error & { errors?: string[] };
      
      if (Array.isArray(data)) {
        error.errors = data;
      }
      
      throw error;
    }
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error("API request failed");
  }
};
