import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { Providers } from "@/components/providers/Providers";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f0f13",
};

export const metadata: Metadata = {
  title: "Clinch — Train Smarter. Fight Better.",
  description: "Free training tracker for martial artists. Log sessions, track sparring, monitor PRs, and see your progress across all disciplines.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Clinch",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192x192.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OfflineIndicator />
        <Providers>
          <AuthProvider>
            <ToastProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </ToastProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
