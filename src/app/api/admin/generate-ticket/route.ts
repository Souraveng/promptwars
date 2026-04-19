import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, gate, section, row, seat, guestName, guestAge, guestIdNumber, guestMobile, guestEmail, eventName } = body;

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

    // Generate Custom Token for Guest Login — embed ALL guest + ticket data as claims
    let customToken = '';
    try {
      customToken = await adminAuth.createCustomToken(ticketId, {
        role: 'guest',
        eventId,
        eventName: eventName ?? '',
        gate,
        section,
        row,
        seat,
        guestName,
        guestAge: parseInt(guestAge),
        guestIdLast4: guestIdNumber ? guestIdNumber.slice(-4) : '',
        guestMobile: guestMobile ?? '',
        guestEmail: guestEmail ?? '',
      });
    } catch (authErr) {
      console.warn("Falling back to local simulation mode. Firebase Admin lacks credentials.");
      customToken = `fallback-${ticketId}`;
    }

    // Store all ticket data server-side keyed by ticketId
    // so the QR only needs to encode a short URL
    const ticketPayload = {
      eventId,
      eventName: eventName ?? '',
      gate, section, row, seat,
      guestName,
      guestAge: String(guestAge),
      guestIdLast4: guestIdNumber ? guestIdNumber.slice(-4) : '',
      guestMobile: guestMobile ?? '',
      guestEmail: guestEmail ?? '',
      token: customToken,
    };

    // Store in server-side map
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/admin/ticket-store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, data: ticketPayload }),
    }).catch(() => {}); // non-blocking

    // QR encodes a SHORT URL — just the ticketId, no JWT
    const shortUrl = `/guest/login?tid=${ticketId}`;

    return NextResponse.json({
      success: true,
      ticketId,
      token: customToken,
      url: shortUrl,
    });

  } catch (error: any) {
    console.error('Error generating ticket:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
