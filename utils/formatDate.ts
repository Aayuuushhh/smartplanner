export const getFormattedDate = (date: Date) => {
    // Function to get the ordinal suffix for the day (1st, 2nd, 3rd, etc.)
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return "th"; // Covers 11th to 19th
      switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2); 
    const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;
  
    const options: Intl.DateTimeFormatOptions = { 
      weekday: "short",  // Short weekday, e.g., "Mon"
      month: "short",   
    };
  
    const weekday = date.toLocaleDateString(undefined, { weekday: "short" }); 
    const month = date.toLocaleDateString(undefined, { month: "short" });     
    return `${weekday} ${month} ${dayWithSuffix} ${year}`;
  };