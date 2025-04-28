'use client';

import { Auth0Provider } from "@auth0/auth0-react";
import { ReactNode } from "react";

export function Auth0ProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        scope: "openid profile email"
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
}