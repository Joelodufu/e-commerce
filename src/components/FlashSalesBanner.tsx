import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Clock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface FlashSalesBannerProps {
  endTime: Date;
  onViewDeals: () => void;
  brandColor: string;
}

export function FlashSalesBanner({ endTime, onViewDeals, brandColor }: FlashSalesBannerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date().getTime();
    const end = endTime.getTime();
    const distance = end - now;

    if (distance < 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
      expired: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft.expired) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl mb-8"
      style={{
        background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
      }}
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-white -top-48 -right-48"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-white -bottom-36 -left-36"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="relative px-8 py-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Content */}
          <div className="flex items-center gap-6">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Zap className="w-8 h-8 text-white fill-current" />
            </motion.div>

            <div className="text-white">
              <motion.h2
                className="text-3xl mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Flash Sales ⚡
              </motion.h2>
              <motion.p
                className="text-white/90"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Grab amazing deals before time runs out!
              </motion.p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <Clock className="w-5 h-5 text-white" />
              <div className="flex items-center gap-2">
                <TimeUnit value={timeLeft.hours} label="HRS" />
                <span className="text-white text-2xl">:</span>
                <TimeUnit value={timeLeft.minutes} label="MIN" />
                <span className="text-white text-2xl">:</span>
                <TimeUnit value={timeLeft.seconds} label="SEC" />
              </div>
            </div>

            <Button
              onClick={onViewDeals}
              size="lg"
              className="bg-white hover:bg-white/90 text-gray-900 rounded-2xl px-6 gap-2 shadow-xl"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5,
        }}
      />
    </motion.div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-3xl text-white min-w-[3rem] bg-white/10 rounded-lg px-3 py-1"
      >
        {value.toString().padStart(2, '0')}
      </motion.div>
      <div className="text-xs text-white/70 mt-1">{label}</div>
    </div>
  );
}
