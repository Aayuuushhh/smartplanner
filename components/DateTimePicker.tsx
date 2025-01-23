import React from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

interface DateTimePickerProps {
  label: string
  selectedDate: Date | null
  onChange: (date: Date | null) => void
  popperPlacement: "right-end" | "left-start" | "bottom" | "top" | "bottom-start" | "bottom-end"  ; 
  popperClassName?: string
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ 
  label, 
  selectedDate, 
  onChange, 
  popperPlacement, 
  popperClassName 
}) => {
  return (
    <div className={`mb-4 ${popperClassName}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        showTimeSelect
        dateFormat="Pp"
        popperPlacement={popperPlacement}
        popperClassName={popperClassName}
        withPortal
        portalId="portal-root"  // Use this to move the calendar pop-up to the portal root
        className="w-full border border-gray-300 rounded p-2"
        calendarClassName="bg-white border border-gray-300 rounded-lg shadow-md"
        dayClassName={() => "text-gray-700 hover:bg-blue-100 focus:bg-blue-100"}
        isClearable={false}
      />
    </div>
  )
}

export default DateTimePicker