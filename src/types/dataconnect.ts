export interface Event {
  id: string;
  title: string;
  venueName: string;
  venueLat: number;
  venueLng: number;
  description?: string;
  startTime: string;
  expiryDate?: string;
  bannerUrl?: string;
  isActive: boolean;
  minAge?: number;
  layoutId?: string | null;
  layoutConfig?: string | null;
}

export interface Ticket {
  id: string;
  issuedAt: string;
  gate: string;
  section: string;
  row: string;
  seat: string;
  status: string;
  guestName: string;
  guestAge: number;
  guestEmail: string;
  guestMobile: string;
  guestIdNumber: string;
  eventId: string;
}

export interface VenueLayout {
  id: string;
  name: string;
  elements: string; // JSON
  createdAt: string;
}

export interface ListEventsData {
  events: Event[];
}

export interface ListVenueLayoutsData {
  venueLayouts: VenueLayout[];
}

export interface GetVenueLayoutData {
  venueLayout: VenueLayout;
}

export interface EmergencyEvent {
  id: string;
  eventId?: string;
  type: string;
  priority: string;
  details: string;
  lat?: number;
  lng?: number;
  timestamp: string;
  status: string;
}

export interface GetActiveEventData {
  events: Event[];
}

export interface GetEmergencyEventsData {
  emergencyEvents: EmergencyEvent[];
}

export interface ListTicketsData {
  tickets: Ticket[];
}

export interface IssueTicketVariables {
  eventId: string;
  gate: string;
  section: string;
  row: string;
  seat: string;
  guestName: string;
  guestAge: number;
  guestIdNumber: string;
  guestMobile: string;
  guestEmail: string;
}
