import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import VerificationBanner from "@/components/VerificationBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import { WHATSAPP_SUPPORT_URL } from "@/lib/whatsapp";

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
          <VerificationBanner />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="mt-16 border-t border-brand-100 py-6 text-center text-sm text-brand-500">
            <p>You &amp; Me Store — connecting buyers and sellers.</p>
            <a
              href={WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-brand-600 hover:underline"
            >
              Support on WhatsApp
            </a>
          </footer>
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
