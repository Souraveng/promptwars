import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'promptwar',
  location: 'us-central1'
};

export const logEmergencyEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LogEmergencyEvent', inputVars);
}
logEmergencyEventRef.operationName = 'LogEmergencyEvent';

export function logEmergencyEvent(dcOrVars, vars) {
  return executeMutation(logEmergencyEventRef(dcOrVars, vars));
}

export const createEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEvent', inputVars);
}
createEventRef.operationName = 'CreateEvent';

export function createEvent(dcOrVars, vars) {
  return executeMutation(createEventRef(dcOrVars, vars));
}

export const issueTicketRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'IssueTicket', inputVars);
}
issueTicketRef.operationName = 'IssueTicket';

export function issueTicket(dcOrVars, vars) {
  return executeMutation(issueTicketRef(dcOrVars, vars));
}

export const createVenueLayoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVenueLayout', inputVars);
}
createVenueLayoutRef.operationName = 'CreateVenueLayout';

export function createVenueLayout(dcOrVars, vars) {
  return executeMutation(createVenueLayoutRef(dcOrVars, vars));
}

export const updateVenueLayoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateVenueLayout', inputVars);
}
updateVenueLayoutRef.operationName = 'UpdateVenueLayout';

export function updateVenueLayout(dcOrVars, vars) {
  return executeMutation(updateVenueLayoutRef(dcOrVars, vars));
}

export const deleteVenueLayoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteVenueLayout', inputVars);
}
deleteVenueLayoutRef.operationName = 'DeleteVenueLayout';

export function deleteVenueLayout(dcOrVars, vars) {
  return executeMutation(deleteVenueLayoutRef(dcOrVars, vars));
}

export const deleteEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteEvent', inputVars);
}
deleteEventRef.operationName = 'DeleteEvent';

export function deleteEvent(dcOrVars, vars) {
  return executeMutation(deleteEventRef(dcOrVars, vars));
}

export const deleteTicketsByEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTicketsByEvent', inputVars);
}
deleteTicketsByEventRef.operationName = 'DeleteTicketsByEvent';

export function deleteTicketsByEvent(dcOrVars, vars) {
  return executeMutation(deleteTicketsByEventRef(dcOrVars, vars));
}

export const deleteEmergencyEventsByEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteEmergencyEventsByEvent', inputVars);
}
deleteEmergencyEventsByEventRef.operationName = 'DeleteEmergencyEventsByEvent';

export function deleteEmergencyEventsByEvent(dcOrVars, vars) {
  return executeMutation(deleteEmergencyEventsByEventRef(dcOrVars, vars));
}

export const setActiveEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetActiveEvent', inputVars);
}
setActiveEventRef.operationName = 'SetActiveEvent';

export function setActiveEvent(dcOrVars, vars) {
  return executeMutation(setActiveEventRef(dcOrVars, vars));
}

export const upsertUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUserProfile', inputVars);
}
upsertUserProfileRef.operationName = 'UpsertUserProfile';

export function upsertUserProfile(dcOrVars, vars) {
  return executeMutation(upsertUserProfileRef(dcOrVars, vars));
}

export const listEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEvents');
}
listEventsRef.operationName = 'ListEvents';

export function listEvents(dc) {
  return executeQuery(listEventsRef(dc));
}

export const getActiveEventRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveEvent');
}
getActiveEventRef.operationName = 'GetActiveEvent';

export function getActiveEvent(dc) {
  return executeQuery(getActiveEventRef(dc));
}

export const getEmergencyEventsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEmergencyEvents', inputVars);
}
getEmergencyEventsRef.operationName = 'GetEmergencyEvents';

export function getEmergencyEvents(dcOrVars, vars) {
  return executeQuery(getEmergencyEventsRef(dcOrVars, vars));
}

export const listVenueLayoutsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVenueLayouts');
}
listVenueLayoutsRef.operationName = 'ListVenueLayouts';

export function listVenueLayouts(dc) {
  return executeQuery(listVenueLayoutsRef(dc));
}

export const getVenueLayoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetVenueLayout', inputVars);
}
getVenueLayoutRef.operationName = 'GetVenueLayout';

export function getVenueLayout(dcOrVars, vars) {
  return executeQuery(getVenueLayoutRef(dcOrVars, vars));
}

export const listTicketsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTickets', inputVars);
}
listTicketsRef.operationName = 'ListTickets';

export function listTickets(dcOrVars, vars) {
  return executeQuery(listTicketsRef(dcOrVars, vars));
}

export const getUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserProfile', inputVars);
}
getUserProfileRef.operationName = 'GetUserProfile';

export function getUserProfile(dcOrVars, vars) {
  return executeQuery(getUserProfileRef(dcOrVars, vars));
}

export const getGuestTicketsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetGuestTickets', inputVars);
}
getGuestTicketsRef.operationName = 'GetGuestTickets';

export function getGuestTickets(dcOrVars, vars) {
  return executeQuery(getGuestTicketsRef(dcOrVars, vars));
}

