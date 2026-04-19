// Simple in-memory ticket store (persists for the server process lifetime)
// In production, use Redis or a database
const ticketStore = new Map<string, Record<string, string>>();

export async function POST(request: Request) {
  const { ticketId, data } = await request.json();
  ticketStore.set(ticketId, data);
  return Response.json({ ok: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get('ticketId');
  if (!ticketId) return Response.json({ error: 'Missing ticketId' }, { status: 400 });
  const data = ticketStore.get(ticketId);
  if (!data) return Response.json({ error: 'Ticket not found' }, { status: 404 });
  return Response.json(data);
}
