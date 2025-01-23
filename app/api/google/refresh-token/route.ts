// /app/api/google/refresh-token/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import { NextApiRequest } from 'next';

export async function POST(request :any) {
  try {
    const { refreshToken } = await request.body();

    // Use the refresh token to get a new access token
    const refreshResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const { access_token, expires_in } = refreshResponse.data;

    // Send the new access token to the client
    return NextResponse.json({
      accessToken: access_token,
      expiresIn: expires_in,
    });
  } catch (error :any) {
    console.error('Error refreshing access token:', error.response?.data);
    return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 500 });
  }
}
