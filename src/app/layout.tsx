import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pisure.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pisure — Free High-Resolution African Stock Photos",
    template: "%s · Pisure",
  },
  description:
    "Free high-resolution photos celebrating the beauty and diversity of Africa. Free for everyone under CC BY 4.0.",
  openGraph: {
    type: "website",
    siteName: "Pisure",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${inter.variable} antialiased`}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <Nav />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
          <Footer />
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
