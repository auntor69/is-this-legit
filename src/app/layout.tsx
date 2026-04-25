import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Is This Legit? – Bangladesh Scam Check",
  description:
    "Community-driven platform to check if a website, shop, or page is legitimate or a scam. Report suspicious links and protect others.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-[family-name:var(--font-geist-sans)]">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <span className="font-bold text-lg">Is This Legit?</span>
            </Link>
            <span className="text-xs text-gray-500 hidden sm:block">
              🇧🇩 Bangladesh Scam Check
            </span>
          </div>
        </header>

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-3xl mx-auto px-4 py-4 text-center text-xs text-gray-500 space-y-1">
            <p className="font-medium">⚠️ Disclaimer</p>
            <p>
              This platform is community-reported and for awareness only. We do
              not guarantee accuracy.
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} Is This Legit? — Built for
              Bangladesh 🇧🇩
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
