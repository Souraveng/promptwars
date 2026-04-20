const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'promptwar',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const logEmergencyEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LogEmergencyEvent', inputVars);
}
logEmergencyEventRef.operationName = 'LogEmergencyEvent';
exports.logEmergencyEventRef = logEmergencyEventRef;

exports.logEmergencyEvent = function logEmergencyEvent(dcOrVars, vars) {
  return executeMutation(logEmergencyEventRef(dcOrVars, vars));
};

const createEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEvent', inputVars);
}
createEventRef.operationName = 'CreateEvent';
exports.createEventRef = createEventRef;

exports.createEvent = function createEvent(dcOrVars, vars) {
  return executeMutation(createEventRef(dcOrVars, vars));
};

const issueTicketRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'IssueTicket', inputVars);
}
issueTicketRef.operationName = 'IssueTicket';
exports.issueTicketRef = issueTicketRef;

exports.issueTicket = function issueTicket(dcOrVars, vars) {
  return executeMutation(issueTicketRef(dcOrVars, vars));
};

const createVenueLayoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVenueLayout', inputVars);
}
createVenueLayoutRef.operationName = 'CreateVenueLayout';
exports.createVenueLayoutRef = createVenueLayoutRef;

exports.createVenueLayout = function createVenueLayout(dcOrVars, vars) {
  return executeMutation(createVenueLayoutRef(dcOrVars, vars));
};

const updateVenueLayoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateVenueLayout', inputVars);
}
updateVenueLayoutRef.operationName = 'UpdateVenueLayout';
exports.updateVenueLayoutRef = updateVenueLayoutRef;

exports.updateVenueLayout = function updateVenueLayout(dcOrVars, vars) {
  return executeMutation(updateVenueLayoutRef(dcOrVars, vars));
};

const deleteVenueLayoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteVenueLayout', inputVars);
}
deleteVenueLayoutRef.operationName = 'DeleteVenueLayout';
exports.deleteVenueLayoutRef = deleteVenueLayoutRef;

exports.deleteVenueLayout = function deleteVenueLayout(dcOrVars, vars) {
  return executeMutation(deleteVenueLayoutRef(dcOrVars, vars));
};

const deleteEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteEvent', inputVars);
}
deleteEventRef.operationName = 'DeleteEvent';
exports.deleteEventRef = deleteEventRef;

exports.deleteEvent = function deleteEvent(dcOrVars, vars) {
  return executeMutation(deleteEventRef(dcOrVars, vars));
};

const deleteTicketsByEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTicketsByEvent', inputVars);
}
deleteTicketsByEventRef.operationName = 'DeleteTicketsByEvent';
exports.deleteTicketsByEventRef = deleteTicketsByEventRef;

exports.deleteTicketsByEvent = function deleteTicketsByEvent(dcOrVars, vars) {
  return executeMutation(deleteTicketsByEventRef(dcOrVars, vars));
};

const deleteEmergencyEventsByEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteEmergencyEventsByEvent', inputVars);
}
deleteEmergencyEventsByEventRef.operationName = 'DeleteEmergencyEventsByEvent';
exports.deleteEmergencyEventsByEventRef = deleteEmergencyEventsByEventRef;

exports.deleteEmergencyEventsByEvent = function deleteEmergencyEventsByEvent(dcOrVars, vars) {
  return executeMutation(deleteEmergencyEventsByEventRef(dcOrVars, vars));
};

const setActiveEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetActiveEvent', inputVars);
}
setActiveEventRef.operationName = 'SetActiveEvent';
exports.setActiveEventRef = setActiveEventRef;

exports.setActiveEvent = function setActiveEvent(dcOrVars, vars) {
  return executeMutation(setActiveEventRef(dcOrVars, vars));
};

const upsertUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertUserProfile', inputVars);
}
upsertUserProfileRef.operationName = 'UpsertUserProfile';
exports.upsertUserProfileRef = upsertUserProfileRef;

exports.upsertUserProfile = function upsertUserProfile(dcOrVars, vars) {
  return executeMutation(upsertUserProfileRef(dcOrVars, vars));
};

const claimTicketRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ClaimTicket', inputVars);
}
claimTicketRef.operationName = 'ClaimTicket';
exports.claimTicketRef = claimTicketRef;

exports.claimTicket = function claimTicket(dcOrVars, vars) {
  return executeMutation(claimTicketRef(dcOrVars, vars));
};

const listEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEvents');
}
listEventsRef.operationName = 'ListEvents';
exports.listEventsRef = listEventsRef;

exports.listEvents = function listEvents(dc) {
  return executeQuery(listEventsRef(dc));
};

const getActiveEventRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetActiveEvent');
}
getActiveEventRef.operationName = 'GetActiveEvent';
exports.getActiveEventRef = getActiveEventRef;

exports.getActiveEvent = function getActiveEvent(dc) {
  return executeQuery(getActiveEventRef(dc));
};

const getEmergencyEventsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEmergencyEvents', inputVars);
}
getEmergencyEventsRef.operationName = 'GetEmergencyEvents';
exports.getEmergencyEventsRef = getEmergencyEventsRef;

exports.getEmergencyEvents = function getEmergencyEvents(dcOrVars, vars) {
  return executeQuery(getEmergencyEventsRef(dcOrVars, vars));
};

const listVenueLayoutsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVenueLayouts');
}
listVenueLayoutsRef.operationName = 'ListVenueLayouts';
exports.listVenueLayoutsRef = listVenueLayoutsRef;

exports.listVenueLayouts = function listVenueLayouts(dc) {
  return executeQuery(listVenueLayoutsRef(dc));
};

const getVenueLayoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetVenueLayout', inputVars);
}
getVenueLayoutRef.operationName = 'GetVenueLayout';
exports.getVenueLayoutRef = getVenueLayoutRef;

exports.getVenueLayout = function getVenueLayout(dcOrVars, vars) {
  return executeQuery(getVenueLayoutRef(dcOrVars, vars));
};

const listTicketsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTickets', inputVars);
}
listTicketsRef.operationName = 'ListTickets';
exports.listTicketsRef = listTicketsRef;

exports.listTickets = function listTickets(dcOrVars, vars) {
  return executeQuery(listTicketsRef(dcOrVars, vars));
};

const getUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserProfile', inputVars);
}
getUserProfileRef.operationName = 'GetUserProfile';
exports.getUserProfileRef = getUserProfileRef;

exports.getUserProfile = function getUserProfile(dcOrVars, vars) {
  return executeQuery(getUserProfileRef(dcOrVars, vars));
};

const getGuestTicketsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetGuestTickets', inputVars);
}
getGuestTicketsRef.operationName = 'GetGuestTickets';
exports.getGuestTicketsRef = getGuestTicketsRef;

exports.getGuestTickets = function getGuestTickets(dcOrVars, vars) {
  return executeQuery(getGuestTicketsRef(dcOrVars, vars));
};

const getTicketRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTicket', inputVars);
}
getTicketRef.operationName = 'GetTicket';
exports.getTicketRef = getTicketRef;

exports.getTicket = function getTicket(dcOrVars, vars) {
  return executeQuery(getTicketRef(dcOrVars, vars));
};

const getSystemAlertsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSystemAlerts', inputVars);
}
getSystemAlertsRef.operationName = 'GetSystemAlerts';
exports.getSystemAlertsRef = getSystemAlertsRef;

exports.getSystemAlerts = function getSystemAlerts(dcOrVars, vars) {
  return executeQuery(getSystemAlertsRef(dcOrVars, vars));
};
