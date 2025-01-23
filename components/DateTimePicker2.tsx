import React from 'react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  label: string;
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  popperPlacement: "right-end" | "left-start" | "bottom" | "top" | "bottom-start" | "bottom-end";
  popperClassName?: string;
}

export default function DateTimePicker({
  label,
  selectedDate,
  onChange,
  popperClassName
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hours' | 'minutes') => {
    if (!selectedDate) return;
    
    const newDate = new Date(selectedDate);
    const value = parseInt(e.target.value);
    
    if (type === 'hours') {
      if (value >= 0 && value <= 23) {
        newDate.setHours(value);
        onChange(newDate);
      }
    } else {
      if (value >= 0 && value <= 59) {
        newDate.setMinutes(value);
        onChange(newDate);
      }
    }
  };

  return (
    <div className={cn("flex flex-col space-y-2", popperClassName)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-5" />
            {selectedDate ? format(selectedDate, "PPp") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(date) => {
              if (date) {
                const newDate = new Date(date);
                if (selectedDate) {
                  newDate.setHours(selectedDate.getHours());
                  newDate.setMinutes(selectedDate.getMinutes());
                }
                onChange(newDate);
              }
            }}
            initialFocus
          />
          <div className="border-t p-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <input
              type="number"
              min="0"
              max="23"
              value={selectedDate ? selectedDate.getHours() : ""}
              onChange={(e) => handleTimeChange(e, 'hours')}
              className="w-16 px-2 py-1 border rounded"
              placeholder="HH"
            />
            <span>:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={selectedDate ? selectedDate.getMinutes() : ""}
              onChange={(e) => handleTimeChange(e, 'minutes')}
              className="w-16 px-2 py-1 border rounded"
              placeholder="MM"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}