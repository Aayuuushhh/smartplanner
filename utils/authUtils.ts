// utils/authUtils.ts

export async function refreshGoogleToken(refreshToken: string) {
    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });
  
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error_description || "Failed to refresh Google access token");
    }
  
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
    };
  }
  
  export async function refreshAzureADToken(refreshToken: string) {
    const url = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: process.env.AZURE_AD_CLIENT_ID || "",
      client_secret: process.env.AZURE_AD_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      scope: "openid profile email offline_access",
    });
  
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error_description || "Failed to refresh Azure AD access token");
    }
  
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
    };
  }
  