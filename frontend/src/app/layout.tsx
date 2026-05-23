import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "CloudNotes",
  description: "Private cloud notes dashboard"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="noise" />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
