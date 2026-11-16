"use client";

import { motion } from "framer-motion";
import type React from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "emerald" | "rose" | "amber" | "indigo" | "none";
  delay?: number;
}

const glowMap = {
  cyan: "before:bg-radial-[at_0%_0%] before:from-cyan-500/12 before:to-transparent",
  emerald: "before:bg-radial-[at_0%_0%] before:from-emerald-500/12 before:to-transparent",
  rose: "before:bg-radial-[at_0%_0%] before:from-rose-500/15 before:to-transparent",
  amber: "before:bg-radial-[at_0%_0%] before:from-amber-500/14 before:to-transparent",
  indigo: "before:bg-radial-[at_0%_0%] before:from-indigo-500/12 before:to-transparent",
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "bento-glass bento-glass-hover relative overflow-hidden rounded-2xl p-6",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-80",
        glowMap[glowColor],
        className
      )}
    >
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}
