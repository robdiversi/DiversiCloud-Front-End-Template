import type { Metadata } from "next";
import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";
import { Auth0ProviderWrapper } from "./Auth0Provider";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bai"
});

export const metadata: Metadata = {
  title: "DIG - DiversiCloud Multi-Cloud Orchestrator",
  description: "Multi-cloud infrastructure management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${baiJamjuree.variable} font-sans antialiased`}>
        <Auth0ProviderWrapper>
          {children}
        </Auth0ProviderWrapper>
      </body>
    </html>
  );
}