import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { eventsState } from '@/app/recoil/atom';
import { useGoogleLogin } from '@react-oauth/google';
import { fetchUserInfo, getAccessToken, getGoogleCalendarEvents } from '@/utils/api';
import DOMPurify from 'dompurify';

// Function to verify the token using Google's tokeninfo API
const verifyToken = async (accessToken: string) => {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    if (!response.ok) {
      throw new Error('Token is invalid or expired');
    }

    const data = await response.json();
    return data && data.expires_in > 0; // If the token is valid and not expired
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

const prepareEventsForWorker = (events :any) => {
  return events.map((event :any)=> ({
      ...event,
      description: DOMPurify.sanitize(event.description || "") // Sanitize here
  }));
};

export const useGoogleCalendarSync = () => {
  const [events, setEvents] = useRecoilState(eventsState);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  // Google login hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const authorizationCode = tokenResponse.code;

        const serverResponse = await fetch('/api/google/exchange-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: authorizationCode }),
        });
  
        if (!serverResponse.ok) {
          throw new Error('Failed to exchange code for tokens');
        }
        const data = await serverResponse.json();
        const { accessToken, refreshToken, userInfo } = data;
  
        // Use accessToken and save refreshToken securely
        await syncGoogleCalendarWithAccessToken(accessToken, refreshToken, userInfo);
      }
    catch (error) {
      console.error('Error during authorization code exchange or syncing calendar:', error);
    }
  },
  onError: (error) => {
    console.error('Google login failed:', error);
  },
    flow: 'auth-code',
  });

  // Function to handle Google Calendar sync with access token
  const syncGoogleCalendarWithAccessToken = async (accessToken: string , refreshToken : string ,userInfo : any) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    setLoading(true);
    
    const googleEvents = await getGoogleCalendarEvents(accessToken);
    
    if (!googleEvents || googleEvents.length === 0) {
        console.error('No Google Events fetched.');
        setLoading(false);
        return;
    }

    const sanitizedEvents = prepareEventsForWorker(googleEvents);

    const worker = new Worker(new URL('../workers/googleCalendarWorker.ts', import.meta.url));
    const caltype = 1 ; 
    const scope = "google" ; 

    worker.postMessage({
      token,
      accessToken,
      refreshToken,
      startOfMonth: startOfMonth.toISOString(),
      endOfNextMonth: endOfNextMonth.toISOString(),
      events: sanitizedEvents, 
      userInfo,
      caltype,
      scope
    });

    worker.onmessage = (event) => {
      const { type, events, message } = event.data;
      if (type === 'success') {
        setEvents([...events]);
      } else if (type === 'error') {
        console.error('Error syncing Google Calendar:', message);
      }
      setLoading(false);
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setLoading(false);
    };
  };


  const syncGoogleCalendar = async () => {
    try {
      const accessTokenResponse = await getAccessToken(token!);
    
      if (accessTokenResponse.length === 0) {
        console.log("No access token found, attempting Google login...");
        googleLogin();
        return;
      }
    
      const { accessToken, refreshToken } = accessTokenResponse.find( (f :any)  => f.caltype === 1);

      console.log(accessToken , refreshToken);  
    
      if (accessToken) {
        const isTokenValid = await verifyToken(accessToken);
        if (isTokenValid) {
          await syncGoogleCalendarWithAccessToken(accessToken, refreshToken, null);
          return;
        }
      }
    
      if (refreshToken) {
        try {
          const serverResponse = await fetch('/api/google/refresh-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
  
          if (serverResponse.ok) {
            const { accessToken } = await serverResponse.json();
            await syncGoogleCalendarWithAccessToken(accessToken, refreshToken, null);
            return;
          }
        } catch (error) {
          console.error('Failed to refresh access token:', error);
        }
      }
    
      console.log("Attempting Google login due to lack of valid tokens...");
      googleLogin();
    } catch (error) {
      console.error('Error during Google Calendar sync:', error);
    }
  };
  
  return { syncGoogleCalendar, loading };
};
