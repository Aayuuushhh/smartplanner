// /app/api/google/refresh-token/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import { NextApiRequest } from 'next';

export async function POST(request :any) {

    const { refreshToken } = await request.body;

    const url = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
    const params = new URLSearchParams({
      client_id: process.env.AZURE_AD_CLIENT_ID!,
      client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/.default offline_access',
    });
    // Use the refresh token to get a new access token
    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          return NextResponse.json({ error: data.error_description } , {status : 400});
        }

        return NextResponse.json({
            message: {
                accessToken: data.access_token, 
                refreshToken: data.refresh_token ?? refreshToken, 
                expiresIn: data.expires_in,
            }
        });

    } catch (error: any) {
        console.error('Error refreshing access token:', error.response?.data);
        return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 500 });
    }
}
