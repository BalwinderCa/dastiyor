import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastContainer } from "@/components/ui/Toast";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dastiyor - Service Marketplace",
  description: "Find skilled professionals for your tasks in Tajikistan. The best marketplace for services.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';
  
  // Check if we're on provider dashboard pages
  const isProviderDashboard = pathname.startsWith('/provider');

  return (
    <html lang="en">
      <body className={manrope.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isProviderDashboard && <Header />}
        <main style={{ flex: 1 }}>
          {children}
        </main>
        {!isProviderDashboard && <Footer />}
        <ToastContainer />
      </body>
    </html>
  );
}
