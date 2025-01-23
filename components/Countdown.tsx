"use client"
import React, { useEffect, useState } from 'react';
import { FcAlarmClock } from 'react-icons/fc';

interface CountdownTimerProps {
  endDate: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate }) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate , getTimeRemaining]);

  function getTimeRemaining() {
    const now = new Date().getTime();
    const end = endDate.getTime();
    const distance = end - now;

    if (distance <= 0) {
      return "00:00";
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  return (
    <div className="text-sm text-gray-600">
      <div className='flex gap-1 items-center'>
        <FcAlarmClock className="text-[10px]" />
        <p className="text-[10px]">{timeRemaining}</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
