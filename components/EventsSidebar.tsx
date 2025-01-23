import React, { useEffect, useState } from 'react';
import WordOfTheDayCard from "@/components/Word";
import { Event } from "../app/types/types";
import CountdownTimer from './Countdown';
import { useRecoilValue } from 'recoil';
import { themeState } from '@/app/recoil/atom';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';

export interface EventsSidebarProps {
  eventsForSelectedDate: Event[];
  selectedDate: Date;
  onAddEventClick: () => void;
  formattedDate: string;
}

const EventsSidebar: React.FC<EventsSidebarProps> = ({
  eventsForSelectedDate,
  selectedDate,
  onAddEventClick,
  formattedDate,
}) => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const theme = useRecoilValue(themeState);

  const themeP = createTheme({
    typography: {
      fontFamily: 'Rubik, sans-serif',
    },
    palette: {
      mode: 'light', 
    },
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const isEventOngoing = (startDate: Date, endDate: Date) => {
    const now = new Date();
    return now >= startDate && now <= endDate;
  };

  return (
    <ThemeProvider theme={themeP}>
      <div className={theme === "light" ? "mt-0 mr-2 p-3 flex flex-col h-full overflow-y-auto" : "mt-0 p-3 flex flex-col h-full overflow-y-auto bg-[##282128]"}>
        <div className='flex justify-between items-center mb-2 p-2'>
          <div className={theme === 'light' ? "text-xl text-black" : "text-xl text-white"}>
            {hydrated ? formattedDate : "Loading..."}
          </div>
          <button
            className="text-white bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            onClick={onAddEventClick}
          >
            Add Event
          </button>
        </div>
        <ul className="flex flex-col">
          {eventsForSelectedDate.map((event) => {
            const startDate = new Date(event.date);
            const endDate = new Date(event.endDate);
            const duration = Math.abs(endDate.getTime() - startDate.getTime()) / 36e5;

            // Set border color based on whether the event is ongoing
            const borderColor = isEventOngoing(startDate, endDate) ? 'border-green-600' : 'border-blue-800';

            return (
              <li
                key={event.id}
                className={`mb-2 p-2 border rounded-lg border-l-8 ${borderColor}`} // Apply border color conditionally
              >
                <h3>{event.title}</h3>
                <hr className="my-2" />
                <div className='flex justify-between items-center'>
                  <p className="text-[10px]">
                    {formatTime(startDate)} - {formatTime(endDate)} ({duration.toFixed(2)} hours)
                  </p>
                  <CountdownTimer endDate={startDate} />
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-2">
          <WordOfTheDayCard selectedDate={selectedDate} />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default EventsSidebar;
