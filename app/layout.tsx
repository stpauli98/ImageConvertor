import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebP Konvertor - Bulk konverzija slika",
  description: "Besplatna online konverzija slika u WebP format. Bulk upload, kompresija i resize. Potpuno client-side, bez uploada na server.",
  keywords: ["webp", "konverzija", "slike", "kompresija", "resize", "bulk", "online"],
  authors: [{ name: "WebP Konvertor" }],
  openGraph: {
    title: "WebP Konvertor - Bulk konverzija slika",
    description: "Besplatna online konverzija slika u WebP format",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 dark:bg-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
