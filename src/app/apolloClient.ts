"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  fromPromise,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/graphql",
  credentials: "include",
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const refreshToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  const refreshTokenValue = window.localStorage.getItem("refreshToken");
  if (!refreshTokenValue) {
    return null;
  }

  try {
    const mutation = `
      mutation RefreshToken($token: String!) {
        refreshToken(token: $token) {
          accessToken
          refreshToken
          user {
            _id
            email
            name
            role
            createdAt
            updatedAt
          }
        }
      }
    `;

    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: mutation,
          variables: { token: refreshTokenValue },
        }),
      },
    );

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0]?.message || "Refresh failed");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      result.data?.refreshToken || {};
    if (accessToken && newRefreshToken) {
      window.localStorage.setItem("accessToken", accessToken);
      window.localStorage.setItem("refreshToken", newRefreshToken);
      return accessToken;
    }

    return null;
  } catch (error) {
    // Clear tokens on refresh failure
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    throw error;
  }
};

const authLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") {
    return { headers };
  }

  const token = window.localStorage.getItem("accessToken");

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const statusCode =
          (err.extensions as { response?: { statusCode?: number } })?.response
            ?.statusCode ?? (err.extensions as { statusCode?: number })?.statusCode;

        // Check for FORBIDDEN error (403 - permission denied)
        if (
          err.extensions?.code === "FORBIDDEN" ||
          err.extensions?.type === "FORBIDDEN" ||
          statusCode === 403 ||
          err.message.includes("Forbidden") ||
          err.message.toLowerCase().includes("permission")
        ) {
          console.error("[GraphQL Permission Error]:", {
            message: err.message,
            extensions: err.extensions,
            path: err.path,
          });

          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            const adminOnlyPaths = ["/scoring-rules", "/users", "/audit-logs"];

            if (adminOnlyPaths.some((path) => currentPath.startsWith(path))) {
              window.location.href = "/dashboard";
            }
          }

          // Do not retry this operation; move to next error
          continue;
        }

        // Check for UNAUTHENTICATED / NOT_AUTHORIZED error
        if (
          err.extensions?.code === "UNAUTHENTICATED" ||
          err.extensions?.code === "NOT_AUTHORIZED" ||
          err.extensions?.type === "NOT_AUTHORIZED" ||
          statusCode === 401 ||
          err.message.includes("Unauthorized")
        ) {
          // Return a promise that will handle the refresh
          return fromPromise(
            new Promise((resolve, reject) => {
              if (isRefreshing) {
                // Queue this request
                failedQueue.push({ resolve, reject });
              } else {
                isRefreshing = true;
                refreshToken()
                  .then((newToken) => {
                    isRefreshing = false;
                    if (newToken) {
                      processQueue(null, newToken);
                      // Update the operation context with new token
                      const oldHeaders = operation.getContext().headers;
                      operation.setContext({
                        headers: {
                          ...oldHeaders,
                          Authorization: `Bearer ${newToken}`,
                        },
                      });
                      resolve(newToken);
                    } else {
                      processQueue(new Error("No token returned"), null);
                      // Redirect to login
                      if (typeof window !== "undefined") {
                        window.location.href = "/login";
                      }
                      reject(new Error("Refresh failed"));
                    }
                  })
                  .catch((error) => {
                    isRefreshing = false;
                    processQueue(error, null);
                    // Clear tokens and redirect
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem("accessToken");
                      window.localStorage.removeItem("refreshToken");
                      window.location.href = "/login";
                    }
                    reject(error);
                  });
              }
            }),
          ).flatMap(() => forward(operation));
        }
      }

      // Log other GraphQL errors with full details
      graphQLErrors.forEach((err) => {
        console.error("[GraphQL error]:", {
          message: err.message,
          extensions: err.extensions, // This contains validation errors
          locations: err.locations,
          path: err.path,
        });
        // Also log the full error object with all properties
        console.error("[GraphQL error full object]:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        // Log validation errors if present
        if (err.extensions?.validationErrors) {
          console.error("[Validation errors]:", err.extensions.validationErrors);
        }
        if (err.extensions?.response) {
          console.error("[Error response]:", err.extensions.response);
        }
      });
    }

    if (networkError) {
      console.error("[Network error]:", networkError);
    }
  },
);

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});


