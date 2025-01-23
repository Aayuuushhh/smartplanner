// Import statements remain unchanged
import { getGoogleCalendarEvents, checkDuplicates, createEvent, setAccessToken } from "@/utils/api";
import { transformGoogleEvent } from "@/utils/transformEvents";

interface WorkerEvent {
    accessToken: string;
    token: string;
    refreshToken: string;
    startOfMonth: string;
    endOfNextMonth: string;
    events: any[]; 
    userInfo : any
    caltype : number 
    scope : string  // Array of events sent from the main thread
}

onmessage = async function (event: MessageEvent<WorkerEvent>) {
    const { token, accessToken, refreshToken ,startOfMonth, endOfNextMonth, events , userInfo ,caltype ,scope} = event.data;

    try {
        // Since events are already sanitized, no need to sanitize here
        const transformEvents = events.map(transformGoogleEvent);

        console.log(transformEvents) ; 

        const eventIDs = transformEvents.map((event: any) => event.calendartypeid);

        const nonDuplicateEventIDs = await checkDuplicates(token, eventIDs);

        const nonDuplicateEvents = transformEvents.filter((event: any) =>
            nonDuplicateEventIDs.includes(event.calendartypeid)
        );

        console.log(nonDuplicateEvents);    

        const existingEvents = await getGoogleCalendarEvents(accessToken);

        console.log(nonDuplicateEvents) ; 

        const backendEvents = await Promise.all(
            nonDuplicateEvents.map(async (event: any) => {
                const backendEvent = {
                    StartDate: event.date!,
                    EndDate: event.endDate!,
                    Title: event.title!,
                    Id: 0, // Backend will assign the ID
                    Color: event.color!,
                    Recurrence: event.isrecurrence,
                    calendartype: event.calendartype,
                    calendartypeid: event.calendartypeid,
                    email: event.email!,
                    timezone: event.timezone!,
                    recurrencedata: event.recurrencedata
                        ? JSON.stringify(event.recurrencedata)
                        : "",
                    Location: event.location!,
                    Description: event.description || "", // Already sanitized
                    recenddate: "",
                };

                const createdEvent = await createEvent(backendEvent, token);
                if (createdEvent && createdEvent.Id) {
                    event.id = createdEvent.Id.toString();
                }
                return event;
            })
        );
        if(userInfo){
        const response = await setAccessToken(token ,accessToken, userInfo.email , userInfo.name , refreshToken , scope ,caltype  ); 

        }
        this.postMessage({ type: 'success', events: backendEvents });
    } catch (error: any) {
        this.postMessage({ type: 'error', message: error.message });
    }
};


