# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { logEmergencyEvent, createEvent, issueTicket, createVenueLayout, updateVenueLayout, deleteVenueLayout, deleteEvent, deleteTicketsByEvent, deleteEmergencyEventsByEvent, setActiveEvent } from '@promptwars/dataconnect';


// Operation LogEmergencyEvent:  For variables, look at type LogEmergencyEventVars in ../index.d.ts
const { data } = await LogEmergencyEvent(dataConnect, logEmergencyEventVars);

// Operation CreateEvent:  For variables, look at type CreateEventVars in ../index.d.ts
const { data } = await CreateEvent(dataConnect, createEventVars);

// Operation IssueTicket:  For variables, look at type IssueTicketVars in ../index.d.ts
const { data } = await IssueTicket(dataConnect, issueTicketVars);

// Operation CreateVenueLayout:  For variables, look at type CreateVenueLayoutVars in ../index.d.ts
const { data } = await CreateVenueLayout(dataConnect, createVenueLayoutVars);

// Operation UpdateVenueLayout:  For variables, look at type UpdateVenueLayoutVars in ../index.d.ts
const { data } = await UpdateVenueLayout(dataConnect, updateVenueLayoutVars);

// Operation DeleteVenueLayout:  For variables, look at type DeleteVenueLayoutVars in ../index.d.ts
const { data } = await DeleteVenueLayout(dataConnect, deleteVenueLayoutVars);

// Operation DeleteEvent:  For variables, look at type DeleteEventVars in ../index.d.ts
const { data } = await DeleteEvent(dataConnect, deleteEventVars);

// Operation DeleteTicketsByEvent:  For variables, look at type DeleteTicketsByEventVars in ../index.d.ts
const { data } = await DeleteTicketsByEvent(dataConnect, deleteTicketsByEventVars);

// Operation DeleteEmergencyEventsByEvent:  For variables, look at type DeleteEmergencyEventsByEventVars in ../index.d.ts
const { data } = await DeleteEmergencyEventsByEvent(dataConnect, deleteEmergencyEventsByEventVars);

// Operation SetActiveEvent:  For variables, look at type SetActiveEventVars in ../index.d.ts
const { data } = await SetActiveEvent(dataConnect, setActiveEventVars);


```