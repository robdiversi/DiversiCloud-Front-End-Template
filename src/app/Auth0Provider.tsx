// src/app/Auth0Provider.tsx
'use client';

import { Auth0Provider } from "@auth0/auth0-react";
import { ReactNode, use } from "react";
import { useRouter } from "next/navigation";

export function Auth0ProviderWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined" ? window.location.origin : "",
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        scope: "openid profile email",
      }}
      onRedirectCallback={() => {
        // once Auth0 has handed control back here, send them to /loading
        router.push("/loading");
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
}
