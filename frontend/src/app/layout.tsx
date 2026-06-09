import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles/globals.css";
import { geistSans, geistMono } from "./fonts";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Focus Stack",
  description: "Gérez votre focus et vos tâches au quotidien",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
