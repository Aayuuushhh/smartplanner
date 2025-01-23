// /app/api/google/exchange-code/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';
import { NextApiRequest } from 'next';

export async function POST(request :any) {
  try {
    const { code } = await request.body();

    // Exchange the authorization code for an access token and refresh token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_in, id_token } = tokenResponse.data;

    // Optionally decode id_token to get user information
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userInfo = userInfoResponse.data;

    console.log('Storing refresh token for user:', userInfo.email);

    // Send accessToken and userInfo back to the client
    return NextResponse.json({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      userInfo,
    });
  } catch (error : any ) {
    console.error('Error exchanging authorization code for tokens:', error.response?.data);
    return NextResponse.json({ error: 'Failed to exchange code for tokens' }, { status: 500 });
  }
}
