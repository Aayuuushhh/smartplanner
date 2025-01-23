import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecoilState } from 'recoil';
import { themeState } from '@/app/recoil/atom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { FaRegSun } from 'react-icons/fa6';

interface NavbarProps {
  selectedCalendar: string;
  calendars: { id: string | number; sharedBy: string }[];
  onCalendarChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Navbar: React.FC<NavbarProps> = ({ selectedCalendar, calendars=[], onCalendarChange}) => {
  const [theme, setTheme] = useRecoilState(themeState);


  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };


  return (
    <div className ={theme === 'light' ? "bg-white-800 duration-500 ease-out text-white flex flex-row-reverse gap-10 items-center justify-start p-4 shadow-md" : "bg-[#282828] text-white flex flex-row-reverse gap-10 duration-500 ease-out items-center justify-start p-4 shadow-md"}>
        <button
          onClick={toggleTheme}
          className={theme === 'light' ? "bg-black  font-semibold py-2 px-4 rounded transition-colors mr-2" :
            "bg-white font-semibold py-2 px-4 rounded transition-colors mr-2" 
          }
        >
          {theme === 'light' ?  <FaMoon color='white'/> : <FaRegSun color='black' />}
        </button>
    
        

      <div>
        <select
          value={selectedCalendar}
          onChange={onCalendarChange}
          className="border border-gray-300 rounded px-2 py-1 bg-gray-700 text-white"
        >
          <option value="Select Calendar">Select Calendar</option>
          <option value="-1">My Calendar</option>
          {calendars && calendars.map((calendar) => (
            <option key={calendar.id} value={calendar.id}>
              {calendar.sharedBy}&apos;s calendar
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Navbar;
