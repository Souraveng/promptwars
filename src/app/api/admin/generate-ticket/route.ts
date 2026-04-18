import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, gate, section, row, seat, guestName, guestAge, guestIdNumber, guestMobile, guestEmail } = body;

    if (!eventId || !gate || !section || !row || !seat || !guestName || !guestAge) {
      return NextResponse.json(
        { error: 'Missing required guest or ticket fields' },
        { status: 400 }
      );
    }

    // Initialize Data Connect mutation
    const { dataconnect } = await import('@/lib/firebase-client');
    const { mutationRef, executeMutation } = await import('firebase/data-connect');
    
    // Create the mutation reference
    const mRef = mutationRef(dataconnect, 'IssueTicket', {
      eventId, gate, section, row, seat, 
      guestName, guestAge: parseInt(guestAge), 
      guestIdNumber, guestMobile, guestEmail
    });

    // Execute the mutation
    const result = await executeMutation(mRef);
    const ticketId = (result.data as any)?.ticket_insert?.id;

    // Generate Custom Token for Guest Login
    let customToken = '';
    try {
      customToken = await adminAuth.createCustomToken(ticketId, {
        role: 'guest',
        eventId, gate, section, row, seat
      });
    } catch (authErr) {
      console.warn("Falling back to local simulation mode. Firebase Admin lacks credentials.");
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
