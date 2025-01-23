import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid profile email https://www.googleapis.com/auth/calendar.readonly",
          access_type: 'offline', // Required for obtaining a refresh token
          prompt: 'consent',
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email offline_access Calendars.Read"
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // If the user is signing in, add the account and provider information
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = Date.now() + (account.expires_in as number) * 1000;
        token.provider = account.provider; // Store the provider in the token ("google" or "azure-ad")
      }

      // Add additional profile details
      if (profile) {
        token.given_name = profile.given_name;
        token.family_name = profile.family_name;
      }

      // Check if the token is expired, and refresh if necessary
      if (token.expiresAt && Date.now() > (token.expiresAt as number)) {
        console.log("Access token expired, refreshing...");

        try {
          if (token.provider === "google") {
            // Refresh Google token
            const refreshedTokens = await refreshGoogleToken(token.refreshToken as string);
            token.accessToken = refreshedTokens.accessToken;
            token.expiresAt = Date.now() + refreshedTokens.expiresIn * 1000;
            token.refreshToken = refreshedTokens.refreshToken || token.refreshToken; // Use new refreshToken if provided
          }
          // You can add similar logic for Azure AD if needed here
        } catch (error) {
          console.error("Error refreshing access token:", error);
          token.error = "RefreshAccessTokenError";
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Add token values and provider to the session
      session.user.given_name = token.given_name;
      session.user.family_name = token.family_name;
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      session.user.expiresAt = token.expiresAt;
      session.provider = token.provider as string; // Add the provider information to the session for easy identification

      return session;
    },
  },

  secret: process.env.NEXT_AUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

/**
 * Helper function to refresh Google tokens using the refresh token.
 * @param refreshToken - The refresh token for Google
 * @returns - A new access token and potentially a new refresh token
 */
async function refreshGoogleToken(refreshToken: string) {
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
    refreshToken: data.refresh_token, // May not always be returned
  };
}
