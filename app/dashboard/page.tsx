"use client";
import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import EventDialog from "../../components/EventDialog";
import SidebarAbs from "@/components/SidebarAbs";
import { useRecoilState, useRecoilValue } from "recoil";
import { eventsFetchedState, eventsState, isSchoolAdminState, loadingState, notificationsState, themeState , autoLoginRetriesState, isAdminState} from "../recoil/atom";
import { getAllEvents, createEvent, autoLogin, handleDelete, getSubsCalendars, getSubscribedCalendarEvent , getNotificationSettings, getDeletedEvents, setDeletedEvent} from "@/utils/api";
import generateFingerprint from "@/utils/deviceId";
import { useRouter } from "next/navigation";
import transformEventData from "@/utils/recurrence";
import { Event, BackendEvent, PublicCalendar, AutoLoginResponse } from "../types/types";
import Navbar from "@/components/Navbar";
import EventsSidebar from "@/components/EventsSidebar";
import AlertsMarquee from "@/components/Marquee";
import axios from "axios";
import BeatLoader from "react-spinners/BeatLoader";
import { getFormattedDate } from "@/utils/formatDate";
// import notificationSound from "../../assets/notificationSound.wav" ;


export default function Home() {
  const [allEvents, setAllEvents] = useRecoilState(eventsState);
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<Partial<Event>>({});
  const [autoLoginRetires, setAutoLoginRetires] = useRecoilState(autoLoginRetriesState); 
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>([]);
  const [calendars, setCalendars] = useState<PublicCalendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string | undefined>();
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const [isEventsFetched, setEventsFetchedState] = useRecoilState(eventsFetchedState);
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const router = useRouter();
  const isInitialized = useRef<boolean>(false);
  const [theme , setTheme ] = useRecoilState(themeState);
  const [loading , setLoading] = useRecoilState(loadingState);
  const [notificationTime, setNotificationTime] = useRecoilState(notificationsState) ;
  const [isSettingsFetched, setIsSettingsFetched] = useState(false);
  const notificationRef = useRef<HTMLAudioElement | null>(null);
  const todaysEventsRef = useRef<Event[]>([]);
  const notificationTimeRef = useRef("") ;  
  const [todaysEvents, setTodaysEvents] = useState<Event[]>([]);
  const notificationSound = "../../assets/notificationSound.wav";

  const [isSchoolAdmin, setIsSchoolAdmin] = useRecoilState(isSchoolAdminState);
  const [isAdmin, setIsAdmin] = useRecoilState(isAdminState) ; 

  const [isOnline, setIsOnline] = useState(true);

  function convertToUTC(dateString : string | Date ) {

    const dateParts = (dateString as unknown as string ).split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);


    // Return the UTC string
    const localTime = dateString.toLocaleString();

    return localTime;
}
const fetchEvents = async () => {
  if (isEventsFetched) return;

  const token = localStorage.getItem("token");
  if (token) {
    try {
      const events = await getAllEvents(token);
      const transformedEvents = transformEventData(events);
      // Add localIndex field
      const eventsWithLocalIndex = transformedEvents.map((event, index) => {
        if (event.id === "-1") {
          event.date = (event.date as unknown as string).split('T')[0];
        }
        return {
          ...event,
          localIndex: index.toString(), // Add localIndex field
        };
      });

      setAllEvents(eventsWithLocalIndex);
      setEventsFetchedState(true);

      const today = new Date();
      const todaysEvents = eventsWithLocalIndex.filter(event => isSameDay(event.date, today));
      setTodaysEvents(todaysEvents);
      todaysEventsRef.current = todaysEvents; // Update ref with latest events
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }
};

  const fetchNotificationSetting = async () => {
    try {
      const token =localStorage.getItem("token") as string; 
      let response = await getNotificationSettings(token) ; 
      if (response && response.status === 200) {
        const data = JSON.parse(response.data.data);
        if(data.onEvent){
          const timeValue = data.before30 ? "30" : data.before60 ? "60" : "0";
          setNotificationTime(timeValue);
          setIsSettingsFetched(true);
          notificationTimeRef.current = timeValue ; 
        }
      } else {
        console.error("Failed to fetch notification setting:", response!.data);
      }
    } catch (error) {
      console.error("Error fetching notification setting:", error);
    }
  }

  const isSameDay = (date1:any, date2 :any) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };


  const checkForNotifications = () => {
    if (!notificationTime || notificationTime === "0") {
      return;
    }

    const now = new Date().getTime();
    const notificationOffset = notificationTime === "60" ? 60 * 60000 : 30 * 60000;

    todaysEventsRef.current = todaysEventsRef.current.filter(event => {
      const eventTime = new Date(event.date).getTime();
      const notificationTriggerTime = eventTime - notificationOffset;

      if (now >= notificationTriggerTime && now <= notificationTriggerTime + 120000) {
        showBrowserNotification(event);
        return false;
      }

      return true;
    });
  };


  const showBrowserNotification = (event: Event) => {
    if (Notification.permission === "granted") {
      new Notification(`Reminder: ${event.title} starts in ${notificationTimeRef.current} minutes!`);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(`Reminder: ${event.title} starts in ${notificationTimeRef.current} minutes!`);
        }
      });
    }
  };

  useEffect(() => {
    setFormattedDate(getFormattedDate(selectedDate));
  }, [setFormattedDate]);

  useEffect(() => {

    notificationRef.current = new Audio(notificationSound);

    if (!isInitialized.current) {
      isInitialized.current = true;
      initializeApp();
    }

    async function initializeApp() {
      const email = localStorage.getItem("email")
      if(!email){
        router.push("/login");
        return;
      }

      const loggedIn = await autoLogin(email);

      if (loggedIn === "Auto login failed") {
        setAutoLoginRetires( (previousState) => { 
          return previousState + 1;
        });
        router.push("/login");
        return ; 
      }

      localStorage.setItem("token" , "Bearer " + loggedIn.code) ;
      const isSchoolAdminTrue = loggedIn.isschooladmin ? true : false;
      const isAdminTrue = loggedIn.isAdmin ? true : false ; 
      if (isAdminTrue) {
        setIsAdmin(true);
      }
      else{
        setIsAdmin(false); 
      }
      setIsSchoolAdmin(isSchoolAdminTrue);


      fetchCalendars();
      fetchEvents();
      fetchNotificationSetting();

      const intervalId = setInterval(() => {
        checkForNotifications();
      }, 30000); // 30 seconds
  
      return () => clearInterval(intervalId);// Clear interval on unmount

    }

    async function fetchCalendars() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const fetchedCalendars = await getSubsCalendars(token);
          setCalendars(fetchedCalendars);
        } catch (error) {
          console.error("Error fetching calendars:", error);
        }
      }
    }
    setIsOnline(navigator.onLine);

    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    return () => {
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
   
  }, [router, setAllEvents,setCalendars,fetchEvents, setIsSchoolAdmin , setIsAdmin , checkForNotifications, fetchNotificationSetting , setAutoLoginRetires]);

  useEffect(() => {
    let t = localStorage.getItem("theme");
    if(!t){
      t = "light";
      localStorage.setItem("theme", t);
    }
    setTheme(t!);
  }, [selectedDate, allEvents , setTheme]);

  const handleDateClick = (arg: any) => {
    const clickedDate = new Date(arg.date);
    if (clickedDate.toDateString() !== selectedDate.toDateString()) {
      // Batch the state updates together
      const newFormattedDate = getFormattedDate(clickedDate);
      setSelectedDate(clickedDate);
      setFormattedDate(newFormattedDate);
      
      // Update events for the selected date immediately
      const eventsOnSelectedDate = allEvents.filter(
        (event) => new Date(event.date).toDateString() === clickedDate.toDateString()
      );
      setEventsForSelectedDate(eventsOnSelectedDate);
    }
  };
  

  const handleAddEventClick = () => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 10 * 60000); // Now + 10 minutes
    const endDate = new Date(startDate.getTime() + 60 * 60000); // Start date + 1 hour

    setSelectedEvent({
      date: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isrecurrence: 0,
      recurrencedata: {
        type: "default",
        custom: null,
        freq: "Do not Repeat",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
    setIsOpen(true);
  };

  useEffect(() => {console.log(isAdmin)} ,[isAdmin] ) ; 
  const handleEventClick = async (info: any) => {

    const token = localStorage.getItem("token");

    try {
      // Fetch the event data from the server
      const eventResponse = await axios.post(
        `https://anisoft.us/calendar/api/calendar/geteventbyid?id=${info.event.id}`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
  
      if (eventResponse) {
        // Extract the server data
        const eventData = eventResponse.data;
        // Get the clicked date (without time)
        const clickedDate = new Date(info.event.start);
        const year = clickedDate.getFullYear();
        const month = clickedDate.getMonth();
        const day = clickedDate.getDate();
  
        // Extract the time from the server response (startDate)
        const serverStartTime = new Date(eventData.startDate);
        const serverEndTime = new Date(eventData.endDate);
  
        // Preserve the time from the server, but use the clicked date
        const adjustedStartDate = new Date(
          year,
          month,
          day,
          serverStartTime.getHours(),
          serverStartTime.getMinutes(),
          serverStartTime.getSeconds()
        );
  
        const adjustedEndDate = new Date(
          year,
          month,
          day,
          serverEndTime.getHours(),
          serverEndTime.getMinutes(),
          serverEndTime.getSeconds()
        );
  
        // Adjust the event and update the state
        const adjustedEvent = {
          ...eventData,
          date: adjustedStartDate.toISOString(), // Set the new start date
          endDate: adjustedEndDate.toISOString(), // Set the new end date
          recurrencedata: eventData.recurrencedata ? JSON.parse(eventData.recurrencedata) : "",
        };

        setSelectedEvent(adjustedEvent);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };
  
  
  
  const handleClose = () => {
    setIsOpen(false);
    setSelectedEvent({});
  };

  const handleSave = async () => {
    if (selectedEvent.title && selectedEvent.date && selectedEvent.endDate) {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      if (token && email) {
        try {
          let updatedEvents: Event[] = [];

          if (selectedEvent.id) {
            updatedEvents = allEvents.map((event) =>
              event.id === selectedEvent.id
                ? {
                    ...event,
                    ...selectedEvent,
                    id: event.id,
                    calendartype: selectedEvent.calendartype || event.calendartype,
                    calendartypeid: selectedEvent.calendartypeid || event.calendartypeid,
                  } as Event
                : event
            );
          } else {
            const newEvent: Event = {
              date: selectedEvent.date!,
              endDate: selectedEvent.endDate!,
              title: selectedEvent.title!,
              id: Date.now().toString(),
              color: selectedEvent.color || "#42A5F5",
              timezone: selectedEvent.timezone || "Asia/Kolkata",
              email,
              isrecurrence: selectedEvent.isrecurrence ?? 0,
              recurrencedata: selectedEvent.recurrencedata,
              calendartype: "defaultType",
              calendartypeid: "1",
              location: selectedEvent.location || "",
              description: selectedEvent.description || "",
              recenddate:selectedEvent.isrecurrence ? selectedEvent.recurrencedata?.end_date!.toString().replace(' ', 'T') : "",
            };

            const backendEvent: BackendEvent = {
              StartDate: newEvent.date!,
              EndDate: newEvent.endDate!,
              Title: newEvent.title!,
              Id: 0,
              Color: newEvent.color!,
              email: "", 
              Recurrence: newEvent.isrecurrence,
              timezone: newEvent.timezone!,
              recurrencedata: newEvent.recurrencedata ? JSON.stringify(newEvent.recurrencedata) : "",
              Location: newEvent.location!,
              Description: newEvent.description || "",
              recenddate: newEvent.isrecurrence? newEvent.recenddate! : "",
              calendartype : "" ,
              calendartypeid : ""
            };
            const createdEvent = await createEvent(backendEvent, token);
            newEvent.id = createdEvent.id.toString();
            updatedEvents = [...allEvents, newEvent];
          }

          setAllEvents(updatedEvents);
          handleClose();
          location.reload();
        } catch (error) {
          console.error("Error saving event:", error);
        }
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent.id) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const success = await handleDelete(
            Number(selectedEvent.id),
            token
          );
          if (success) {
            const remainingEvent = (allEvents.filter((event) => event.id != selectedEvent.id))
            setAllEvents(remainingEvent);
            handleClose();
          } else {
            console.error("Error deleting event: backend returned false");
          }
        } catch (error) {
          console.error("Error deleting event:", error);
        }
      }
    }
  };


  const handleDeleteEventSingular = async () => {
    //first ge the deleted for this event 
    const token = localStorage.getItem('token' ) || ''; 
    const res = await getDeletedEvents(token ,Number(selectedEvent.id)) ;

    if (res.date === null) {
      // If null, create an object with a date array containing the event's date
      res.date = JSON.stringify({ date: [selectedEvent.date] });
    } else {
      // If not null, decode the response.date into a JSON object
      const decodedDate = JSON.parse(res.date);

      // Append the event's date to the existing date array
      decodedDate.date.push(selectedEvent.date);

      // Reassign the updated JSON object as a string back to response.date
      res.date = JSON.stringify(decodedDate);
    }


    // Call setDeletedEvents with the updated response
    const isAppended = await setDeletedEvent(token, res);
    
    if(isAppended.action === 'success') {
      const remainingEvent = (allEvents.filter(
        (e) => !(e.date === selectedEvent.date && e.title === selectedEvent.title)
      ))
      setAllEvents(remainingEvent);
      handleClose();
      setShowDeleteOptions(false);
    }
  };


  const handleCalendarChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCalendar(e.target.value);
    const token = localStorage.getItem("token");
    const id = parseInt(e.target.value);
    if (token) {
      if(id === -1 ){
        try {
          setShowCalendarDropdown((prev) => !prev);
          const events = await getAllEvents(token);
          const transformedEvents = transformEventData(events);
          const eventsWithLocalIndex = transformedEvents.map((event, index) => ({
            ...event,
            localIndex: index.toString(), // Add localIndex here
          }));
          setAllEvents(eventsWithLocalIndex);
          setEventsFetchedState(true);
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      } else {
        try {
          setShowCalendarDropdown((prev) => !prev);
          const Events = await getSubscribedCalendarEvent(id, token);
          const transformedEvents = transformEventData(Events);
          const eventsWithLocalIndex = transformedEvents.map((event, index) => ({
            ...event,
            localIndex: index.toString(), // Add localIndex here
          }));
          setAllEvents(eventsWithLocalIndex);
        } catch (error) {
          console.error("Error fetching subscribed calendar events:", error);
        }
      }
    }
  };

  const toggleCalendarDropdown = () => {
    setShowCalendarDropdown((prev) => !prev);
  };

  

  if (!isOnline) {
    return (
      <div className="flex justify-center items-center mt-[20%]">
        
        <h2 className="text-3xl">You are currently offline. Please check your internet connection.</h2>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-gray-900 text-white'} transition-colors duration-500`}>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <BeatLoader color="#ff0000" />
        </div>
      )}
      <div className="flex flex-col h-screen">
        <AlertsMarquee />
        
        <Navbar
          selectedCalendar={selectedCalendar || 'Select Calendar'}
          calendars={calendars}
          onCalendarChange={handleCalendarChange}
        />
        <div className="flex flex-1 overflow-hidden m-4">
          <div className="flex-grow overflow-auto">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              headerToolbar={{
                left: 'dayGridMonth,timeGridWeek,timeGridDay',
                center: 'title',
                right: 'today prev next',
              }}
              eventClassNames={(args) =>{
                if(args.event.id == '-1'){
                  return ['special-event'] ; 
                }
                return [] ; 
              }}
              events={allEvents}
              nowIndicator={true}
              editable={true}
              droppable={true}
              selectable={true}
              selectMirror={true}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="100%"
              key={JSON.stringify(allEvents)}
            />
          </div>
          <div className="w-1/4 flex-shrink-0 overflow-auto border-gray-200 dark:border-gray-700">
            <EventsSidebar
              key={selectedDate.toISOString()}
              onAddEventClick={handleAddEventClick}
              formattedDate={formattedDate!}
              eventsForSelectedDate={eventsForSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </div>
      <EventDialog
        isOpen={isOpen}
        onClose={handleClose}
        event={selectedEvent}
        setEvent={setSelectedEvent}
        onSave={handleSave}
        onDelete={handleDeleteEvent}
        handleDelete={handleDeleteEventSingular}
        showDeleteOptions={showDeleteOptions} // Pass the state
        setShowDeleteOptions={setShowDeleteOptions}
      />
    </div>
  )
}
