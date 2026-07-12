import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "You & Me Store — Where buyers and sellers connect",
  description:
    "A simple marketplace to list items or services and connect directly with buyers and sellers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="mt-16 border-t border-brand-100 py-6 text-center text-sm text-brand-500">
            You &amp; Me Store — connecting buyers and sellers.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
