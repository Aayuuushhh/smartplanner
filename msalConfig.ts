import { Configuration, PublicClientApplication } from "@azure/msal-browser";

// Configuration for MSAL
export const msalConfig: Configuration = {
  auth: {
    clientId: "39599fd2-0d42-460b-accf-254a9b317a28", // Replace with your Azure AD Application (client) ID
    authority: "https://login.microsoftonline.com/common", // Replace with your tenant ID if necessary
    redirectUri: "http://localhost:3000/", // Replace with your redirect URI
  },
  cache: {
    cacheLocation: 'sessionStorage',  // Use session storage to avoid cross-site issues
    storeAuthStateInCookie: true,  // Enable this for compatibility with more browsers
  }
};

// Create and export an instance of PublicClientApplication
export const msalInstance = new PublicClientApplication(msalConfig);

// Export the login request details
export const loginRequest = {
  scopes: ["User.Read", "Calendars.Read", "Calendars.ReadWrite"],
};
