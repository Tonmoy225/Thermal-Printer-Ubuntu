import "./globals.css";
import Providers from "../components/Providers";

export const metadata = {
  title: "PrintHub",
  description: "Thermal printer web app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-page text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
