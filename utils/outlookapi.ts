import { IPublicClientApplication, SilentRequest, PopupRequest, InteractionRequiredAuthError } from '@azure/msal-browser';
import { AccountInfo } from '@azure/msal-common';
import { loginRequest } from "../msalConfig";
import axios from "axios";

export async function acquireToken(msalInstance: any, account: any) {
  if (!account) {
    console.error("Account is undefined");
    return;
  }
  try {
    // Attempt silent token acquisition
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,  // This should include scopes like ["User.Read", "Calendars.Read"]
      account: account, // The account object representing the signed-in user
    });
    
    return response.accessToken;  // Return the acquired token

  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      try {
        const response = await msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;  // Return the token after user interaction
      } catch (popupError) {
        console.error("Failed to acquire token via popup:", popupError);
        throw popupError;  // Optionally, you can throw an error here to notify the caller
      }
    } else {
      console.error("Failed to acquire token silently:", error);
      throw error;  // Optionally rethrow the error to notify the caller
    }
  }
}


export const getOutlookCalendarEvents = async (accessToken: string) => {
  try {
    console.log('Access Token:', accessToken);

    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Log the entire response for debugging
    console.log('Response:', response);

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Error fetching events. Status:', response.status, 'Details:', errorDetails);
      throw new Error(`Failed to fetch Outlook calendar events. Status: ${response.status}`);
    }

    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};
