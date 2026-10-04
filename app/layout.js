import "./globals.css";

export const metadata = {
  title: "PrintHub",
  description: "Thermal printer web app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-linear-to-br from-violet-50 via-purple-50 to-fuchsia-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
