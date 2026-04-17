export interface EventInfo {
  id: string;
  name: string;
  date: string;
  time: string;
  location: {
    gate: string;
    section: string;
    row: string;
    seat: string;
  };
}

export interface CrowdData {
  location: string;
  density: number; // 0-100
  status: 'Low Density' | 'Normal' | 'High Density';
}

export interface User {
  firstName: string;
  lastName: string;
  avatarIcon: string;
}

export const mockData = {
  user: {
    firstName: 'Alex',
    lastName: 'R.',
    avatarIcon: 'person'
  } as User,
  
  currentEvent: {
    id: 'e_123',
    name: 'Neon Lights Festival',
    date: 'Oct 28',
    time: '8:00 PM',
    location: {
      gate: 'N',
      section: 'A4',
      row: '12',
      seat: '5'
    }
  } as EventInfo,

  crowd: {
    location: 'North Gate Crowd',
    density: 80,
    status: 'High Density'
  } as CrowdData
};
