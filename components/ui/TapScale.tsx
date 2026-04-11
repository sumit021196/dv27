"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TapScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export default function TapScale({ children, className, scale = 0.95 }: TapScaleProps) {
  return (
    <motion.div
      whileTap={{ scale }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
