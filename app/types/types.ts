// types.ts
export interface RecurrenceData {
    type: string;
    custom: {
      interval: string;
      type: string; // Day, Week, Month, Year
      end_type: string; // after_months, on_date, after_occurrences
      end_count: string;
      by_day: Array<string>;  
      by_month: string; // Monthly on the first Friday
    } | null ; 
    freq: string;
    start_date: string | Date;
    end_date: string | Date;
  }
  
export interface Event {
    date: string | Date;
    endDate: string | Date;
    title: string;
    description?: string;
    id: string; 
    localIndex?: string;// Ensure this is always a string
    calendartype: string;
    calendartypeid: string | undefined; //
    color: string;
    timezone: string;
    email: string;
    isrecurrence: number;
    location :string 
    recurrencedata?: RecurrenceData ;
    recenddate?: string | Date ; 
    removedate?: string ; 
  }

  export interface BackendEvent {
    StartDate: string | Date;
    EndDate: string | Date;
    Title: string;
    Id: number;
    Color: string;
    Recurrence: number | undefined;
    timezone: string;
    recurrencedata: string;
    Location: string;
    Description: string;
    recenddate :string | Date;
    calendartypeid : string | undefined;
    calendartype :string | undefined;
    email :string | undefined;
  }
  

  export interface PublicCalendar {
    id: number;
    calendarName: string;
    sharedBy: string;
    calendarDescription: string;
    approvalrequired: boolean;
    isRequested: boolean;
    isSubscribed: boolean;
  }

  export interface Alert {
    id: number;
    name: string;
    description: string;
    type: string;
    start: string;
    end: string;
    action?: string;
  }
  
  enum Action {
    Verified , 
    NotVerified
  }
  
  export interface AutoLoginResponse {
    code : string ; 
    action : Action, 
    isAdmin : boolean ,
    isschooladmin : boolean
  }