# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListEvents*](#listevents)
  - [*GetActiveEvent*](#getactiveevent)
  - [*GetEmergencyEvents*](#getemergencyevents)
  - [*ListVenueLayouts*](#listvenuelayouts)
  - [*GetVenueLayout*](#getvenuelayout)
  - [*ListTickets*](#listtickets)
  - [*GetUserProfile*](#getuserprofile)
  - [*GetGuestTickets*](#getguesttickets)
  - [*GetTicket*](#getticket)
  - [*GetSystemAlerts*](#getsystemalerts)
- [**Mutations**](#mutations)
  - [*LogEmergencyEvent*](#logemergencyevent)
  - [*CreateEvent*](#createevent)
  - [*IssueTicket*](#issueticket)
  - [*CreateVenueLayout*](#createvenuelayout)
  - [*UpdateVenueLayout*](#updatevenuelayout)
  - [*DeleteVenueLayout*](#deletevenuelayout)
  - [*DeleteEvent*](#deleteevent)
  - [*DeleteTicketsByEvent*](#deleteticketsbyevent)
  - [*DeleteEmergencyEventsByEvent*](#deleteemergencyeventsbyevent)
  - [*SetActiveEvent*](#setactiveevent)
  - [*UpsertUserProfile*](#upsertuserprofile)
  - [*ClaimTicket*](#claimticket)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@promptwars/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@promptwars/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@promptwars/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListEvents
You can execute the `ListEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listEvents(): QueryPromise<ListEventsData, undefined>;

interface ListEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEventsData, undefined>;
}
export const listEventsRef: ListEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listEvents(dc: DataConnect): QueryPromise<ListEventsData, undefined>;

interface ListEventsRef {
  ...
  (dc: DataConnect): QueryRef<ListEventsData, undefined>;
}
export const listEventsRef: ListEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listEventsRef:
```typescript
const name = listEventsRef.operationName;
console.log(name);
```

### Variables
The `ListEvents` query has no variables.
### Return Type
Recall that executing the `ListEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListEventsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listEvents } from '@promptwars/dataconnect';


// Call the `listEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listEvents();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listEvents(dataConnect);

console.log(data.events);

// Or, you can use the `Promise` API.
listEvents().then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `ListEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listEventsRef } from '@promptwars/dataconnect';


// Call the `listEventsRef()` function to get a reference to the query.
const ref = listEventsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listEventsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## GetActiveEvent
You can execute the `GetActiveEvent` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getActiveEvent(): QueryPromise<GetActiveEventData, undefined>;

interface GetActiveEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetActiveEventData, undefined>;
}
export const getActiveEventRef: GetActiveEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getActiveEvent(dc: DataConnect): QueryPromise<GetActiveEventData, undefined>;

interface GetActiveEventRef {
  ...
  (dc: DataConnect): QueryRef<GetActiveEventData, undefined>;
}
export const getActiveEventRef: GetActiveEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getActiveEventRef:
```typescript
const name = getActiveEventRef.operationName;
console.log(name);
```

### Variables
The `GetActiveEvent` query has no variables.
### Return Type
Recall that executing the `GetActiveEvent` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetActiveEventData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetActiveEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getActiveEvent } from '@promptwars/dataconnect';


// Call the `getActiveEvent()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getActiveEvent();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getActiveEvent(dataConnect);

console.log(data.events);

// Or, you can use the `Promise` API.
getActiveEvent().then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `GetActiveEvent`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getActiveEventRef } from '@promptwars/dataconnect';


// Call the `getActiveEventRef()` function to get a reference to the query.
const ref = getActiveEventRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getActiveEventRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## GetEmergencyEvents
You can execute the `GetEmergencyEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getEmergencyEvents(vars?: GetEmergencyEventsVariables): QueryPromise<GetEmergencyEventsData, GetEmergencyEventsVariables>;

interface GetEmergencyEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetEmergencyEventsVariables): QueryRef<GetEmergencyEventsData, GetEmergencyEventsVariables>;
}
export const getEmergencyEventsRef: GetEmergencyEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEmergencyEvents(dc: DataConnect, vars?: GetEmergencyEventsVariables): QueryPromise<GetEmergencyEventsData, GetEmergencyEventsVariables>;

interface GetEmergencyEventsRef {
  ...
  (dc: DataConnect, vars?: GetEmergencyEventsVariables): QueryRef<GetEmergencyEventsData, GetEmergencyEventsVariables>;
}
export const getEmergencyEventsRef: GetEmergencyEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEmergencyEventsRef:
```typescript
const name = getEmergencyEventsRef.operationName;
console.log(name);
```

### Variables
The `GetEmergencyEvents` query has an optional argument of type `GetEmergencyEventsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetEmergencyEventsVariables {
  eventId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `GetEmergencyEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEmergencyEventsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetEmergencyEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEmergencyEvents, GetEmergencyEventsVariables } from '@promptwars/dataconnect';

// The `GetEmergencyEvents` query has an optional argument of type `GetEmergencyEventsVariables`:
const getEmergencyEventsVars: GetEmergencyEventsVariables = {
  eventId: ..., // optional
};

// Call the `getEmergencyEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEmergencyEvents(getEmergencyEventsVars);
// Variables can be defined inline as well.
const { data } = await getEmergencyEvents({ eventId: ..., });
// Since all variables are optional for this query, you can omit the `GetEmergencyEventsVariables` argument.
const { data } = await getEmergencyEvents();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEmergencyEvents(dataConnect, getEmergencyEventsVars);

console.log(data.emergencyEvents);

// Or, you can use the `Promise` API.
getEmergencyEvents(getEmergencyEventsVars).then((response) => {
  const data = response.data;
  console.log(data.emergencyEvents);
});
```

### Using `GetEmergencyEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEmergencyEventsRef, GetEmergencyEventsVariables } from '@promptwars/dataconnect';

// The `GetEmergencyEvents` query has an optional argument of type `GetEmergencyEventsVariables`:
const getEmergencyEventsVars: GetEmergencyEventsVariables = {
  eventId: ..., // optional
};

// Call the `getEmergencyEventsRef()` function to get a reference to the query.
const ref = getEmergencyEventsRef(getEmergencyEventsVars);
// Variables can be defined inline as well.
const ref = getEmergencyEventsRef({ eventId: ..., });
// Since all variables are optional for this query, you can omit the `GetEmergencyEventsVariables` argument.
const ref = getEmergencyEventsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEmergencyEventsRef(dataConnect, getEmergencyEventsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.emergencyEvents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.emergencyEvents);
});
```

## ListVenueLayouts
You can execute the `ListVenueLayouts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listVenueLayouts(): QueryPromise<ListVenueLayoutsData, undefined>;

interface ListVenueLayoutsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVenueLayoutsData, undefined>;
}
export const listVenueLayoutsRef: ListVenueLayoutsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listVenueLayouts(dc: DataConnect): QueryPromise<ListVenueLayoutsData, undefined>;

interface ListVenueLayoutsRef {
  ...
  (dc: DataConnect): QueryRef<ListVenueLayoutsData, undefined>;
}
export const listVenueLayoutsRef: ListVenueLayoutsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listVenueLayoutsRef:
```typescript
const name = listVenueLayoutsRef.operationName;
console.log(name);
```

### Variables
The `ListVenueLayouts` query has no variables.
### Return Type
Recall that executing the `ListVenueLayouts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListVenueLayoutsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListVenueLayoutsData {
  venueLayouts: ({
    id: UUIDString;
    name: string;
    elements: string;
    createdAt: TimestampString;
  } & VenueLayout_Key)[];
}
```
### Using `ListVenueLayouts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listVenueLayouts } from '@promptwars/dataconnect';


// Call the `listVenueLayouts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listVenueLayouts();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listVenueLayouts(dataConnect);

console.log(data.venueLayouts);

// Or, you can use the `Promise` API.
listVenueLayouts().then((response) => {
  const data = response.data;
  console.log(data.venueLayouts);
});
```

### Using `ListVenueLayouts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listVenueLayoutsRef } from '@promptwars/dataconnect';


// Call the `listVenueLayoutsRef()` function to get a reference to the query.
const ref = listVenueLayoutsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listVenueLayoutsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.venueLayouts);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.venueLayouts);
});
```

## GetVenueLayout
You can execute the `GetVenueLayout` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getVenueLayout(vars: GetVenueLayoutVariables): QueryPromise<GetVenueLayoutData, GetVenueLayoutVariables>;

interface GetVenueLayoutRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetVenueLayoutVariables): QueryRef<GetVenueLayoutData, GetVenueLayoutVariables>;
}
export const getVenueLayoutRef: GetVenueLayoutRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getVenueLayout(dc: DataConnect, vars: GetVenueLayoutVariables): QueryPromise<GetVenueLayoutData, GetVenueLayoutVariables>;

interface GetVenueLayoutRef {
  ...
  (dc: DataConnect, vars: GetVenueLayoutVariables): QueryRef<GetVenueLayoutData, GetVenueLayoutVariables>;
}
export const getVenueLayoutRef: GetVenueLayoutRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getVenueLayoutRef:
```typescript
const name = getVenueLayoutRef.operationName;
console.log(name);
```

### Variables
The `GetVenueLayout` query requires an argument of type `GetVenueLayoutVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetVenueLayoutVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetVenueLayout` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetVenueLayoutData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetVenueLayoutData {
  venueLayout?: {
    id: UUIDString;
    name: string;
    elements: string;
    createdAt: TimestampString;
  } & VenueLayout_Key;
}
```
### Using `GetVenueLayout`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getVenueLayout, GetVenueLayoutVariables } from '@promptwars/dataconnect';

// The `GetVenueLayout` query requires an argument of type `GetVenueLayoutVariables`:
const getVenueLayoutVars: GetVenueLayoutVariables = {
  id: ..., 
};

// Call the `getVenueLayout()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getVenueLayout(getVenueLayoutVars);
// Variables can be defined inline as well.
const { data } = await getVenueLayout({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getVenueLayout(dataConnect, getVenueLayoutVars);

console.log(data.venueLayout);

// Or, you can use the `Promise` API.
getVenueLayout(getVenueLayoutVars).then((response) => {
  const data = response.data;
  console.log(data.venueLayout);
});
```

### Using `GetVenueLayout`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getVenueLayoutRef, GetVenueLayoutVariables } from '@promptwars/dataconnect';

// The `GetVenueLayout` query requires an argument of type `GetVenueLayoutVariables`:
const getVenueLayoutVars: GetVenueLayoutVariables = {
  id: ..., 
};

// Call the `getVenueLayoutRef()` function to get a reference to the query.
const ref = getVenueLayoutRef(getVenueLayoutVars);
// Variables can be defined inline as well.
const ref = getVenueLayoutRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getVenueLayoutRef(dataConnect, getVenueLayoutVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.venueLayout);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.venueLayout);
});
```

## ListTickets
You can execute the `ListTickets` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listTickets(vars?: ListTicketsVariables): QueryPromise<ListTicketsData, ListTicketsVariables>;

interface ListTicketsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListTicketsVariables): QueryRef<ListTicketsData, ListTicketsVariables>;
}
export const listTicketsRef: ListTicketsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listTickets(dc: DataConnect, vars?: ListTicketsVariables): QueryPromise<ListTicketsData, ListTicketsVariables>;

interface ListTicketsRef {
  ...
  (dc: DataConnect, vars?: ListTicketsVariables): QueryRef<ListTicketsData, ListTicketsVariables>;
}
export const listTicketsRef: ListTicketsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listTicketsRef:
```typescript
const name = listTicketsRef.operationName;
console.log(name);
```

### Variables
The `ListTickets` query has an optional argument of type `ListTicketsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListTicketsVariables {
  eventId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `ListTickets` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListTicketsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListTickets`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listTickets, ListTicketsVariables } from '@promptwars/dataconnect';

// The `ListTickets` query has an optional argument of type `ListTicketsVariables`:
const listTicketsVars: ListTicketsVariables = {
  eventId: ..., // optional
};

// Call the `listTickets()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listTickets(listTicketsVars);
// Variables can be defined inline as well.
const { data } = await listTickets({ eventId: ..., });
// Since all variables are optional for this query, you can omit the `ListTicketsVariables` argument.
const { data } = await listTickets();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listTickets(dataConnect, listTicketsVars);

console.log(data.tickets);

// Or, you can use the `Promise` API.
listTickets(listTicketsVars).then((response) => {
  const data = response.data;
  console.log(data.tickets);
});
```

### Using `ListTickets`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listTicketsRef, ListTicketsVariables } from '@promptwars/dataconnect';

// The `ListTickets` query has an optional argument of type `ListTicketsVariables`:
const listTicketsVars: ListTicketsVariables = {
  eventId: ..., // optional
};

// Call the `listTicketsRef()` function to get a reference to the query.
const ref = listTicketsRef(listTicketsVars);
// Variables can be defined inline as well.
const ref = listTicketsRef({ eventId: ..., });
// Since all variables are optional for this query, you can omit the `ListTicketsVariables` argument.
const ref = listTicketsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listTicketsRef(dataConnect, listTicketsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tickets);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tickets);
});
```

## GetUserProfile
You can execute the `GetUserProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUserProfile(vars: GetUserProfileVariables): QueryPromise<GetUserProfileData, GetUserProfileVariables>;

interface GetUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserProfileVariables): QueryRef<GetUserProfileData, GetUserProfileVariables>;
}
export const getUserProfileRef: GetUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserProfile(dc: DataConnect, vars: GetUserProfileVariables): QueryPromise<GetUserProfileData, GetUserProfileVariables>;

interface GetUserProfileRef {
  ...
  (dc: DataConnect, vars: GetUserProfileVariables): QueryRef<GetUserProfileData, GetUserProfileVariables>;
}
export const getUserProfileRef: GetUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserProfileRef:
```typescript
const name = getUserProfileRef.operationName;
console.log(name);
```

### Variables
The `GetUserProfile` query requires an argument of type `GetUserProfileVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserProfileVariables {
  uid: string;
}
```
### Return Type
Recall that executing the `GetUserProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserProfileData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserProfileData {
  userProfiles: ({
    uid: string;
    name: string;
    age: number;
    idCardNumber: string;
    phone: string;
    email: string;
  } & UserProfile_Key)[];
}
```
### Using `GetUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserProfile, GetUserProfileVariables } from '@promptwars/dataconnect';

// The `GetUserProfile` query requires an argument of type `GetUserProfileVariables`:
const getUserProfileVars: GetUserProfileVariables = {
  uid: ..., 
};

// Call the `getUserProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserProfile(getUserProfileVars);
// Variables can be defined inline as well.
const { data } = await getUserProfile({ uid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserProfile(dataConnect, getUserProfileVars);

console.log(data.userProfiles);

// Or, you can use the `Promise` API.
getUserProfile(getUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.userProfiles);
});
```

### Using `GetUserProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserProfileRef, GetUserProfileVariables } from '@promptwars/dataconnect';

// The `GetUserProfile` query requires an argument of type `GetUserProfileVariables`:
const getUserProfileVars: GetUserProfileVariables = {
  uid: ..., 
};

// Call the `getUserProfileRef()` function to get a reference to the query.
const ref = getUserProfileRef(getUserProfileVars);
// Variables can be defined inline as well.
const ref = getUserProfileRef({ uid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserProfileRef(dataConnect, getUserProfileVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userProfiles);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userProfiles);
});
```

## GetGuestTickets
You can execute the `GetGuestTickets` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getGuestTickets(vars: GetGuestTicketsVariables): QueryPromise<GetGuestTicketsData, GetGuestTicketsVariables>;

interface GetGuestTicketsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetGuestTicketsVariables): QueryRef<GetGuestTicketsData, GetGuestTicketsVariables>;
}
export const getGuestTicketsRef: GetGuestTicketsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getGuestTickets(dc: DataConnect, vars: GetGuestTicketsVariables): QueryPromise<GetGuestTicketsData, GetGuestTicketsVariables>;

interface GetGuestTicketsRef {
  ...
  (dc: DataConnect, vars: GetGuestTicketsVariables): QueryRef<GetGuestTicketsData, GetGuestTicketsVariables>;
}
export const getGuestTicketsRef: GetGuestTicketsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getGuestTicketsRef:
```typescript
const name = getGuestTicketsRef.operationName;
console.log(name);
```

### Variables
The `GetGuestTickets` query requires an argument of type `GetGuestTicketsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetGuestTicketsVariables {
  userId: string;
}
```
### Return Type
Recall that executing the `GetGuestTickets` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetGuestTicketsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetGuestTickets`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getGuestTickets, GetGuestTicketsVariables } from '@promptwars/dataconnect';

// The `GetGuestTickets` query requires an argument of type `GetGuestTicketsVariables`:
const getGuestTicketsVars: GetGuestTicketsVariables = {
  userId: ..., 
};

// Call the `getGuestTickets()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getGuestTickets(getGuestTicketsVars);
// Variables can be defined inline as well.
const { data } = await getGuestTickets({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getGuestTickets(dataConnect, getGuestTicketsVars);

console.log(data.tickets);

// Or, you can use the `Promise` API.
getGuestTickets(getGuestTicketsVars).then((response) => {
  const data = response.data;
  console.log(data.tickets);
});
```

### Using `GetGuestTickets`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getGuestTicketsRef, GetGuestTicketsVariables } from '@promptwars/dataconnect';

// The `GetGuestTickets` query requires an argument of type `GetGuestTicketsVariables`:
const getGuestTicketsVars: GetGuestTicketsVariables = {
  userId: ..., 
};

// Call the `getGuestTicketsRef()` function to get a reference to the query.
const ref = getGuestTicketsRef(getGuestTicketsVars);
// Variables can be defined inline as well.
const ref = getGuestTicketsRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getGuestTicketsRef(dataConnect, getGuestTicketsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tickets);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tickets);
});
```

## GetTicket
You can execute the `GetTicket` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getTicket(vars: GetTicketVariables): QueryPromise<GetTicketData, GetTicketVariables>;

interface GetTicketRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTicketVariables): QueryRef<GetTicketData, GetTicketVariables>;
}
export const getTicketRef: GetTicketRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTicket(dc: DataConnect, vars: GetTicketVariables): QueryPromise<GetTicketData, GetTicketVariables>;

interface GetTicketRef {
  ...
  (dc: DataConnect, vars: GetTicketVariables): QueryRef<GetTicketData, GetTicketVariables>;
}
export const getTicketRef: GetTicketRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTicketRef:
```typescript
const name = getTicketRef.operationName;
console.log(name);
```

### Variables
The `GetTicket` query requires an argument of type `GetTicketVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTicketVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetTicket` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTicketData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTicketData {
  ticket?: {
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
    event: {
      id: UUIDString;
      title: string;
      venueName: string;
      startTime: TimestampString;
      isActive: boolean;
    } & Event_Key;
  } & Ticket_Key;
}
```
### Using `GetTicket`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTicket, GetTicketVariables } from '@promptwars/dataconnect';

// The `GetTicket` query requires an argument of type `GetTicketVariables`:
const getTicketVars: GetTicketVariables = {
  id: ..., 
};

// Call the `getTicket()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTicket(getTicketVars);
// Variables can be defined inline as well.
const { data } = await getTicket({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTicket(dataConnect, getTicketVars);

console.log(data.ticket);

// Or, you can use the `Promise` API.
getTicket(getTicketVars).then((response) => {
  const data = response.data;
  console.log(data.ticket);
});
```

### Using `GetTicket`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTicketRef, GetTicketVariables } from '@promptwars/dataconnect';

// The `GetTicket` query requires an argument of type `GetTicketVariables`:
const getTicketVars: GetTicketVariables = {
  id: ..., 
};

// Call the `getTicketRef()` function to get a reference to the query.
const ref = getTicketRef(getTicketVars);
// Variables can be defined inline as well.
const ref = getTicketRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTicketRef(dataConnect, getTicketVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.ticket);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.ticket);
});
```

## GetSystemAlerts
You can execute the `GetSystemAlerts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getSystemAlerts(vars?: GetSystemAlertsVariables): QueryPromise<GetSystemAlertsData, GetSystemAlertsVariables>;

interface GetSystemAlertsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetSystemAlertsVariables): QueryRef<GetSystemAlertsData, GetSystemAlertsVariables>;
}
export const getSystemAlertsRef: GetSystemAlertsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSystemAlerts(dc: DataConnect, vars?: GetSystemAlertsVariables): QueryPromise<GetSystemAlertsData, GetSystemAlertsVariables>;

interface GetSystemAlertsRef {
  ...
  (dc: DataConnect, vars?: GetSystemAlertsVariables): QueryRef<GetSystemAlertsData, GetSystemAlertsVariables>;
}
export const getSystemAlertsRef: GetSystemAlertsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSystemAlertsRef:
```typescript
const name = getSystemAlertsRef.operationName;
console.log(name);
```

### Variables
The `GetSystemAlerts` query has an optional argument of type `GetSystemAlertsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSystemAlertsVariables {
  eventId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `GetSystemAlerts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSystemAlertsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSystemAlertsData {
  eventAlerts: ({
    id: UUIDString;
    type: string;
    priority: string;
    details: string;
    timestamp: TimestampString;
    status: string;
    eventId?: UUIDString | null;
  } & EmergencyEvent_Key)[];
    communityAlerts: ({
      id: UUIDString;
      type: string;
      priority: string;
      details: string;
      timestamp: TimestampString;
      status: string;
      eventId?: UUIDString | null;
    } & EmergencyEvent_Key)[];
}
```
### Using `GetSystemAlerts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSystemAlerts, GetSystemAlertsVariables } from '@promptwars/dataconnect';

// The `GetSystemAlerts` query has an optional argument of type `GetSystemAlertsVariables`:
const getSystemAlertsVars: GetSystemAlertsVariables = {
  eventId: ..., // optional
};

// Call the `getSystemAlerts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSystemAlerts(getSystemAlertsVars);
// Variables can be defined inline as well.
const { data } = await getSystemAlerts({ eventId: ..., });
// Since all variables are optional for this query, you can omit the `GetSystemAlertsVariables` argument.
const { data } = await getSystemAlerts();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSystemAlerts(dataConnect, getSystemAlertsVars);

console.log(data.eventAlerts);
console.log(data.communityAlerts);

// Or, you can use the `Promise` API.
getSystemAlerts(getSystemAlertsVars).then((response) => {
  const data = response.data;
  console.log(data.eventAlerts);
  console.log(data.communityAlerts);
});
```

### Using `GetSystemAlerts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSystemAlertsRef, GetSystemAlertsVariables } from '@promptwars/dataconnect';

// The `GetSystemAlerts` query has an optional argument of type `GetSystemAlertsVariables`:
const getSystemAlertsVars: GetSystemAlertsVariables = {
  eventId: ..., // optional
};

// Call the `getSystemAlertsRef()` function to get a reference to the query.
const ref = getSystemAlertsRef(getSystemAlertsVars);
// Variables can be defined inline as well.
const ref = getSystemAlertsRef({ eventId: ..., });
// Since all variables are optional for this query, you can omit the `GetSystemAlertsVariables` argument.
const ref = getSystemAlertsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSystemAlertsRef(dataConnect, getSystemAlertsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.eventAlerts);
console.log(data.communityAlerts);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.eventAlerts);
  console.log(data.communityAlerts);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## LogEmergencyEvent
You can execute the `LogEmergencyEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
logEmergencyEvent(vars: LogEmergencyEventVariables): MutationPromise<LogEmergencyEventData, LogEmergencyEventVariables>;

interface LogEmergencyEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: LogEmergencyEventVariables): MutationRef<LogEmergencyEventData, LogEmergencyEventVariables>;
}
export const logEmergencyEventRef: LogEmergencyEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
logEmergencyEvent(dc: DataConnect, vars: LogEmergencyEventVariables): MutationPromise<LogEmergencyEventData, LogEmergencyEventVariables>;

interface LogEmergencyEventRef {
  ...
  (dc: DataConnect, vars: LogEmergencyEventVariables): MutationRef<LogEmergencyEventData, LogEmergencyEventVariables>;
}
export const logEmergencyEventRef: LogEmergencyEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the logEmergencyEventRef:
```typescript
const name = logEmergencyEventRef.operationName;
console.log(name);
```

### Variables
The `LogEmergencyEvent` mutation requires an argument of type `LogEmergencyEventVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface LogEmergencyEventVariables {
  type: string;
  priority: string;
  details: string;
  lat?: number | null;
  lng?: number | null;
  eventId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `LogEmergencyEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `LogEmergencyEventData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface LogEmergencyEventData {
  emergencyEvent_insert: EmergencyEvent_Key;
}
```
### Using `LogEmergencyEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, logEmergencyEvent, LogEmergencyEventVariables } from '@promptwars/dataconnect';

// The `LogEmergencyEvent` mutation requires an argument of type `LogEmergencyEventVariables`:
const logEmergencyEventVars: LogEmergencyEventVariables = {
  type: ..., 
  priority: ..., 
  details: ..., 
  lat: ..., // optional
  lng: ..., // optional
  eventId: ..., // optional
};

// Call the `logEmergencyEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await logEmergencyEvent(logEmergencyEventVars);
// Variables can be defined inline as well.
const { data } = await logEmergencyEvent({ type: ..., priority: ..., details: ..., lat: ..., lng: ..., eventId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await logEmergencyEvent(dataConnect, logEmergencyEventVars);

console.log(data.emergencyEvent_insert);

// Or, you can use the `Promise` API.
logEmergencyEvent(logEmergencyEventVars).then((response) => {
  const data = response.data;
  console.log(data.emergencyEvent_insert);
});
```

### Using `LogEmergencyEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, logEmergencyEventRef, LogEmergencyEventVariables } from '@promptwars/dataconnect';

// The `LogEmergencyEvent` mutation requires an argument of type `LogEmergencyEventVariables`:
const logEmergencyEventVars: LogEmergencyEventVariables = {
  type: ..., 
  priority: ..., 
  details: ..., 
  lat: ..., // optional
  lng: ..., // optional
  eventId: ..., // optional
};

// Call the `logEmergencyEventRef()` function to get a reference to the mutation.
const ref = logEmergencyEventRef(logEmergencyEventVars);
// Variables can be defined inline as well.
const ref = logEmergencyEventRef({ type: ..., priority: ..., details: ..., lat: ..., lng: ..., eventId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = logEmergencyEventRef(dataConnect, logEmergencyEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.emergencyEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.emergencyEvent_insert);
});
```

## CreateEvent
You can execute the `CreateEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createEvent(vars: CreateEventVariables): MutationPromise<CreateEventData, CreateEventVariables>;

interface CreateEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEventVariables): MutationRef<CreateEventData, CreateEventVariables>;
}
export const createEventRef: CreateEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createEvent(dc: DataConnect, vars: CreateEventVariables): MutationPromise<CreateEventData, CreateEventVariables>;

interface CreateEventRef {
  ...
  (dc: DataConnect, vars: CreateEventVariables): MutationRef<CreateEventData, CreateEventVariables>;
}
export const createEventRef: CreateEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createEventRef:
```typescript
const name = createEventRef.operationName;
console.log(name);
```

### Variables
The `CreateEvent` mutation requires an argument of type `CreateEventVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateEventData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateEventData {
  event_insert: Event_Key;
}
```
### Using `CreateEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createEvent, CreateEventVariables } from '@promptwars/dataconnect';

// The `CreateEvent` mutation requires an argument of type `CreateEventVariables`:
const createEventVars: CreateEventVariables = {
  title: ..., 
  venueName: ..., 
  venueLat: ..., 
  venueLng: ..., 
  description: ..., // optional
  isActive: ..., // optional
  minAge: ..., // optional
  layoutId: ..., // optional
  layoutConfig: ..., // optional
  startTime: ..., // optional
  expiryDate: ..., // optional
  bannerUrl: ..., // optional
};

// Call the `createEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createEvent(createEventVars);
// Variables can be defined inline as well.
const { data } = await createEvent({ title: ..., venueName: ..., venueLat: ..., venueLng: ..., description: ..., isActive: ..., minAge: ..., layoutId: ..., layoutConfig: ..., startTime: ..., expiryDate: ..., bannerUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createEvent(dataConnect, createEventVars);

console.log(data.event_insert);

// Or, you can use the `Promise` API.
createEvent(createEventVars).then((response) => {
  const data = response.data;
  console.log(data.event_insert);
});
```

### Using `CreateEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createEventRef, CreateEventVariables } from '@promptwars/dataconnect';

// The `CreateEvent` mutation requires an argument of type `CreateEventVariables`:
const createEventVars: CreateEventVariables = {
  title: ..., 
  venueName: ..., 
  venueLat: ..., 
  venueLng: ..., 
  description: ..., // optional
  isActive: ..., // optional
  minAge: ..., // optional
  layoutId: ..., // optional
  layoutConfig: ..., // optional
  startTime: ..., // optional
  expiryDate: ..., // optional
  bannerUrl: ..., // optional
};

// Call the `createEventRef()` function to get a reference to the mutation.
const ref = createEventRef(createEventVars);
// Variables can be defined inline as well.
const ref = createEventRef({ title: ..., venueName: ..., venueLat: ..., venueLng: ..., description: ..., isActive: ..., minAge: ..., layoutId: ..., layoutConfig: ..., startTime: ..., expiryDate: ..., bannerUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createEventRef(dataConnect, createEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.event_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.event_insert);
});
```

## IssueTicket
You can execute the `IssueTicket` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
issueTicket(vars: IssueTicketVariables): MutationPromise<IssueTicketData, IssueTicketVariables>;

interface IssueTicketRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: IssueTicketVariables): MutationRef<IssueTicketData, IssueTicketVariables>;
}
export const issueTicketRef: IssueTicketRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
issueTicket(dc: DataConnect, vars: IssueTicketVariables): MutationPromise<IssueTicketData, IssueTicketVariables>;

interface IssueTicketRef {
  ...
  (dc: DataConnect, vars: IssueTicketVariables): MutationRef<IssueTicketData, IssueTicketVariables>;
}
export const issueTicketRef: IssueTicketRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the issueTicketRef:
```typescript
const name = issueTicketRef.operationName;
console.log(name);
```

### Variables
The `IssueTicket` mutation requires an argument of type `IssueTicketVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `IssueTicket` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `IssueTicketData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface IssueTicketData {
  ticket_insert: Ticket_Key;
}
```
### Using `IssueTicket`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, issueTicket, IssueTicketVariables } from '@promptwars/dataconnect';

// The `IssueTicket` mutation requires an argument of type `IssueTicketVariables`:
const issueTicketVars: IssueTicketVariables = {
  eventId: ..., 
  gate: ..., 
  section: ..., 
  row: ..., 
  seat: ..., 
  guestName: ..., 
  guestAge: ..., 
  guestIdNumber: ..., 
  guestMobile: ..., 
  guestEmail: ..., 
  userId: ..., // optional
};

// Call the `issueTicket()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await issueTicket(issueTicketVars);
// Variables can be defined inline as well.
const { data } = await issueTicket({ eventId: ..., gate: ..., section: ..., row: ..., seat: ..., guestName: ..., guestAge: ..., guestIdNumber: ..., guestMobile: ..., guestEmail: ..., userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await issueTicket(dataConnect, issueTicketVars);

console.log(data.ticket_insert);

// Or, you can use the `Promise` API.
issueTicket(issueTicketVars).then((response) => {
  const data = response.data;
  console.log(data.ticket_insert);
});
```

### Using `IssueTicket`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, issueTicketRef, IssueTicketVariables } from '@promptwars/dataconnect';

// The `IssueTicket` mutation requires an argument of type `IssueTicketVariables`:
const issueTicketVars: IssueTicketVariables = {
  eventId: ..., 
  gate: ..., 
  section: ..., 
  row: ..., 
  seat: ..., 
  guestName: ..., 
  guestAge: ..., 
  guestIdNumber: ..., 
  guestMobile: ..., 
  guestEmail: ..., 
  userId: ..., // optional
};

// Call the `issueTicketRef()` function to get a reference to the mutation.
const ref = issueTicketRef(issueTicketVars);
// Variables can be defined inline as well.
const ref = issueTicketRef({ eventId: ..., gate: ..., section: ..., row: ..., seat: ..., guestName: ..., guestAge: ..., guestIdNumber: ..., guestMobile: ..., guestEmail: ..., userId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = issueTicketRef(dataConnect, issueTicketVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.ticket_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.ticket_insert);
});
```

## CreateVenueLayout
You can execute the `CreateVenueLayout` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createVenueLayout(vars: CreateVenueLayoutVariables): MutationPromise<CreateVenueLayoutData, CreateVenueLayoutVariables>;

interface CreateVenueLayoutRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVenueLayoutVariables): MutationRef<CreateVenueLayoutData, CreateVenueLayoutVariables>;
}
export const createVenueLayoutRef: CreateVenueLayoutRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createVenueLayout(dc: DataConnect, vars: CreateVenueLayoutVariables): MutationPromise<CreateVenueLayoutData, CreateVenueLayoutVariables>;

interface CreateVenueLayoutRef {
  ...
  (dc: DataConnect, vars: CreateVenueLayoutVariables): MutationRef<CreateVenueLayoutData, CreateVenueLayoutVariables>;
}
export const createVenueLayoutRef: CreateVenueLayoutRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createVenueLayoutRef:
```typescript
const name = createVenueLayoutRef.operationName;
console.log(name);
```

### Variables
The `CreateVenueLayout` mutation requires an argument of type `CreateVenueLayoutVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateVenueLayoutVariables {
  name: string;
  elements: string;
}
```
### Return Type
Recall that executing the `CreateVenueLayout` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateVenueLayoutData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateVenueLayoutData {
  venueLayout_insert: VenueLayout_Key;
}
```
### Using `CreateVenueLayout`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createVenueLayout, CreateVenueLayoutVariables } from '@promptwars/dataconnect';

// The `CreateVenueLayout` mutation requires an argument of type `CreateVenueLayoutVariables`:
const createVenueLayoutVars: CreateVenueLayoutVariables = {
  name: ..., 
  elements: ..., 
};

// Call the `createVenueLayout()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createVenueLayout(createVenueLayoutVars);
// Variables can be defined inline as well.
const { data } = await createVenueLayout({ name: ..., elements: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createVenueLayout(dataConnect, createVenueLayoutVars);

console.log(data.venueLayout_insert);

// Or, you can use the `Promise` API.
createVenueLayout(createVenueLayoutVars).then((response) => {
  const data = response.data;
  console.log(data.venueLayout_insert);
});
```

### Using `CreateVenueLayout`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createVenueLayoutRef, CreateVenueLayoutVariables } from '@promptwars/dataconnect';

// The `CreateVenueLayout` mutation requires an argument of type `CreateVenueLayoutVariables`:
const createVenueLayoutVars: CreateVenueLayoutVariables = {
  name: ..., 
  elements: ..., 
};

// Call the `createVenueLayoutRef()` function to get a reference to the mutation.
const ref = createVenueLayoutRef(createVenueLayoutVars);
// Variables can be defined inline as well.
const ref = createVenueLayoutRef({ name: ..., elements: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createVenueLayoutRef(dataConnect, createVenueLayoutVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.venueLayout_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.venueLayout_insert);
});
```

## UpdateVenueLayout
You can execute the `UpdateVenueLayout` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateVenueLayout(vars: UpdateVenueLayoutVariables): MutationPromise<UpdateVenueLayoutData, UpdateVenueLayoutVariables>;

interface UpdateVenueLayoutRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateVenueLayoutVariables): MutationRef<UpdateVenueLayoutData, UpdateVenueLayoutVariables>;
}
export const updateVenueLayoutRef: UpdateVenueLayoutRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateVenueLayout(dc: DataConnect, vars: UpdateVenueLayoutVariables): MutationPromise<UpdateVenueLayoutData, UpdateVenueLayoutVariables>;

interface UpdateVenueLayoutRef {
  ...
  (dc: DataConnect, vars: UpdateVenueLayoutVariables): MutationRef<UpdateVenueLayoutData, UpdateVenueLayoutVariables>;
}
export const updateVenueLayoutRef: UpdateVenueLayoutRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateVenueLayoutRef:
```typescript
const name = updateVenueLayoutRef.operationName;
console.log(name);
```

### Variables
The `UpdateVenueLayout` mutation requires an argument of type `UpdateVenueLayoutVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateVenueLayoutVariables {
  id: UUIDString;
  name?: string | null;
  elements?: string | null;
}
```
### Return Type
Recall that executing the `UpdateVenueLayout` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateVenueLayoutData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateVenueLayoutData {
  venueLayout_update?: VenueLayout_Key | null;
}
```
### Using `UpdateVenueLayout`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateVenueLayout, UpdateVenueLayoutVariables } from '@promptwars/dataconnect';

// The `UpdateVenueLayout` mutation requires an argument of type `UpdateVenueLayoutVariables`:
const updateVenueLayoutVars: UpdateVenueLayoutVariables = {
  id: ..., 
  name: ..., // optional
  elements: ..., // optional
};

// Call the `updateVenueLayout()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateVenueLayout(updateVenueLayoutVars);
// Variables can be defined inline as well.
const { data } = await updateVenueLayout({ id: ..., name: ..., elements: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateVenueLayout(dataConnect, updateVenueLayoutVars);

console.log(data.venueLayout_update);

// Or, you can use the `Promise` API.
updateVenueLayout(updateVenueLayoutVars).then((response) => {
  const data = response.data;
  console.log(data.venueLayout_update);
});
```

### Using `UpdateVenueLayout`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateVenueLayoutRef, UpdateVenueLayoutVariables } from '@promptwars/dataconnect';

// The `UpdateVenueLayout` mutation requires an argument of type `UpdateVenueLayoutVariables`:
const updateVenueLayoutVars: UpdateVenueLayoutVariables = {
  id: ..., 
  name: ..., // optional
  elements: ..., // optional
};

// Call the `updateVenueLayoutRef()` function to get a reference to the mutation.
const ref = updateVenueLayoutRef(updateVenueLayoutVars);
// Variables can be defined inline as well.
const ref = updateVenueLayoutRef({ id: ..., name: ..., elements: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateVenueLayoutRef(dataConnect, updateVenueLayoutVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.venueLayout_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.venueLayout_update);
});
```

## DeleteVenueLayout
You can execute the `DeleteVenueLayout` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteVenueLayout(vars: DeleteVenueLayoutVariables): MutationPromise<DeleteVenueLayoutData, DeleteVenueLayoutVariables>;

interface DeleteVenueLayoutRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteVenueLayoutVariables): MutationRef<DeleteVenueLayoutData, DeleteVenueLayoutVariables>;
}
export const deleteVenueLayoutRef: DeleteVenueLayoutRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteVenueLayout(dc: DataConnect, vars: DeleteVenueLayoutVariables): MutationPromise<DeleteVenueLayoutData, DeleteVenueLayoutVariables>;

interface DeleteVenueLayoutRef {
  ...
  (dc: DataConnect, vars: DeleteVenueLayoutVariables): MutationRef<DeleteVenueLayoutData, DeleteVenueLayoutVariables>;
}
export const deleteVenueLayoutRef: DeleteVenueLayoutRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteVenueLayoutRef:
```typescript
const name = deleteVenueLayoutRef.operationName;
console.log(name);
```

### Variables
The `DeleteVenueLayout` mutation requires an argument of type `DeleteVenueLayoutVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteVenueLayoutVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteVenueLayout` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteVenueLayoutData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteVenueLayoutData {
  venueLayout_delete?: VenueLayout_Key | null;
}
```
### Using `DeleteVenueLayout`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteVenueLayout, DeleteVenueLayoutVariables } from '@promptwars/dataconnect';

// The `DeleteVenueLayout` mutation requires an argument of type `DeleteVenueLayoutVariables`:
const deleteVenueLayoutVars: DeleteVenueLayoutVariables = {
  id: ..., 
};

// Call the `deleteVenueLayout()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteVenueLayout(deleteVenueLayoutVars);
// Variables can be defined inline as well.
const { data } = await deleteVenueLayout({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteVenueLayout(dataConnect, deleteVenueLayoutVars);

console.log(data.venueLayout_delete);

// Or, you can use the `Promise` API.
deleteVenueLayout(deleteVenueLayoutVars).then((response) => {
  const data = response.data;
  console.log(data.venueLayout_delete);
});
```

### Using `DeleteVenueLayout`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteVenueLayoutRef, DeleteVenueLayoutVariables } from '@promptwars/dataconnect';

// The `DeleteVenueLayout` mutation requires an argument of type `DeleteVenueLayoutVariables`:
const deleteVenueLayoutVars: DeleteVenueLayoutVariables = {
  id: ..., 
};

// Call the `deleteVenueLayoutRef()` function to get a reference to the mutation.
const ref = deleteVenueLayoutRef(deleteVenueLayoutVars);
// Variables can be defined inline as well.
const ref = deleteVenueLayoutRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteVenueLayoutRef(dataConnect, deleteVenueLayoutVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.venueLayout_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.venueLayout_delete);
});
```

## DeleteEvent
You can execute the `DeleteEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteEvent(vars: DeleteEventVariables): MutationPromise<DeleteEventData, DeleteEventVariables>;

interface DeleteEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteEventVariables): MutationRef<DeleteEventData, DeleteEventVariables>;
}
export const deleteEventRef: DeleteEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteEvent(dc: DataConnect, vars: DeleteEventVariables): MutationPromise<DeleteEventData, DeleteEventVariables>;

interface DeleteEventRef {
  ...
  (dc: DataConnect, vars: DeleteEventVariables): MutationRef<DeleteEventData, DeleteEventVariables>;
}
export const deleteEventRef: DeleteEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteEventRef:
```typescript
const name = deleteEventRef.operationName;
console.log(name);
```

### Variables
The `DeleteEvent` mutation requires an argument of type `DeleteEventVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteEventVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteEventData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteEventData {
  event_delete?: Event_Key | null;
}
```
### Using `DeleteEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteEvent, DeleteEventVariables } from '@promptwars/dataconnect';

// The `DeleteEvent` mutation requires an argument of type `DeleteEventVariables`:
const deleteEventVars: DeleteEventVariables = {
  id: ..., 
};

// Call the `deleteEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteEvent(deleteEventVars);
// Variables can be defined inline as well.
const { data } = await deleteEvent({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteEvent(dataConnect, deleteEventVars);

console.log(data.event_delete);

// Or, you can use the `Promise` API.
deleteEvent(deleteEventVars).then((response) => {
  const data = response.data;
  console.log(data.event_delete);
});
```

### Using `DeleteEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteEventRef, DeleteEventVariables } from '@promptwars/dataconnect';

// The `DeleteEvent` mutation requires an argument of type `DeleteEventVariables`:
const deleteEventVars: DeleteEventVariables = {
  id: ..., 
};

// Call the `deleteEventRef()` function to get a reference to the mutation.
const ref = deleteEventRef(deleteEventVars);
// Variables can be defined inline as well.
const ref = deleteEventRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteEventRef(dataConnect, deleteEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.event_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.event_delete);
});
```

## DeleteTicketsByEvent
You can execute the `DeleteTicketsByEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteTicketsByEvent(vars: DeleteTicketsByEventVariables): MutationPromise<DeleteTicketsByEventData, DeleteTicketsByEventVariables>;

interface DeleteTicketsByEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTicketsByEventVariables): MutationRef<DeleteTicketsByEventData, DeleteTicketsByEventVariables>;
}
export const deleteTicketsByEventRef: DeleteTicketsByEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteTicketsByEvent(dc: DataConnect, vars: DeleteTicketsByEventVariables): MutationPromise<DeleteTicketsByEventData, DeleteTicketsByEventVariables>;

interface DeleteTicketsByEventRef {
  ...
  (dc: DataConnect, vars: DeleteTicketsByEventVariables): MutationRef<DeleteTicketsByEventData, DeleteTicketsByEventVariables>;
}
export const deleteTicketsByEventRef: DeleteTicketsByEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteTicketsByEventRef:
```typescript
const name = deleteTicketsByEventRef.operationName;
console.log(name);
```

### Variables
The `DeleteTicketsByEvent` mutation requires an argument of type `DeleteTicketsByEventVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteTicketsByEventVariables {
  eventId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteTicketsByEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteTicketsByEventData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteTicketsByEventData {
  ticket_deleteMany: number;
}
```
### Using `DeleteTicketsByEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteTicketsByEvent, DeleteTicketsByEventVariables } from '@promptwars/dataconnect';

// The `DeleteTicketsByEvent` mutation requires an argument of type `DeleteTicketsByEventVariables`:
const deleteTicketsByEventVars: DeleteTicketsByEventVariables = {
  eventId: ..., 
};

// Call the `deleteTicketsByEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteTicketsByEvent(deleteTicketsByEventVars);
// Variables can be defined inline as well.
const { data } = await deleteTicketsByEvent({ eventId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteTicketsByEvent(dataConnect, deleteTicketsByEventVars);

console.log(data.ticket_deleteMany);

// Or, you can use the `Promise` API.
deleteTicketsByEvent(deleteTicketsByEventVars).then((response) => {
  const data = response.data;
  console.log(data.ticket_deleteMany);
});
```

### Using `DeleteTicketsByEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteTicketsByEventRef, DeleteTicketsByEventVariables } from '@promptwars/dataconnect';

// The `DeleteTicketsByEvent` mutation requires an argument of type `DeleteTicketsByEventVariables`:
const deleteTicketsByEventVars: DeleteTicketsByEventVariables = {
  eventId: ..., 
};

// Call the `deleteTicketsByEventRef()` function to get a reference to the mutation.
const ref = deleteTicketsByEventRef(deleteTicketsByEventVars);
// Variables can be defined inline as well.
const ref = deleteTicketsByEventRef({ eventId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteTicketsByEventRef(dataConnect, deleteTicketsByEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.ticket_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.ticket_deleteMany);
});
```

## DeleteEmergencyEventsByEvent
You can execute the `DeleteEmergencyEventsByEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteEmergencyEventsByEvent(vars: DeleteEmergencyEventsByEventVariables): MutationPromise<DeleteEmergencyEventsByEventData, DeleteEmergencyEventsByEventVariables>;

interface DeleteEmergencyEventsByEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteEmergencyEventsByEventVariables): MutationRef<DeleteEmergencyEventsByEventData, DeleteEmergencyEventsByEventVariables>;
}
export const deleteEmergencyEventsByEventRef: DeleteEmergencyEventsByEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteEmergencyEventsByEvent(dc: DataConnect, vars: DeleteEmergencyEventsByEventVariables): MutationPromise<DeleteEmergencyEventsByEventData, DeleteEmergencyEventsByEventVariables>;

interface DeleteEmergencyEventsByEventRef {
  ...
  (dc: DataConnect, vars: DeleteEmergencyEventsByEventVariables): MutationRef<DeleteEmergencyEventsByEventData, DeleteEmergencyEventsByEventVariables>;
}
export const deleteEmergencyEventsByEventRef: DeleteEmergencyEventsByEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteEmergencyEventsByEventRef:
```typescript
const name = deleteEmergencyEventsByEventRef.operationName;
console.log(name);
```

### Variables
The `DeleteEmergencyEventsByEvent` mutation requires an argument of type `DeleteEmergencyEventsByEventVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteEmergencyEventsByEventVariables {
  eventId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteEmergencyEventsByEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteEmergencyEventsByEventData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteEmergencyEventsByEventData {
  emergencyEvent_deleteMany: number;
}
```
### Using `DeleteEmergencyEventsByEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteEmergencyEventsByEvent, DeleteEmergencyEventsByEventVariables } from '@promptwars/dataconnect';

// The `DeleteEmergencyEventsByEvent` mutation requires an argument of type `DeleteEmergencyEventsByEventVariables`:
const deleteEmergencyEventsByEventVars: DeleteEmergencyEventsByEventVariables = {
  eventId: ..., 
};

// Call the `deleteEmergencyEventsByEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteEmergencyEventsByEvent(deleteEmergencyEventsByEventVars);
// Variables can be defined inline as well.
const { data } = await deleteEmergencyEventsByEvent({ eventId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteEmergencyEventsByEvent(dataConnect, deleteEmergencyEventsByEventVars);

console.log(data.emergencyEvent_deleteMany);

// Or, you can use the `Promise` API.
deleteEmergencyEventsByEvent(deleteEmergencyEventsByEventVars).then((response) => {
  const data = response.data;
  console.log(data.emergencyEvent_deleteMany);
});
```

### Using `DeleteEmergencyEventsByEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteEmergencyEventsByEventRef, DeleteEmergencyEventsByEventVariables } from '@promptwars/dataconnect';

// The `DeleteEmergencyEventsByEvent` mutation requires an argument of type `DeleteEmergencyEventsByEventVariables`:
const deleteEmergencyEventsByEventVars: DeleteEmergencyEventsByEventVariables = {
  eventId: ..., 
};

// Call the `deleteEmergencyEventsByEventRef()` function to get a reference to the mutation.
const ref = deleteEmergencyEventsByEventRef(deleteEmergencyEventsByEventVars);
// Variables can be defined inline as well.
const ref = deleteEmergencyEventsByEventRef({ eventId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteEmergencyEventsByEventRef(dataConnect, deleteEmergencyEventsByEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.emergencyEvent_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.emergencyEvent_deleteMany);
});
```

## SetActiveEvent
You can execute the `SetActiveEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
setActiveEvent(vars: SetActiveEventVariables): MutationPromise<SetActiveEventData, SetActiveEventVariables>;

interface SetActiveEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetActiveEventVariables): MutationRef<SetActiveEventData, SetActiveEventVariables>;
}
export const setActiveEventRef: SetActiveEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setActiveEvent(dc: DataConnect, vars: SetActiveEventVariables): MutationPromise<SetActiveEventData, SetActiveEventVariables>;

interface SetActiveEventRef {
  ...
  (dc: DataConnect, vars: SetActiveEventVariables): MutationRef<SetActiveEventData, SetActiveEventVariables>;
}
export const setActiveEventRef: SetActiveEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setActiveEventRef:
```typescript
const name = setActiveEventRef.operationName;
console.log(name);
```

### Variables
The `SetActiveEvent` mutation requires an argument of type `SetActiveEventVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetActiveEventVariables {
  id: UUIDString;
  isActive: boolean;
}
```
### Return Type
Recall that executing the `SetActiveEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetActiveEventData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetActiveEventData {
  event_update?: Event_Key | null;
}
```
### Using `SetActiveEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setActiveEvent, SetActiveEventVariables } from '@promptwars/dataconnect';

// The `SetActiveEvent` mutation requires an argument of type `SetActiveEventVariables`:
const setActiveEventVars: SetActiveEventVariables = {
  id: ..., 
  isActive: ..., 
};

// Call the `setActiveEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setActiveEvent(setActiveEventVars);
// Variables can be defined inline as well.
const { data } = await setActiveEvent({ id: ..., isActive: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setActiveEvent(dataConnect, setActiveEventVars);

console.log(data.event_update);

// Or, you can use the `Promise` API.
setActiveEvent(setActiveEventVars).then((response) => {
  const data = response.data;
  console.log(data.event_update);
});
```

### Using `SetActiveEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setActiveEventRef, SetActiveEventVariables } from '@promptwars/dataconnect';

// The `SetActiveEvent` mutation requires an argument of type `SetActiveEventVariables`:
const setActiveEventVars: SetActiveEventVariables = {
  id: ..., 
  isActive: ..., 
};

// Call the `setActiveEventRef()` function to get a reference to the mutation.
const ref = setActiveEventRef(setActiveEventVars);
// Variables can be defined inline as well.
const ref = setActiveEventRef({ id: ..., isActive: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setActiveEventRef(dataConnect, setActiveEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.event_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.event_update);
});
```

## UpsertUserProfile
You can execute the `UpsertUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
upsertUserProfile(vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface UpsertUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
}
export const upsertUserProfileRef: UpsertUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertUserProfile(dc: DataConnect, vars: UpsertUserProfileVariables): MutationPromise<UpsertUserProfileData, UpsertUserProfileVariables>;

interface UpsertUserProfileRef {
  ...
  (dc: DataConnect, vars: UpsertUserProfileVariables): MutationRef<UpsertUserProfileData, UpsertUserProfileVariables>;
}
export const upsertUserProfileRef: UpsertUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertUserProfileRef:
```typescript
const name = upsertUserProfileRef.operationName;
console.log(name);
```

### Variables
The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertUserProfileVariables {
  uid: string;
  name: string;
  age: number;
  idCardNumber: string;
  phone: string;
  email: string;
}
```
### Return Type
Recall that executing the `UpsertUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertUserProfileData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertUserProfileData {
  userProfile_upsert: UserProfile_Key;
}
```
### Using `UpsertUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertUserProfile, UpsertUserProfileVariables } from '@promptwars/dataconnect';

// The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`:
const upsertUserProfileVars: UpsertUserProfileVariables = {
  uid: ..., 
  name: ..., 
  age: ..., 
  idCardNumber: ..., 
  phone: ..., 
  email: ..., 
};

// Call the `upsertUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertUserProfile(upsertUserProfileVars);
// Variables can be defined inline as well.
const { data } = await upsertUserProfile({ uid: ..., name: ..., age: ..., idCardNumber: ..., phone: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertUserProfile(dataConnect, upsertUserProfileVars);

console.log(data.userProfile_upsert);

// Or, you can use the `Promise` API.
upsertUserProfile(upsertUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.userProfile_upsert);
});
```

### Using `UpsertUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertUserProfileRef, UpsertUserProfileVariables } from '@promptwars/dataconnect';

// The `UpsertUserProfile` mutation requires an argument of type `UpsertUserProfileVariables`:
const upsertUserProfileVars: UpsertUserProfileVariables = {
  uid: ..., 
  name: ..., 
  age: ..., 
  idCardNumber: ..., 
  phone: ..., 
  email: ..., 
};

// Call the `upsertUserProfileRef()` function to get a reference to the mutation.
const ref = upsertUserProfileRef(upsertUserProfileVars);
// Variables can be defined inline as well.
const ref = upsertUserProfileRef({ uid: ..., name: ..., age: ..., idCardNumber: ..., phone: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertUserProfileRef(dataConnect, upsertUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userProfile_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userProfile_upsert);
});
```

## ClaimTicket
You can execute the `ClaimTicket` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
claimTicket(vars: ClaimTicketVariables): MutationPromise<ClaimTicketData, ClaimTicketVariables>;

interface ClaimTicketRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ClaimTicketVariables): MutationRef<ClaimTicketData, ClaimTicketVariables>;
}
export const claimTicketRef: ClaimTicketRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
claimTicket(dc: DataConnect, vars: ClaimTicketVariables): MutationPromise<ClaimTicketData, ClaimTicketVariables>;

interface ClaimTicketRef {
  ...
  (dc: DataConnect, vars: ClaimTicketVariables): MutationRef<ClaimTicketData, ClaimTicketVariables>;
}
export const claimTicketRef: ClaimTicketRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the claimTicketRef:
```typescript
const name = claimTicketRef.operationName;
console.log(name);
```

### Variables
The `ClaimTicket` mutation requires an argument of type `ClaimTicketVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ClaimTicketVariables {
  id: UUIDString;
  userId: string;
}
```
### Return Type
Recall that executing the `ClaimTicket` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ClaimTicketData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ClaimTicketData {
  ticket_update?: Ticket_Key | null;
}
```
### Using `ClaimTicket`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, claimTicket, ClaimTicketVariables } from '@promptwars/dataconnect';

// The `ClaimTicket` mutation requires an argument of type `ClaimTicketVariables`:
const claimTicketVars: ClaimTicketVariables = {
  id: ..., 
  userId: ..., 
};

// Call the `claimTicket()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await claimTicket(claimTicketVars);
// Variables can be defined inline as well.
const { data } = await claimTicket({ id: ..., userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await claimTicket(dataConnect, claimTicketVars);

console.log(data.ticket_update);

// Or, you can use the `Promise` API.
claimTicket(claimTicketVars).then((response) => {
  const data = response.data;
  console.log(data.ticket_update);
});
```

### Using `ClaimTicket`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, claimTicketRef, ClaimTicketVariables } from '@promptwars/dataconnect';

// The `ClaimTicket` mutation requires an argument of type `ClaimTicketVariables`:
const claimTicketVars: ClaimTicketVariables = {
  id: ..., 
  userId: ..., 
};

// Call the `claimTicketRef()` function to get a reference to the mutation.
const ref = claimTicketRef(claimTicketVars);
// Variables can be defined inline as well.
const ref = claimTicketRef({ id: ..., userId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = claimTicketRef(dataConnect, claimTicketVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.ticket_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.ticket_update);
});
```

