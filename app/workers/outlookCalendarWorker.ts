// Import statements remain unchanged
import { getGoogleCalendarEvents, checkDuplicates, createEvent, setAccessToken } from "@/utils/api";
import { transformGoogleEvent, transformOutlookEvent } from "@/utils/transformEvents";

interface WorkerEvent {
    accessToken: string;
    token: string;
    events: any[]; 
    // userInfo : any 
}

onmessage = async function (event: MessageEvent<WorkerEvent>) {
    const { token, accessToken, events } = event.data;

    try {
        this.postMessage({ type: 'debug', message: 'Starting event transformation.' });
        
        const transformEvents = events.map(transformOutlookEvent);

        this.postMessage({ type: 'debug', message: transformEvents});

        const eventIDs = transformEvents.map((event: any) => event.calendartypeid);

        const nonDuplicateEventIDs = await checkDuplicates(token, eventIDs);

        const nonDuplicateEvents = transformEvents.filter((event: any) =>
            nonDuplicateEventIDs.includes(event.calendartypeid)
        );

        console.log(nonDuplicateEvents);

        const existingEvents = await getGoogleCalendarEvents(accessToken);


        const backendEvents =await Promise.all(
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

        this.postMessage({ type: 'success', events: backendEvents });
    } catch (error: any) {
        this.postMessage({ type: 'error', message: error });
    }
};
