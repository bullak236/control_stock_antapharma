"use client";

import { motion } from "framer-motion";
import type React from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "emerald" | "rose" | "amber" | "indigo" | "cobre" | "quirofano" | "none";
  delay?: number;
}

const glowMap = {
  cyan: "before:bg-radial-[at_0%_0%] before:from-[#1E7F7A]/22 before:to-transparent",
  quirofano: "before:bg-radial-[at_0%_0%] before:from-[#1E7F7A]/24 before:to-transparent",
  emerald: "before:bg-radial-[at_0%_0%] before:from-[#1E7F7A]/20 before:to-transparent",
  cobre: "before:bg-radial-[at_0%_0%] before:from-[#B9673A]/18 before:to-transparent",
  amber: "before:bg-radial-[at_0%_0%] before:from-[#C8952B]/18 before:to-transparent",
  rose: "before:bg-radial-[at_0%_0%] before:from-[#8C3B4A]/22 before:to-transparent",
  indigo: "before:bg-radial-[at_0%_0%] before:from-[#2E6E9E]/20 before:to-transparent",
  none: "",
};

export function BentoCard({
  children,
  className,
  glowColor = "none",
  delay = 0,
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "bento-glass bento-glass-hover relative overflow-hidden rounded-xl p-4 sm:p-6",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-85",
        glowMap[glowColor],
        className
      )}
    >
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
