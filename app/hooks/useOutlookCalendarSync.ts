import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { eventsState } from '@/app/recoil/atom';
import DOMPurify from 'dompurify';
import { getAccessToken } from '@/utils/api'; // Assume these are your backend API functions
import { getOutlookCalendarEvents } from '@/utils/outlookapi';
import { loginRequest } from '@/msalConfig';
import { AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';

const prepareEventsForWorker = (events: any) => {
  return events.map((event: any) => ({
    ...event,
    description: DOMPurify.sanitize(event.body?.content || ''), // Sanitize the event body/content
  }));
};

const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await fetch('/api/outlook/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    console.log(response) ; 
    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    };
  } catch (error) {
    console.error("Error in refreshing token:", error);
    throw error;
  }
};

export const useOutlookCalendarSync = () => {
  const [events, setEvents] = useRecoilState(eventsState);
  const [loading, setLoading] = useState(false);
  const { instance: msalInstance, accounts } = useMsal();

  const syncOutlookCalendar = async () => {
    setLoading(true);

    try {
      // Step 1: Get the access token and refresh token from the backend
      const tokenData = await getAccessToken(localStorage.getItem('token')!);
      let { accessToken, refreshToken } = tokenData.find( (f :any)  => f.caltype === 2);

      console.log(accessToken , refreshToken);  


      // Step 2: Verify if the access token is valid
      const isValid = accessToken ? await verifyToken(accessToken) : false;

      console.log(isValid); 

      // Step 3: If the token is invalid or expired, refresh it if we have a refresh token
      if (!isValid && refreshToken) {
        try {
          const refreshedTokenData = await refreshAccessToken(refreshToken);
          accessToken = refreshedTokenData.accessToken;
          refreshToken = refreshedTokenData.refreshToken ?? refreshToken;

        } catch (error) {
          accessToken = undefined;
          console.error("Refresh token failed:", error);
        }
      }

      // Step 4: If access token is still unavailable, fall back to interactive login
      if (!accessToken) {
        try {
          const loginResponse: AuthenticationResult = await msalInstance.loginPopup({
            ...loginRequest,
          });
          accessToken = loginResponse.accessToken;
          refreshToken = loginResponse.idToken ; 
        } catch (loginError) {
          console.error("Login failed:", loginError);
          setLoading(false);
          return;
        }
      }

      // Step 5: Sync calendar with a valid access token
      if (accessToken) {
        await syncCalendarWithToken(accessToken);
      } else {
        console.error("Failed to acquire a valid access token");
      }
    } catch (error) {
      console.error("Error during Outlook Calendar sync:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncCalendarWithToken = async (accessToken: string) => {
    try {
      const outlookEvents = await getOutlookCalendarEvents(accessToken);

      if (!outlookEvents || outlookEvents.length === 0) {
        console.error("No Outlook Events fetched.");
        return;
      }

      // Sanitize the events before passing them to the worker
      const sanitizedEvents = prepareEventsForWorker(outlookEvents);

      // Pass the sanitized events to a web worker for background processing
      const worker = new Worker(new URL('../workers/outlookCalendarWorker.ts', import.meta.url));
      const token = localStorage.getItem('token');
      worker.postMessage({
        token,
        accessToken,
        events: sanitizedEvents,
      });

      worker.onmessage = (event) => {
        const { type, events, message } = event.data;
        if (type === 'debug') {
          console.log('Worker Debug:', message);
        } else if (type === 'success') {
          setEvents([...events]); // Update Recoil state with the processed events
        } else if (type === 'error') {
          console.error("Error syncing Outlook Calendar:", message);
        }
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
      };
    } catch (error) {
      console.error("Error fetching Outlook Calendar events:", error);
    }
  };

  const verifyToken = async (accessToken: string) => {
    try {
      // Call a minimal Microsoft Graph API endpoint to verify the token
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        return true; // Token is valid
      } else {
        console.warn("Access token is invalid or expired.");
        return false;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      return false; // Token is invalid
    }
  };

  return { syncOutlookCalendar, loading }; // Return the sync function and loading state
};
