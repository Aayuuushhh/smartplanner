import { NextResponse } from 'next/server';
import axios from 'axios';
import { decryptObject } from '../../../utils/decrypt';

export async function POST(req: Request) {
    try {
        const { data: encryptedData } = await req.json();
        const decryptedData = decryptObject(encryptedData);
        const { url, ...requestData } = decryptedData;
        
        console.log(decryptedData) ; 
        const headers = req.headers;
        const authHeader = headers.get('authorization') || '';

        const response = await axios.post(url, requestData, {
            headers: {
                Authorization: authHeader
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({ error: error.message });
    }
}
