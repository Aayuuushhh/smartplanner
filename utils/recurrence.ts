import { Event } from '@/app/types/types';
import { Frequency, RRule } from 'rrule';

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getWeekdayIndex = (weekday: string): number => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.indexOf(weekday);
};

const addWeeks = (date: Date, weeks: number) => addDays(date, weeks * 7);

const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addYears = (date: Date, years: number) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

const generateCustomRecurrence = (event :Event) => {
  const { start_date, custom } = event.recurrencedata!;
  const startDate = new Date(start_date);
  let currentDate = new Date(startDate);
  let endDate;

  if (custom?.end_type === 'ondate') {
    endDate = new Date(event.recurrencedata!.end_date);
  } else if (custom?.end_type === 'after') {
    endDate = addDays(startDate, parseInt(custom.end_count) * parseInt(custom.interval));
  } else {
    endDate = addMonths(startDate, 6); // Default to 6 months if no end condition specified
  }

  const events = [];
  const originalEndDate = new Date(event.endDate);
  const duration = originalEndDate.getTime() - startDate.getTime();

  // Parse removedate to get dates to exclude
  const removedDates = (event.removedate && JSON.parse(event.removedate).date) || [];

  console.log(removedDates) ; 
  const isDateRemoved = (date :any) => {
    console.log(date.toISOString());
    return removedDates.includes(date.toISOString())
  };

  if (custom?.type === 'Day') {
    while (currentDate <= endDate) {
      if (!isDateRemoved(currentDate)) {
        events.push({
          ...event,
          date: currentDate.toISOString(),
          endDate: new Date(currentDate.getTime() + duration).toISOString(),
        });
      }
      currentDate = addDays(currentDate, parseInt(custom.interval));
    }
  } else if (custom?.type === 'Week') {
    const weekDays = custom.by_day.map((day) => getWeekdayIndex(day));
    while (currentDate <= endDate) {
      weekDays.forEach((dayIndex) => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + ((7 + dayIndex - currentDate.getDay()) % 7));
        if (nextDate <= endDate && nextDate >= startDate && !isDateRemoved(nextDate)) {
          events.push({
            ...event,
            date: nextDate.toISOString(),
            endDate: new Date(nextDate.getTime() + duration).toISOString(),
          });
        }
      });
      currentDate = addWeeks(currentDate, parseInt(custom.interval));
    }
  } else if (custom?.type === 'Month') {
    const dayPattern = /Monthly on day (\d+)/;
    const weekdayPattern = /Monthly on the (\w+) (\w+)/;

    if (dayPattern.test(custom.by_month)) {
      const dayMatch = custom.by_month.match(dayPattern);
      const dayOfMonth = parseInt(dayMatch![1]);

      while (currentDate <= endDate) {
        const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth);
        if (nextDate <= endDate && nextDate >= startDate && !isDateRemoved(nextDate)) {
          events.push({
            ...event,
            date: nextDate.toISOString(),
            endDate: new Date(nextDate.getTime() + duration).toISOString(),
          });
        }
        currentDate = addMonths(currentDate, parseInt(custom.interval));
      }
    } else if (weekdayPattern.test(custom.by_month)) {
      const weekdayMatch = custom.by_month.match(weekdayPattern);
      const ordinal = weekdayMatch![1].toLowerCase();
      const weekday = weekdayMatch![2];
      const ordinalValue = ordinal === "first" ? 1 :
                          ordinal === "second" ? 2 :
                          ordinal === "third" ? 3 :
                          ordinal === "fourth" ? 4 : -1;
      const weekdayIndex = getWeekdayIndex(weekday);

      while (currentDate <= endDate) {
        const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        let count = 0;

        while (nextDate.getMonth() === currentDate.getMonth()) {
          if (nextDate.getDay() === weekdayIndex) {
            count++;
            if (count === ordinalValue) {
              break;
            }
          }
          nextDate.setDate(nextDate.getDate() + 1);
        }

        if (nextDate <= endDate && nextDate >= startDate && !isDateRemoved(nextDate)) {
          events.push({
            ...event,
            date: nextDate.toISOString(),
            endDate: new Date(nextDate.getTime() + duration).toISOString(),
          });
        }
        currentDate = addMonths(currentDate, parseInt(custom.interval));
      }
    } else {
      while (currentDate <= endDate) {
        if (!isDateRemoved(currentDate)) {
          events.push({
            ...event,
            date: currentDate.toISOString(),
            endDate: new Date(currentDate.getTime() + duration).toISOString(),
          });
        }
        currentDate = addMonths(currentDate, parseInt(custom.interval));
      }
    }
  } else if (custom?.type === 'Year') {
    while (currentDate <= endDate) {
      if (!isDateRemoved(currentDate)) {
        events.push({
          ...event,
          date: currentDate.toISOString(),
          endDate: new Date(currentDate.getTime() + duration).toISOString(),
        });
      }
      currentDate = addYears(currentDate, parseInt(custom.interval));
    }
  }

  return events;
};


// const generateCustomRecurrence = (event: Event): Event[] => {
//   const { start_date, custom } = event.recurrencedata!;
//   const startDate = new Date(start_date);
//   let currentDate = new Date(startDate);
//   let endDate: Date;

//   if (custom?.end_type === 'ondate') {
//     endDate = new Date(event.recurrencedata!.end_date!);
//   } else if (custom?.end_type === 'after') {
//     endDate = addDays(startDate, parseInt(custom.end_count) * parseInt(custom.interval));
//   } else {
//     endDate = addMonths(startDate, 6); // Default to 6 months if no end condition specified
//   }

//   const events: Event[] = [];
//   const originalEndDate = new Date(event.endDate!);
//   const duration = originalEndDate.getTime() - startDate.getTime();
  
//   if (custom?.type === 'Day') {
//     while (currentDate <= endDate) {
//       events.push({
//         ...event,
//         date: currentDate.toISOString(),
//         endDate: new Date(currentDate.getTime() + duration).toISOString(),
//       });
//       currentDate = addDays(currentDate, parseInt(custom.interval));
//     }
//   } else if (custom?.type === 'Week') {
//     const weekDays = custom.by_day.map(day => getWeekdayIndex(day));
//     while (currentDate <= endDate) {
//       weekDays.forEach(dayIndex => {
//         const nextDate = new Date(currentDate);
//         nextDate.setDate(currentDate.getDate() + ((7 + dayIndex - currentDate.getDay()) % 7));
//         if (nextDate <= endDate && nextDate >= startDate) {
//           events.push({
//             ...event,
//             date: nextDate.toISOString(),
//             endDate: new Date(nextDate.getTime() + duration).toISOString(),
//           });
//         }
//       });
//       currentDate = addWeeks(currentDate, parseInt(custom.interval));
//     }
//   } else if (custom?.type === 'Month') {
//     const dayPattern = /Monthly on day (\d+)/;
//     const weekdayPattern = /Monthly on the (\w+) (\w+)/;

//     if (dayPattern.test(custom.by_month)) {
//       // Case 1: Monthly on day {date}
//       const dayMatch = custom.by_month.match(dayPattern);
//       const dayOfMonth = parseInt(dayMatch![1]);

//       while (currentDate <= endDate) {
//         const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth);
//         if (nextDate <= endDate && nextDate >= startDate) {
//           events.push({
//             ...event,
//             date: nextDate.toISOString(),
//             endDate: new Date(nextDate.getTime() + duration).toISOString(),
//           });
//         }
//         currentDate = addMonths(currentDate, parseInt(custom.interval));
//       }
//     } else if (weekdayPattern.test(custom.by_month)) {
//       // Case 2: Monthly on {ordinal value} {weekday}
//       const weekdayMatch = custom.by_month.match(weekdayPattern);
//       const ordinal = weekdayMatch![1].toLowerCase();
//       const weekday = weekdayMatch![2];
//       const ordinalValue = ordinal === "first" ? 1 :
//                           ordinal === "second" ? 2 :
//                           ordinal === "third" ? 3 :
//                           ordinal === "fourth" ? 4 : -1;
//       const weekdayIndex = getWeekdayIndex(weekday);

//       while (currentDate <= endDate) {
//         const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Set to the first day of the month
//         let count = 0;

//         while (nextDate.getMonth() === currentDate.getMonth()) {
//           if (nextDate.getDay() === weekdayIndex) {
//             count++;
//             if (count === ordinalValue) {
//               break;
//             }
//           }
//           nextDate.setDate(nextDate.getDate() + 1);
//         }

//         if (nextDate <= endDate && nextDate >= startDate) {
//           events.push({
//             ...event,
//             date: nextDate.toISOString(),
//             endDate: new Date(nextDate.getTime() + duration).toISOString(),
//           });
//         }
//         currentDate = addMonths(currentDate, parseInt(custom.interval));
//       }
//     } else {
//       // Default monthly recurrence
//       while (currentDate <= endDate) {
//         events.push({
//           ...event,
//           date: currentDate.toISOString(),
//           endDate: new Date(currentDate.getTime() + duration).toISOString(),
//         });
//         currentDate = addMonths(currentDate, parseInt(custom.interval));
//       }
//     }
//   } else if (custom?.type === 'Year') {
//     while (currentDate <= endDate) {
//       events.push({
//         ...event,
//         date: currentDate.toISOString(),
//         endDate: new Date(currentDate.getTime() + duration).toISOString(),
//       });
//       currentDate = addYears(currentDate, parseInt(custom.interval));
//     }
//   }

//   return events;
// };



const generateStandardRecurrence = (event: Event): Event[] => {
  const { start_date, end_date, freq } = event.recurrencedata!;
  const timezone = event.timezone ; 
  // Parse start_date and end_date as UTC if they come with 'Z' or as local date with respect to event.timezone
  const startDate = new Date(event.date);
  const endDate = new Date(end_date);

  let rruleFreq: Frequency | undefined;

  switch (freq) {
    case "Daily":
      rruleFreq = RRule.DAILY;
      break;
    case "Weekly":
      rruleFreq = RRule.WEEKLY;
      break;
    case "Monthly":
      rruleFreq = RRule.MONTHLY;
      break;
    case "Yearly":
      rruleFreq = RRule.YEARLY;
      break;
    default:
      rruleFreq = undefined;
  }

  if (!rruleFreq) {
    return [event];
  }

  const options = {
    freq: rruleFreq,
    dtstart: startDate,
    until: endDate,
    tzid: timezone, // Use event timezone for recurrence calculations
  };

  const rule = new RRule(options);

  // Map each recurrence date to a modified event object with adjusted dates
  const modifiedEvents = rule.all().map(date => ({
    ...event,
    date: date.toISOString(), // Convert recurrence date to ISO string (UTC)
    endDate: new Date(new Date(event.endDate!).getTime() + (date.getTime() - startDate.getTime())).toISOString(), // Adjust end date based on recurrence rule
  }));

  return modifiedEvents;
};


const transformEventData = (data: any[]): Event[] => {
  let events: Event[] = [];
  data.forEach(event => {
    try{
      const transformedEvent: Event = {
        title: event.title,
        date: new Date(event.date).toISOString(),
        endDate: new Date(event.endDate).toISOString(),
        description: event.description,
        id: event.id.toString(),
        calendartype: event.calendartype,
        calendartypeid: event.calendartypeid,
        color: event.color,
        email: event.email,
        timezone: event.timezone,
        isrecurrence: event.isrecurrence,
        location: event.location,
        recurrencedata: event.recurrencedata ? JSON.parse(event.recurrencedata) : undefined,
        removedate: event.removedate
      };
      if (transformedEvent.isrecurrence && transformedEvent.recurrencedata) {
        if (transformedEvent.recurrencedata?.type === 'custom') {
          events = events.concat(generateCustomRecurrence(transformedEvent));
        } else {
          events = events.concat(generateStandardRecurrence(transformedEvent));
        }
      } else {
        events.push(transformedEvent);
      }
    }
    catch(error){
      console.error("Error transforming event: ", error);
    }
  });

  return events;
};

export default transformEventData ;

