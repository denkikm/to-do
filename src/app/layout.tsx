import type { Metadata } from "next";
import { Providers } from './providers';
import "./globals.css";
import BottomNavigation from '@/components/BottomNavigation'

export const metadata: Metadata = {
  title: "لیست کارها",
  description: "برنامه مدیریت کارهای روزانه",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="font-vazirmatn">
        <Providers>
          <main className="pb-16">
            {children}
          </main>
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
