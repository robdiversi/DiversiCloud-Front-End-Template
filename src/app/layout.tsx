// src/app/layout.tsx
import "./globals.css";
import { Auth0ProviderWrapper } from "./Auth0Provider";
import { Metadata } from "next";

// (Optional) Metadata for your app
export const metadata: Metadata = {
  title: "DiversiCloud Orchestrator",
  description: "MultiCloud orchestration manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Auth0 will redirect into /loading after login */}
        <Auth0ProviderWrapper>
          {children}
        </Auth0ProviderWrapper>
      </body>
    </html>
  );
}
