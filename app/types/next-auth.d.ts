import "next-auth";

declare module "next-auth" {
  /**
   * Extending the Profile interface to include Google-specific fields
   */
  interface Profile {
    given_name?: string;
    family_name?: string;
  }

  /**
   * Extending the User interface to include Google-specific fields
   */
  interface User {
    given_name?: string;
    family_name?: string;
  }

  /**
   * Extending the Session interface to include custom properties
   */
  interface Session {
    provider?: string; // Add provider directly to the session object
    expiresAt?: number; // Add expiresAt to the session object
    user: {
      given_name?: string;
      family_name?: string;
      accessToken?: string;
      refreshToken?: string;
    } & DefaultSession["user"];
  }

  /**
   * Extending the JWT (JSON Web Token) interface to include custom fields
   */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    provider?: string;
    given_name?: string;
    family_name?: string;
    error?: string;
  }
}
