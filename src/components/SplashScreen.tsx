import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface SplashScreenProps {
  onComplete: () => void;
  brandColor: string;
  logo: string;
  brandName?: string;
}

export function SplashScreen({
  onComplete,
  brandColor,
  logo,
  brandName,
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}DD 100%)`,
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        {logo ? (
          <img
            src={logo}
            alt={brandName || "COK Mall"}
            className="w-32 h-32 object-contain"
          />
        ) : (
          <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-4xl">
              {(brandName || "COK Mall")
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
        )}
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white text-4xl mb-12"
      >
        {brandName || "COK Mall"}
      </motion.h1>

      <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-white/80 mt-4"
      >
        Loading your shopping experience...
      </motion.p>
    </motion.div>
  );
}
