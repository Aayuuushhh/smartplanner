import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import axios from "axios";

const oauth2client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/google-calendar/callback`
);

async function fetchCalendarEvents(accessToken: string) {
  const allEvents: any[] = [];
  let nextPageToken: string | undefined;
  const now = new Date();

  do {
    const { data } = await axios.get(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        params: {
          timeMin: now.toISOString(),
          timeMax: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          pageToken: nextPageToken,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    allEvents.push(...data.items);
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return allEvents;
}

function transformEvent(event: any) {
  return {
    date: event.start?.dateTime || event.start?.date || '',
    endDate: event.end?.dateTime || event.end?.date || '',
    title: event.summary || '',
    description: event.description || '',
    id: event.id || '',
    calendartype: 'Google Calendar',
    calendartypeid: event.id || '',
    color: '#4285F4', // Google's Calendar blue color
    timezone: event.start?.timeZone || 'UTC',
    email: event.creator?.email || '',
    isrecurrence: event.recurringEventId ? 1 : 0,
    location: event.location || '',
    recurrencedata: event.recurringEventId ? { 
      recurringEventId: event.recurringEventId, 
      originalStartTime: event.originalStartTime?.dateTime || event.originalStartTime?.date || '' 
    } : undefined,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code missing' });
  }

  try {
    const { tokens } = await oauth2client.getToken(code as string);
    oauth2client.setCredentials(tokens);

    const events = await fetchCalendarEvents(tokens.access_token as string);
    const transformedEvents = events.map(transformEvent);

    return NextResponse.json({ events: transformedEvents });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message });
  }
}
