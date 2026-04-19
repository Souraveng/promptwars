import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateEventData {
  event_insert: Event_Key;
}

export interface CreateEventVariables {
  title: string;
  venueName: string;
  venueLat: number;
  venueLng: number;
  description?: string | null;
  isActive?: boolean | null;
  minAge?: number | null;
  layoutId?: UUIDString | null;
  layoutConfig?: string | null;
  startTime?: TimestampString | null;
  expiryDate?: TimestampString | null;
  bannerUrl?: string | null;
}

export interface CreateVenueLayoutData {
  venueLayout_insert: VenueLayout_Key;
}

export interface CreateVenueLayoutVariables {
  name: string;
  elements: string;
}

export interface DeleteEmergencyEventsByEventData {
  emergencyEvent_deleteMany: number;
}

export interface DeleteEmergencyEventsByEventVariables {
  eventId: UUIDString;
}

export interface DeleteEventData {
  event_delete?: Event_Key | null;
}

export interface DeleteEventVariables {
  id: UUIDString;
}

export interface DeleteTicketsByEventData {
  ticket_deleteMany: number;
}

export interface DeleteTicketsByEventVariables {
  eventId: UUIDString;
}

export interface DeleteVenueLayoutData {
  venueLayout_delete?: VenueLayout_Key | null;
}

export interface DeleteVenueLayoutVariables {
  id: UUIDString;
}

export interface EmergencyEvent_Key {
  id: UUIDString;
  __typename?: 'EmergencyEvent_Key';
}

export interface Event_Key {
  id: UUIDString;
  __typename?: 'Event_Key';
}

export interface GetActiveEventData {
  events: ({
    id: UUIDString;
    title: string;
    venueName: string;
    venueLat: number;
    venueLng: number;
    expiryDate?: TimestampString | null;
    bannerUrl?: string | null;
  } & Event_Key)[];
}

export interface GetEmergencyEventsData {
  emergencyEvents: ({
    id: UUIDString;
    type: string;
    priority: string;
    details: string;
    lat?: number | null;
    lng?: number | null;
    timestamp: TimestampString;
    status: string;
    eventId?: UUIDString | null;
  } & EmergencyEvent_Key)[];
}

export interface GetEmergencyEventsVariables {
  eventId?: UUIDString | null;
}

export interface GetGuestTicketsData {
  tickets: ({
    id: UUIDString;
    gate: string;
    section: string;
    row: string;
    seat: string;
    issuedAt: TimestampString;
    status: string;
    eventId: UUIDString;
    event: {
      id: UUIDString;
      title: string;
      bannerUrl?: string | null;
      venueName: string;
      startTime: TimestampString;
      isActive: boolean;
      layoutId?: UUIDString | null;
    } & Event_Key;
  } & Ticket_Key)[];
}

export interface GetGuestTicketsVariables {
  userId: string;
}

export interface GetUserProfileData {
  userProfile?: {
    id: string;
    name: string;
    age: number;
    idCardNumber: string;
    phone: string;
    email: string;
  } & UserProfile_Key;
}

export interface GetUserProfileVariables {
  id: string;
}

export interface GetVenueLayoutData {
  venueLayout?: {
    id: UUIDString;
    name: string;
    elements: string;
    createdAt: TimestampString;
  } & VenueLayout_Key;
}

export interface GetVenueLayoutVariables {
  id: UUIDString;
}

export interface IssueTicketData {
  ticket_insert: Ticket_Key;
}

export interface IssueTicketVariables {
  eventId: UUIDString;
  gate: string;
  section: string;
  row: string;
  seat: string;
  guestName: string;
  guestAge: number;
  guestIdNumber: string;
  guestMobile: string;
  guestEmail: string;
  userId?: string | null;
}

export interface ListEventsData {
  events: ({
    id: UUIDString;
    title: string;
    venueName: string;
    venueLat: number;
    venueLng: number;
    description?: string | null;
    startTime: TimestampString;
    expiryDate?: TimestampString | null;
    bannerUrl?: string | null;
    isActive: boolean;
    minAge?: number | null;
    layoutId?: UUIDString | null;
    layoutConfig?: string | null;
  } & Event_Key)[];
}

export interface ListTicketsData {
  tickets: ({
    id: UUIDString;
    guestName: string;
    guestEmail: string;
    guestAge: number;
    guestMobile: string;
    guestIdNumber: string;
    gate: string;
    section: string;
    row: string;
    seat: string;
    issuedAt: TimestampString;
    status: string;
    eventId: UUIDString;
  } & Ticket_Key)[];
}

export interface ListTicketsVariables {
  eventId?: UUIDString | null;
}

export interface ListVenueLayoutsData {
  venueLayouts: ({
    id: UUIDString;
    name: string;
    elements: string;
    createdAt: TimestampString;
  } & VenueLayout_Key)[];
}

export interface LogEmergencyEventData {
  emergencyEvent_insert: EmergencyEvent_Key;
}

export interface LogEmergencyEventVariables {
  type: string;
  priority: string;
  details: string;
  lat?: number | null;
  lng?: number | null;
  eventId?: UUIDString | null;
}

export interface SetActiveEventData {
  event_update?: Event_Key | null;
}

export interface SetActiveEventVariables {
  id: UUIDString;
  isActive: boolean;
}

export interface Ticket_Key {
  id: UUIDString;
  __typename?: 'Ticket_Key';
}

export interface UpdateVenueLayoutData {
  venueLayout_update?: VenueLayout_Key | null;
}

export interface UpdateVenueLayoutVariables {
  id: UUIDString;
  name?: string | null;
  elements?: string | null;
}

export interface UpsertUserProfileData {
  userProfile_upsert: UserProfile_Key;
}

export interface UpsertUserProfileVariables {
  id: string;
  name: string;
  age: number;
  idCardNumber: string;
  phone: string;
  email: string;
}

export interface UserProfile_Key {
  id: string;
  __typename?: 'UserProfile_Key';
}

export interface VenueLayout_Key {
  id: UUIDString;
  __typename?: 'VenueLayout_Key';
}

interface LogEmergencyEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LogEmergencyEventVariables): MutationRef<LogEmergencyEventData, LogEmergencyEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LogEmergencyEventVariables): MutationRef<LogEmergencyEventData, LogEmergencyEventVariables>;
  operationName: string;
}
export const logEmergencyEventRef: LogEmergencyEventRef;

export function logEmergencyEvent(vars: LogEmergencyEventVariables): MutationPromise<LogEmergencyEventData, LogEmergencyEventVariables>;
export function logEmergencyEvent(dc: DataConnect, vars: LogEmergencyEventVariables): MutationPromise<LogEmergencyEventData, LogEmergencyEventVariables>;

interface CreateEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEventVariables): MutationRef<CreateEventData, CreateEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateEventVariables): MutationRef<CreateEventData, CreateEventVariables>;
  operationName: string;
}
export const createEventRef: CreateEventRef;

export function createEvent(vars: CreateEventVariables): MutationPromise<CreateEventData, CreateEventVariables>;
export function createEvent(dc: DataConnect, vars: CreateEventVariables): MutationPromise<CreateEventData, CreateEventVariables>;

interface IssueTicketRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: IssueTicketVariables): MutationRef<IssueTicketData, IssueTicketVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: IssueTicketVariables): MutationRef<IssueTicketData, IssueTicketVariables>;
  operationName: string;
}
export const issueTicketRef: IssueTicketRef;

export function issueTicket(vars: IssueTicketVariables): MutationPromise<IssueTicketData, IssueTicketVariables>;
export function issueTicket(dc: DataConnect, vars: IssueTicketVariables): MutationPromise<IssueTicketData, IssueTicketVariables>;

interface CreateVenueLayoutRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVenueLayoutVariables): MutationRef<CreateVenueLayoutData, CreateVenueLayoutVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateVenueLayoutVariables): MutationRef<CreateVenueLayoutData, CreateVenueLayoutVariables>;
  operationName: string;
}
export const createVenueLayoutRef: CreateVenueLayoutRef;

export function createVenueLayout(vars: CreateVenueLayoutVariables): MutationPromise<CreateVenueLayoutData, CreateVenueLayoutVariables>;
export function createVenueLayout(dc: DataConnect, vars: CreateVenueLayoutVariables): MutationPromise<CreateVenueLayoutData, CreateVenueLayoutVariables>;

interface UpdateVenueLayoutRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateVenueLayoutVariables): MutationRef<UpdateVenueLayoutData, UpdateVenueLayoutVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateVenueLayoutVariables): MutationRef<UpdateVenueLayoutData, UpdateVenueLayoutVariables>;
  operationName: string;
}
export const updateVenueLayoutRef: UpdateVenueLayoutRef;

export function updateVenueLayout(vars: UpdateVenueLayoutVariables): MutationPromise<UpdateVenueLayoutData, UpdateVenueLayoutVariables>;
export function updateVenueLayout(dc: DataConnect, vars: UpdateVenueLayoutVariables): MutationPromise<UpdateVenueLayoutData, UpdateVenueLayoutVariables>;

interface DeleteVenueLayoutRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteVenueLayoutVariables): MutationRef<DeleteVenueLayoutData, DeleteVenueLayoutVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteVenueLayoutVariables): MutationRef<DeleteVenueLayoutData, DeleteVenueLayoutVariables>;
  operationName: string;
}
export const deleteVenueLayoutRef: DeleteVenueLayoutRef;

export function deleteVenueLayout(vars: DeleteVenueLayoutVariables): MutationPromise<DeleteVenueLayoutData, DeleteVenueLayoutVariables>;
export function deleteVenueLayout(dc: DataConnect, vars: DeleteVenueLayoutVariables): MutationPromise<DeleteVenueLayoutData, DeleteVenueLayoutVariables>;

interface DeleteEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteEventVariables): MutationRef<DeleteEventData, DeleteEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteEventVariables): MutationRef<DeleteEventData, DeleteEventVariables>;
  operationName: string;
}
export const deleteEventRef: DeleteEventRef;

export function deleteEvent(vars: DeleteEventVariables): MutationPromise<DeleteEventData, DeleteEventVariables>;
export function deleteEvent(dc: DataConnect, vars: DeleteEventVariables): MutationPromise<DeleteEventData, DeleteEventVariables>;

interface DeleteTicketsByEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTicketsByEventVariables): MutationRef<DeleteTicketsByEventData, DeleteTicketsByEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTicketsByEventVariables): MutationRef<DeleteTicketsByEventData, DeleteTicketsByEventVariables>;
  operationName: string;
}
export const deleteTicketsByEventRef: DeleteTicketsByEventRef;

export function deleteTicketsByEvent(vars: DeleteTicketsByEventVariables): MutationPromise<DeleteTicketsByEventData, DeleteTicketsByEventVariables>;
export function deleteTicketsByEvent(dc: DataConnect, vars: DeleteTicketsByEventVariables): MutationPromise<DeleteTicketsByEventData, DeleteTicketsByEventVariables>;

interface DeleteEmergencyEventsByEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteEmergencyEventsByEventVariables): MutationRef<DeleteEmergencyEventsByEventData, DeleteEmergencyEventsByEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteEmergencyEventsByEventVariables): MutationRef<DeleteEmergencyEventsByEventData, DeleteEmergencyEventsByEventVariables>;
  operationName: string;
}
export const deleteEmergencyEventsByEventRef: DeleteEmergencyEventsByEventRef;

export function deleteEmergencyEventsByEvent(vars: DeleteEmergencyEventsByEventVariables): MutationPromise<DeleteEmergencyEventsByEventData, DeleteEmergencyEventsByEventVariables>;
export function deleteEmergencyEventsByEvent(dc: DataConnect, vars: DeleteEmergencyEventsByEventVariables): MutationPromise<DeleteEmergencyEventsByEventData, DeleteEmergencyEventsByEventVariables>;

interface SetActiveEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetActiveEventVariables): MutationRef<SetActiveEventData, SetActiveEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetActiveEventVariables): MutationRef<SetActiveEventData, SetActiveEventVariables>;
  operationName: string;
}
export const setActiveEventRef: SetActiveEventRef;

export function setActiveEvent(vars: SetActiveEventVariables): MutationPromise<SetActiveEventData, SetActiveEventVariables>;
export function setActiveEvent(dc: DataConnect, vars: SetActiveEventVariables): MutationPromise<SetActiveEventData, SetActiveEventVariables>;

interface UpsertUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
  operationName: string;
}
export const upsertUserProfileRef: UpsertUserProfileRef;

export function upsertUserProfile(vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;
export function upsertUserProfile(dc: DataConnect, vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface ListEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEventsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListEventsData, undefined>;
  operationName: string;
}
export const listEventsRef: ListEventsRef;

export function listEvents(): QueryPromise<ListEventsData, undefined>;
export function listEvents(dc: DataConnect): QueryPromise<ListEventsData, undefined>;

interface GetActiveEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetActiveEventData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetActiveEventData, undefined>;
  operationName: string;
}
export const getActiveEventRef: GetActiveEventRef;

export function getActiveEvent(): QueryPromise<GetActiveEventData, undefined>;
export function getActiveEvent(dc: DataConnect): QueryPromise<GetActiveEventData, undefined>;

interface GetEmergencyEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetEmergencyEventsVariables): QueryRef<GetEmergencyEventsData, GetEmergencyEventsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetEmergencyEventsVariables): QueryRef<GetEmergencyEventsData, GetEmergencyEventsVariables>;
  operationName: string;
}
export const getEmergencyEventsRef: GetEmergencyEventsRef;

export function getEmergencyEvents(vars?: GetEmergencyEventsVariables): QueryPromise<GetEmergencyEventsData, GetEmergencyEventsVariables>;
export function getEmergencyEvents(dc: DataConnect, vars?: GetEmergencyEventsVariables): QueryPromise<GetEmergencyEventsData, GetEmergencyEventsVariables>;

interface ListVenueLayoutsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVenueLayoutsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListVenueLayoutsData, undefined>;
  operationName: string;
}
export const listVenueLayoutsRef: ListVenueLayoutsRef;

export function listVenueLayouts(): QueryPromise<ListVenueLayoutsData, undefined>;
export function listVenueLayouts(dc: DataConnect): QueryPromise<ListVenueLayoutsData, undefined>;

interface GetVenueLayoutRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetVenueLayoutVariables): QueryRef<GetVenueLayoutData, GetVenueLayoutVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetVenueLayoutVariables): QueryRef<GetVenueLayoutData, GetVenueLayoutVariables>;
  operationName: string;
}
export const getVenueLayoutRef: GetVenueLayoutRef;

export function getVenueLayout(vars: GetVenueLayoutVariables): QueryPromise<GetVenueLayoutData, GetVenueLayoutVariables>;
export function getVenueLayout(dc: DataConnect, vars: GetVenueLayoutVariables): QueryPromise<GetVenueLayoutData, GetVenueLayoutVariables>;

interface ListTicketsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListTicketsVariables): QueryRef<ListTicketsData, ListTicketsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListTicketsVariables): QueryRef<ListTicketsData, ListTicketsVariables>;
  operationName: string;
}
export const listTicketsRef: ListTicketsRef;

export function listTickets(vars?: ListTicketsVariables): QueryPromise<ListTicketsData, ListTicketsVariables>;
export function listTickets(dc: DataConnect, vars?: ListTicketsVariables): QueryPromise<ListTicketsData, ListTicketsVariables>;

interface GetUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserProfileVariables): QueryRef<GetUserProfileData, GetUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserProfileVariables): QueryRef<GetUserProfileData, GetUserProfileVariables>;
  operationName: string;
}
export const getUserProfileRef: GetUserProfileRef;

export function getUserProfile(vars: GetUserProfileVariables): QueryPromise<GetUserProfileData, GetUserProfileVariables>;
export function getUserProfile(dc: DataConnect, vars: GetUserProfileVariables): QueryPromise<GetUserProfileData, GetUserProfileVariables>;

interface GetGuestTicketsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetGuestTicketsVariables): QueryRef<GetGuestTicketsData, GetGuestTicketsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetGuestTicketsVariables): QueryRef<GetGuestTicketsData, GetGuestTicketsVariables>;
  operationName: string;
}
export const getGuestTicketsRef: GetGuestTicketsRef;

export function getGuestTickets(vars: GetGuestTicketsVariables): QueryPromise<GetGuestTicketsData, GetGuestTicketsVariables>;
export function getGuestTickets(dc: DataConnect, vars: GetGuestTicketsVariables): QueryPromise<GetGuestTicketsData, GetGuestTicketsVariables>;

