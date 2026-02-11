"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-[#39FF14] hover:text-white transition-all p-2 rounded-md hover:bg-[#39ff1420]"
    >
      <ArrowLeft size={20} />
      <span>Back</span>
    </button>
  );
}
