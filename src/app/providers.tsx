"use client";

import type { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./apolloClient";
import { AuthProvider } from "./lib/auth";

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
};


