import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gate, section, row, seat } = body;

    if (!gate || !section || !row || !seat) {
      return NextResponse.json(
        { error: 'Missing required ticket fields' },
        { status: 400 }
      );
    }

    // Generate a unique Ticket String (acting as our QR Payload and Auth UID)
    const ticketId = crypto.randomUUID();

    // In a full production flow, you inject this into Firebase Data Connect / Postgres via:
    // createTicket({ id: ticketId, gate, section, row, seat }) 
    // Here we map the ticket directly to a secure Custom Auth Token.

    let customToken = '';
    
    try {
      // 1. Try to create a Firebase Custom Auth Token (Requires Service Account/GCP identity)
      customToken = await adminAuth.createCustomToken(ticketId, {
        role: 'guest',
        gate, section, row, seat
      });
    } catch (authErr) {
      console.warn("Falling back to local simulation mode. Firebase Admin lacks credentials.");
      // Fallback for local testing without service accounts
      customToken = `fallback-${ticketId}`;
    }

    return NextResponse.json({
      success: true,
      ticketId,
      token: customToken,
      url: `/guest/login?token=${customToken}`
    });

  } catch (error: any) {
    console.error('Error generating ticket:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
