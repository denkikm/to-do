export const metadata = {
  title: 'لیست کارها',
  description: 'برنامه مدیریت کارها',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
} 