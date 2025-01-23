import { kMaxLength } from 'buffer';
import { Event, RecurrenceData } from '../app/types/types';

// Mapping for two-letter day abbreviations to three-letter names
const dayMapping: Record<string, string> = {
  MO: 'Mon',
  TU: 'Tue',
  WE: 'Wed',
  TH: 'Thu',
  FR: 'Fri',
  SA: 'Sat',
  SU: 'Sun',
};

const dayMappingFull : Record<string, string> = {
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
  SU: 'Sundays',
};



// Mapping for RRULE FREQ values to readable strings
const freqMapping: Record<string, string> = {
  DAILY: 'Day',
  WEEKLY: 'Week',
  MONTHLY: 'Month',
  YEARLY: 'Year',
  RELATIVEMONTHLY : 'Month',
  ABSOLUTEMONTHLY : 'Month',
};

const convertToISOFormat = (dateStr: string): string => {
  if (dateStr) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.length > 8 ? dateStr.substring(9, 11) : '00';
    const minute = dateStr.length > 11 ? dateStr.substring(11, 13) : '00';
    const second = dateStr.length > 13 ? dateStr.substring(13, 15) : '00';
    console.log(hour , minute , second) ; 
    const milliseconds = "000";  // Default milliseconds as 000 if not provided
    const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}.${milliseconds}Z`;
    return formattedDate;
  }
  return '';
};

const ordinalSuffix = (i: number) => {
  switch (i) {
    case 1:
      return "first";
    case 2:
      return "second";
    case 3:
      return "third";
    case 4:
      return "fourth";
    default:
      return "first";
};
}

const addThreeYears = (date: string): string => {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + 3);
  const endDate = newDate.toISOString().replace('T', ' ').replace('.000Z', 'Z');
  return endDate
};


const parseRecurrence = (rrule: string , stdate :string , de_date :string): RecurrenceData | null => {
  const parts = rrule.replace('RRULE:', '').split(';');
  const ruleMap: Record<string, string> = {};
  parts.forEach((part) => {
    const [key, value] = part.split('=');
    ruleMap[key] = value;
  });


  const custom: RecurrenceData['custom'] = {
    interval: ruleMap['INTERVAL'] || '1',
    type: freqMapping[ruleMap['FREQ']] || '',
    end_type: ruleMap['COUNT'] ? 'after_occurrences' : 'ondate',
    end_count: ruleMap['COUNT'] || '',
    by_day: [],
    by_month: "",
  }

  if (ruleMap['FREQ'] === 'MONTHLY') {
    let byMonthDescription = '';
    if (ruleMap['BYDAY'] && ruleMap['BYDAY'].length > 2) {
      const day = dayMappingFull[ruleMap['BYDAY'].slice(-2)];
      const position = ordinalSuffix(parseInt(ruleMap['BYDAY'][0], 10));
      byMonthDescription = `Monthly on the ${position} ${day}`;
    } else{
      byMonthDescription = `Monthly on day ${new Date(de_date).getDate().toString()}`;
    }
    custom.by_month = byMonthDescription;
  } 
  else if (ruleMap['FREQ'] === 'WEEKLY') {
    if (ruleMap['BYDAY']) {
      custom.by_day = ruleMap['BYDAY'].split(',').map(day => dayMapping[day] || day);
    }
  }

  const endDate = ruleMap['UNTIL'] ? convertToISOFormat(ruleMap['UNTIL']) : addThreeYears(stdate);

  // Determine if the recurrence is "default" or "custom"
  const isDefault = custom.interval === '1' &&
    !custom.by_day.length &&
    !custom.by_month &&
    !custom.end_count &&
    ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(ruleMap['FREQ']);

    const recData = {
      type: 'custom',
      custom,
      freq: ruleMap['FREQ'] || '',
      start_date: stdate,
      end_date: endDate,
    }
  return recData;
};

const parseRecurrenceForOutlook = (recurrence: any, startDate: string, stdate: string): RecurrenceData | null => {
  const { pattern, range } = recurrence;
  const custom: RecurrenceData['custom'] = {
    interval: pattern.interval.toString() || '1',
    type: freqMapping[pattern.type.toUpperCase()] || '',  // Day, Week, Month, Year
    end_type: range.numberOfOccurrences ? 'after_occurrences' : 'ondate',
    end_count: range.numberOfOccurrences ? range.numberOfOccurrences.toString() : '',
    by_day: [],
    by_month: "",
  };

  // WEEKLY: Handle days of the week (BYDAY)
  if (pattern.type === 'weekly' && pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
    console.log(pattern.daysOfWeek) ; 
    custom.by_day = pattern.daysOfWeek.map((day: string) => {
      const uc = day[0].toUpperCase() ; 
      const substring = day.substring(1 ,3) ; 
      return uc + substring ; 
    });

    console.log(custom.by_day) ; 
  }

  // MONTHLY: Handle day of the month or relative (BYMONTH)
  if (pattern.type === 'absoluteMonthly' || pattern.type === 'relativeMonthly') {
    let byMonthDescription = '';
    if (pattern.type === 'relativeMonthly' && pattern.dayOfWeek) {
      const day = dayMappingFull[pattern.dayOfWeek.toUpperCase()];
      const position = ordinalSuffix(pattern.index); 
      byMonthDescription = `Monthly on the ${position} ${day}`;
    } else if (pattern.type === 'absoluteMonthly' && pattern.dayOfMonth) {
      byMonthDescription = `Monthly on day ${pattern.dayOfMonth}`;
    }
    custom.by_month = byMonthDescription;
  }

  // End date for the recurrence
  const endDate = range.endDateTime ? new Date(range.endDateTime).toISOString() : addThreeYears(stdate);

  // Return structured recurrence data
  const recData: RecurrenceData = {
    type: 'custom',  
    custom: custom,
    freq: 'custom',
    start_date: startDate,
    end_date: endDate,
  };

  console.log(recData) ; 

  return recData;
};


export const transformGoogleEvent = (googleEvent: any): Event => {
    let recurrenceData: RecurrenceData | null = null;

    let startDate: string | null = null;

    // Attempt to determine the start date from googleEvent.start
    try {
      if (googleEvent.start?.dateTime) {
        // Handle events with specific time (dateTime)
        const tempDate = new Date(googleEvent.start.dateTime);
        
        // Validate the dateTime
        if (!isNaN(tempDate.getTime())) {
          startDate = tempDate.toISOString();
        } else {
          console.error("Invalid dateTime format in googleEvent.start.dateTime");
        }
      } else if (googleEvent.start?.date) {
        // Handle all-day events (date only)
        const tempDate = new Date(googleEvent.start.date);
        
        // Validate the date
        if (!isNaN(tempDate.getTime())) {
          // Manually adjust for UTC midnight to avoid timezone shifts
          startDate = tempDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
        } else {
          console.error("Invalid date format in googleEvent.start.date");
        }
      }
    } catch (error) {
      console.error("Error parsing the start date:", error);
    }

      if(!startDate){
        return {} as Event ; 
      }

    const endDate = googleEvent.end?.dateTime ? new Date(googleEvent.end.dateTime).toISOString() : new Date(googleEvent.start.date).toISOString();

    const isValidDate = (dateString: string): boolean => {
      const date = new Date(dateString);
      return !isNaN(date.getTime()); 
    };

    const year = startDate.substring(0, 4);
    const month = startDate.substring(5, 7);
    const day = startDate.substring(8, 10);
    const hour = startDate.substring(11, 13);
    const minute = startDate.substring(14, 16);
    const second = startDate.substring(17, 19);
    const milliseconds = "000"; 
    const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}.${milliseconds}Z`;


    if (googleEvent.recurrence && googleEvent.recurrence.length > 0) {
      if("dateTime" in googleEvent.start){
        recurrenceData = parseRecurrence(googleEvent.recurrence[0] , formattedDate , googleEvent.start.dateTime );
      }else{
      recurrenceData = parseRecurrence(googleEvent.recurrence[0] , formattedDate , googleEvent.start.date );

      }
    }



    const event: Event = {
      date: startDate,
      endDate: endDate,
      title: googleEvent.summary || 'No Title',
      description: googleEvent.description || '',
      id: '',
      calendartype: 'google',  // Ensure this is consistently 'google' for Google events
      calendartypeid: googleEvent.id!,
      color: googleEvent.colorId || '#42A5F5',
      email: googleEvent.organizer.email || '',
      timezone: googleEvent.start?.timeZone || 'UTC',
      isrecurrence: googleEvent.recurrence ? 1 : 0,
      location: googleEvent.location || '',
      recurrencedata: recurrenceData!,
    };


    return event;
  };

export const transformOutlookEvent = (outlookEvent: any): Event => {
      let recurrenceData: RecurrenceData | null = null;

      console.log("Reached Here") ; 

      let startDate: string | null = null;

      try {
        if (outlookEvent.start?.dateTime) {
          const tempDate = new Date(outlookEvent.start.dateTime);
        
          if (!isNaN(tempDate.getTime())) {
            startDate = tempDate.toISOString();
          } else {
            console.error("Invalid dateTime format in outlookEvent.start.dateTime");
          }
        } else if (outlookEvent.start?.date) {
          const tempDate = new Date(outlookEvent.start.date);
        

          if (!isNaN(tempDate.getTime())) {
            startDate = tempDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
          } else {
            console.error("Invalid date format in outlookEvent.start.date");
          }
        }
      } catch (error) {
        console.error("Error parsing the start date:", error);
      }

      if (!startDate) {
        return {} as Event;
      }

      // Determine the end date (similar to the Google implementation)
      const endDate = outlookEvent.end?.dateTime
        ? new Date(outlookEvent.end.dateTime).toISOString()
        : new Date(outlookEvent.start.date).toISOString();

      const isValidDate = (dateString: string): boolean => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      };

      const year = startDate.substring(0, 4);
      const month = startDate.substring(5, 7);
      const day = startDate.substring(8, 10);
      const hour = startDate.substring(11, 13);
      const minute = startDate.substring(14, 16);
      const second = startDate.substring(17, 19);
      const milliseconds = "000"; 
      const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}.${milliseconds}Z`;

      // Recurrence parsing for Outlook (similar structure)
      if (outlookEvent.recurrence && outlookEvent.recurrence.pattern) {
        if ("dateTime" in outlookEvent.start) {
          recurrenceData = parseRecurrenceForOutlook(outlookEvent.recurrence, formattedDate, outlookEvent.start.dateTime);
        } else {
          recurrenceData = parseRecurrenceForOutlook(outlookEvent.recurrence, formattedDate, outlookEvent.start.date);
        }
      }

      // Construct the Event object based on Outlook event structure
      const event: Event = {
        date: startDate,
        endDate: endDate,
        title: outlookEvent.subject || 'No Title',
        description: outlookEvent.bodyPreview || '',
        id: '',
        calendartype: 'outlook', // Set 'outlook' to distinguish it from Google
        calendartypeid: outlookEvent.id!,
        color: outlookEvent.color || '#42A5F5', // Outlook uses different color fields
        email: outlookEvent.organizer?.emailAddress?.address || '',
        timezone: outlookEvent.start?.timeZone || 'UTC',
        isrecurrence: outlookEvent.recurrence ? 1 : 0,
        location: outlookEvent.location?.displayName || '',
        recurrencedata: recurrenceData!,
      };


      return event;
};