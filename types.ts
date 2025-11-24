
export enum TransportMode {
  TRAIN = 'Train',
  FLIGHT = 'Flight',
  BUS = 'Bus',
  CAR = 'Car',
  MIXED = 'Mixed'
}

export interface Accommodation {
  name: string;
  type: string; // Hotel, Hostel, Eco-Lodge, Apartment
  sustainabilityRating: string; // e.g., "Gold Eco-Label", "Green Key"
  features: string[]; // e.g., "Solar Power", "Zero Waste", "Locally Sourced Food"
  co2PerNightKg: number;
  totalAccommodationCo2Kg: number;
  costPerNight: string;
}

export interface TripOption {
  id: string;
  title: string;
  description: string;
  transportMode: TransportMode;
  transportCo2Kg: number; // Specific to transport
  totalCo2Kg: number; // Transport + Accommodation
  durationHours: number;
  costEstimate: string;
  sustainabilityScore: number; // 1-100
  highlights: string[];
  accommodation: Accommodation;
}

export interface UserPreferences {
  origin: string;
  destination: string;
  dates: string;
  budget: string;
  travelers: number;
  interests: string;
}

export interface TripHistoryItem {
  id: string;
  destination: string;
  dateBooked: number;
  co2Used: number;
  cost: string;
  tripTitle: string;
}

export interface SearchHistoryItem {
  id: string;
  timestamp: number;
  preferences: UserPreferences;
  results: TripOption[];
  chatHistory: ChatMessage[];
}

export interface UserProfile {
  name: string;
  totalCo2Used: number;
  co2Limit: number;
  yearlyBudgetLimit: number;
  currentSpend: number;
  history: TripHistoryItem[];
  savedTrips: TripOption[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
