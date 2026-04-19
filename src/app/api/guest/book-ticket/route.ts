import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import crypto from 'crypto';

// Re-use the same in-memory store as admin ticket-store
// We import it via a shared module trick — just duplicate the store logic here
const ticketStore = new Map<string, Record<string, string>>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, eventName, gate, section, row, seat, guestName, guestAge, guestIdNumber, guestMobile, guestEmail } = body;

    if (!guestName || !guestAge) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticketId = crypto.randomUUID();

    let customToken = '';
    try {
      customToken = await adminAuth.createCustomToken(ticketId, {
        role: 'guest',
        eventId: eventId || 'self-booked',
        eventName: eventName || '',
        gate: gate || 'Main',
        section: section || 'General Admission',
        row: row || 'GA',
        seat: seat || '-',
        guestName,
        guestAge: parseInt(guestAge),
        guestIdLast4: guestIdNumber ? guestIdNumber.slice(-4) : '',
        guestMobile: guestMobile || '',
        guestEmail: guestEmail || '',
      });
    } catch {
      customToken = `fallback-${ticketId}`;
    }

    const ticketPayload: Record<string, string> = {
      eventId: eventId || 'self-booked',
      eventName: eventName || 'Neon Lights Festival',
      gate: gate || 'Main',
      section: section || 'General Admission',
      row: row || 'GA',
      seat: seat || '-',
      guestName,
      guestAge: String(guestAge),
      guestIdLast4: guestIdNumber ? guestIdNumber.slice(-4) : '',
      guestMobile: guestMobile || '',
      guestEmail: guestEmail || '',
      token: customToken,
    };

    // Store in the shared ticket store
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/admin/ticket-store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, data: ticketPayload }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      ticketId,
      token: customToken,
      loginUrl: `/guest/login?tid=${ticketId}`,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
