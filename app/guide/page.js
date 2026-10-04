"use client";
import Link from "next/link";
import Header from "../../components/Header";
import BottomTabs from "../../components/BottomTabs";
import { useT } from "../../components/Providers";

export default function Guide() {
  const t = useT();
  const steps = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="pb-20 md:pb-10">
      <Header />
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <h1 className="text-2xl font-bold text-brand-dark mb-4">{t("guide.title")}</h1>
        <div className="bg-white rounded-2xl shadow-md p-5">
          {steps.map((n) => (
            <div key={n} className="flex gap-3 mb-4">
              <span className="bg-brand text-white font-bold w-8 h-8 shrink-0 rounded-full flex items-center justify-center">{n}</span>
              <p className="pt-1">{t("guide.s" + n)}</p>
            </div>
          ))}
          <p className="text-sm text-gray-600 mb-4">
            {t("guide.ubuntu")}: github.com/Tonmoy225/Thermal-Printer-Ubuntu
          </p>
          <Link href="/" className="block text-center bg-brand text-white py-3 rounded-lg font-semibold">
            {t("guide.goLogin")}
          </Link>
        </div>
      </div>
      <BottomTabs />
    </div>
  );
}
