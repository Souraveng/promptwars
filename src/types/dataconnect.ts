export interface Event {
  id: string;
  title: string;
  venueName: string;
  venueLat: number;
  venueLng: number;
  description?: string;
  startTime: string;
  isActive: boolean;
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

export interface ListEventsData {
  events: Event[];
}

export interface GetActiveEventData {
  events: Event[];
}

export interface GetEmergencyEventsData {
  emergencyEvents: EmergencyEvent[];
}

export interface LogEmergencyEventVariables {
  type: string;
  priority: string;
  details: string;
  lat?: number | null;
  lng?: number | null;
  eventId?: string | null;
}
