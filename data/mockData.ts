// ── User Profiles ──────────────────────────────
export interface TripUser {
  id: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  body: string;
  user: { id: string; name: string; avatar?: string };
  createdAt: string;
}

export const MOCK_USER = {
  id: "u1",
  name: "Alex Rivera",
  email: "alex@mytrips.app",
  avatar: "https://i.pravatar.cc/150?img=11",
  memberSince: "2023",
  totalTrips: 5,
  countries: 8,
  kmTraveled: 14200,
};

// ── Privacy ────────────────────────────────────
export interface PrivacySettings {
  photos: boolean;   // true = show publicly
  notes: boolean;
  expenses: boolean;
}

// ── Types ──────────────────────────────────────
export interface RouteStop {
  id: string;
  label: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  icon: string;
  aiSuggested: boolean;
  isPrivate?: boolean;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  lat: number;
  lng: number;
  date: string;
  isPrivate?: boolean;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  mood: string;
  date: string;
  color: string;
  isPrivate?: boolean;
}

export interface TripPreferences {
  purpose: string;
  accommodation: string;
  pace: string;
  foodPriority: string;
}

export const PREFERENCE_OPTIONS = {
  purpose: [
    { id: "leisure", label: "Leisure", icon: "🏖️" },
    { id: "adventure", label: "Adventure", icon: "🧗" },
    { id: "cultural", label: "Cultural", icon: "🏛️" },
    { id: "business", label: "Business", icon: "💼" },
    { id: "relaxation", label: "Relaxation", icon: "🧘" },
    { id: "romantic", label: "Romantic", icon: "💕" },
  ],
  accommodation: [
    { id: "hotel", label: "Hotel", icon: "🏨" },
    { id: "airbnb", label: "Airbnb", icon: "🏡" },
    { id: "hostel", label: "Hostel", icon: "🛏️" },
    { id: "camping", label: "Camping", icon: "⛺" },
    { id: "resort", label: "Resort", icon: "🏝️" },
    { id: "friends", label: "With Friends", icon: "👥" },
  ],
  pace: [
    { id: "relaxed", label: "Relaxed", icon: "🐢" },
    { id: "moderate", label: "Moderate", icon: "🚶" },
    { id: "packed", label: "Packed", icon: "🏃" },
  ],
  foodPriority: [
    { id: "local", label: "Local Cuisine", icon: "🍜" },
    { id: "finedining", label: "Fine Dining", icon: "🍽️" },
    { id: "budget", label: "Budget Eats", icon: "🌮" },
    { id: "mixed", label: "Mix of All", icon: "🥗" },
  ],
};

export interface Trip {
  id: string;
  name: string;
  destination: string;
  flag: string;
  status: "upcoming" | "ongoing" | "completed";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  currency: string;
  coverPhoto: string;
  description: string;
  transport: string;
  route: RouteStop[];
  expenses: Expense[];
  photos: Photo[];
  notes: Note[];
  preferences?: TripPreferences;
  // Social & Privacy
  visibility: "public" | "private";
  privacySettings: PrivacySettings;
  user?: TripUser;
  likes?: number;
  comments?: number;
  createdAt?: string;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  flag: string;
  photo: string;
  type: string;
  estimatedCost: string;
}

// ── Mock Trips (Current User) ──────────────────
export const MOCK_TRIPS: Trip[] = [
  {
    id: "t1",
    name: "Bali Adventure",
    destination: "Bali, Indonesia",
    flag: "🇮🇩",
    status: "ongoing",
    startDate: "2024-03-10",
    endDate: "2024-03-20",
    budget: 2000,
    spent: 1340,
    currency: "USD",
    coverPhoto: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
    description: "Exploring temples, rice fields and beaches.",
    transport: "flight",
    visibility: "public",
    privacySettings: { photos: true, notes: false, expenses: true },
    user: { id: "u1", name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?img=11" },
    likes: 24,
    comments: 5,
    createdAt: "2024-03-10T08:00:00Z",
    route: [
      { id: "s1", label: "A", name: "Ngurah Rai Airport", lat: -8.7482, lng: 115.1675, color: "green" },
      { id: "s2", label: "B", name: "Ubud Center", lat: -8.5069, lng: 115.2625, color: "blue" },
      { id: "s3", label: "C", name: "Kuta Beach", lat: -8.7184, lng: 115.1686, color: "blue" },
      { id: "s4", label: "D", name: "Seminyak", lat: -8.6902, lng: 115.1557, color: "coral" },
    ],
    expenses: [
      { id: "e1", description: "Dinner at Locavore", amount: 45, currency: "USD", date: "2024-03-11", category: "Food", icon: "🍕", aiSuggested: true },
      { id: "e2", description: "Taxi to Ubud", amount: 18, currency: "USD", date: "2024-03-11", category: "Transport", icon: "🚗", aiSuggested: true },
      { id: "e3", description: "Hotel Alaya Resort", amount: 220, currency: "USD", date: "2024-03-12", category: "Accommodation", icon: "🏨", aiSuggested: true },
      { id: "e4", description: "Tegallalang Rice Terrace", amount: 12, currency: "USD", date: "2024-03-13", category: "Activities", icon: "🎭", aiSuggested: false },
      { id: "e5", description: "Batik souvenirs", amount: 35, currency: "USD", date: "2024-03-14", category: "Shopping", icon: "🛍️", aiSuggested: true },
    ],
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=400", caption: "Tegallalang Rice Terraces", lat: -8.4333, lng: 115.2833, date: "2024-03-13" },
      { id: "p2", url: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400", caption: "Uluwatu Temple sunset", lat: -8.8291, lng: 115.0849, date: "2024-03-14" },
      { id: "p3", url: "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=400", caption: "Kuta Beach morning", lat: -8.7184, lng: 115.1686, date: "2024-03-15" },
    ],
    notes: [
      { id: "n1", title: "Best warung spots 🍜", body: "Try Warung Babi Guling Ibu Oka in Ubud. Go before noon, it sells out fast!", mood: "😍", date: "2024-03-12", color: "#FFF3E0" },
      { id: "n2", title: "Scooter rental tips", body: "Rent from Avis near Kuta for $5/day. Always wear helmet. Police checkpoints on main roads.", mood: "😊", date: "2024-03-13", color: "#E8F5E9", isPrivate: true },
    ],
  },
  {
    id: "t2",
    name: "Tokyo Escape",
    destination: "Tokyo, Japan",
    flag: "🇯🇵",
    status: "upcoming",
    startDate: "2024-05-01",
    endDate: "2024-05-10",
    budget: 3500,
    spent: 0,
    currency: "USD",
    coverPhoto: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    description: "Cherry blossoms, ramen, and neon streets.",
    transport: "flight",
    visibility: "public",
    privacySettings: { photos: true, notes: true, expenses: false },
    user: { id: "u1", name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?img=11" },
    likes: 12,
    comments: 2,
    createdAt: "2024-04-15T10:00:00Z",
    route: [
      { id: "s1", label: "A", name: "Narita Airport", lat: 35.772, lng: 140.3929, color: "green" },
      { id: "s2", label: "B", name: "Shibuya", lat: 35.6598, lng: 139.7004, color: "blue" },
      { id: "s3", label: "C", name: "Shinjuku", lat: 35.6938, lng: 139.7036, color: "coral" },
    ],
    expenses: [],
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400", caption: "Shibuya crossing", lat: 35.6598, lng: 139.7004, date: "2024-05-01" },
    ],
    notes: [],
  },
  {
    id: "t3",
    name: "Paris Getaway",
    destination: "Paris, France",
    flag: "🇫🇷",
    status: "completed",
    startDate: "2023-11-10",
    endDate: "2023-11-17",
    budget: 2800,
    spent: 2650,
    currency: "EUR",
    coverPhoto: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    description: "Art, wine, and the Eiffel Tower.",
    transport: "train",
    visibility: "public",
    privacySettings: { photos: true, notes: true, expenses: true },
    user: { id: "u1", name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?img=11" },
    likes: 42,
    comments: 8,
    createdAt: "2023-11-10T06:00:00Z",
    route: [
      { id: "s1", label: "A", name: "CDG Airport", lat: 49.0097, lng: 2.5479, color: "green" },
      { id: "s2", label: "B", name: "Eiffel Tower", lat: 48.8584, lng: 2.2945, color: "blue" },
      { id: "s3", label: "C", name: "Louvre Museum", lat: 48.8606, lng: 2.3376, color: "coral" },
    ],
    expenses: [
      { id: "e1", description: "Croissant and coffee", amount: 8, currency: "EUR", date: "2023-11-11", category: "Food", icon: "🍕", aiSuggested: true },
      { id: "e2", description: "Metro day pass", amount: 16, currency: "EUR", date: "2023-11-11", category: "Transport", icon: "🚗", aiSuggested: true },
      { id: "e3", description: "Hotel Le Marais", amount: 180, currency: "EUR", date: "2023-11-12", category: "Accommodation", icon: "🏨", aiSuggested: true },
    ],
    photos: [],
    notes: [],
  },
];

// ── Public Trips from Other Users (Feed Data) ──
export const MOCK_PUBLIC_TRIPS: Trip[] = [
  {
    id: "pt1",
    name: "Northern Lights Chase",
    destination: "Tromsø, Norway",
    flag: "🇳🇴",
    status: "completed",
    startDate: "2024-02-01",
    endDate: "2024-02-07",
    budget: 3200,
    spent: 2890,
    currency: "USD",
    coverPhoto: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
    description: "Chasing auroras across the Arctic Circle.",
    transport: "flight",
    visibility: "public",
    privacySettings: { photos: true, notes: true, expenses: true },
    user: { id: "u2", name: "Mia Chen", avatar: "https://i.pravatar.cc/150?img=5" },
    likes: 156,
    comments: 23,
    createdAt: "2024-02-08T14:30:00Z",
    route: [
      { id: "s1", label: "A", name: "Oslo Airport", lat: 60.1975, lng: 11.1004, color: "green" },
      { id: "s2", label: "B", name: "Tromsø", lat: 69.6496, lng: 18.9560, color: "blue" },
      { id: "s3", label: "C", name: "Lofoten Islands", lat: 68.2340, lng: 14.5680, color: "coral" },
    ],
    expenses: [
      { id: "e1", description: "Aurora tour", amount: 180, currency: "USD", date: "2024-02-02", category: "Activities", icon: "🎭", aiSuggested: true },
      { id: "e2", description: "Whale watching", amount: 120, currency: "USD", date: "2024-02-04", category: "Activities", icon: "🎭", aiSuggested: false },
    ],
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=400", caption: "Northern Lights!", lat: 69.65, lng: 18.96, date: "2024-02-03" },
      { id: "p2", url: "https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=400", caption: "Tromsø Arctic Cathedral", lat: 69.65, lng: 18.95, date: "2024-02-02" },
    ],
    notes: [{ id: "n1", title: "Best aurora spots 🌌", body: "Head to Kvaløya island around 10pm. Less light pollution.", mood: "🤩", date: "2024-02-03", color: "#E3F2FD" }],
  },
  {
    id: "pt2",
    name: "Safari Dreams",
    destination: "Serengeti, Tanzania",
    flag: "🇹🇿",
    status: "completed",
    startDate: "2024-01-15",
    endDate: "2024-01-22",
    budget: 5000,
    spent: 4200,
    currency: "USD",
    coverPhoto: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    description: "The great migration and Big Five encounters.",
    transport: "flight",
    visibility: "public",
    privacySettings: { photos: true, notes: true, expenses: false },
    user: { id: "u3", name: "James Okafor", avatar: "https://i.pravatar.cc/150?img=12" },
    likes: 234,
    comments: 41,
    createdAt: "2024-01-23T09:00:00Z",
    route: [
      { id: "s1", label: "A", name: "Kilimanjaro Airport", lat: -3.4294, lng: 37.0744, color: "green" },
      { id: "s2", label: "B", name: "Serengeti NP", lat: -2.3328, lng: 34.8325, color: "blue" },
      { id: "s3", label: "C", name: "Ngorongoro Crater", lat: -3.2395, lng: 35.4885, color: "coral" },
    ],
    expenses: [
      { id: "e1", description: "Safari vehicle rental", amount: 1200, currency: "USD", date: "2024-01-16", category: "Transport", icon: "🚗", aiSuggested: true },
    ],
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400", caption: "Lions at sunset", lat: -2.33, lng: 34.83, date: "2024-01-17" },
      { id: "p2", url: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=400", caption: "Elephant herd", lat: -2.33, lng: 34.83, date: "2024-01-18" },
      { id: "p3", url: "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400", caption: "Serengeti sunrise", lat: -2.33, lng: 34.83, date: "2024-01-19" },
    ],
    notes: [],
  },
  {
    id: "pt3",
    name: "Santorini Sunsets",
    destination: "Santorini, Greece",
    flag: "🇬🇷",
    status: "completed",
    startDate: "2024-06-10",
    endDate: "2024-06-16",
    budget: 2500,
    spent: 2100,
    currency: "EUR",
    coverPhoto: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
    description: "Blue domes, caldera views, and greek cuisine.",
    transport: "flight",
    visibility: "public",
    privacySettings: { photos: true, notes: true, expenses: true },
    user: { id: "u4", name: "Sofia Petrov", avatar: "https://i.pravatar.cc/150?img=9" },
    likes: 312,
    comments: 56,
    createdAt: "2024-06-17T11:00:00Z",
    route: [
      { id: "s1", label: "A", name: "Santorini Airport", lat: 36.3992, lng: 25.4793, color: "green" },
      { id: "s2", label: "B", name: "Oia", lat: 36.4618, lng: 25.3753, color: "blue" },
      { id: "s3", label: "C", name: "Fira", lat: 36.4163, lng: 25.4319, color: "coral" },
    ],
    expenses: [
      { id: "e1", description: "Sunset dinner at Ammoudi", amount: 85, currency: "EUR", date: "2024-06-11", category: "Food", icon: "🍕", aiSuggested: true },
      { id: "e2", description: "Catamaran cruise", amount: 150, currency: "EUR", date: "2024-06-13", category: "Activities", icon: "🎭", aiSuggested: true },
    ],
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400", caption: "Oia sunset", lat: 36.46, lng: 25.37, date: "2024-06-12" },
      { id: "p2", url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400", caption: "Blue dome church", lat: 36.46, lng: 25.37, date: "2024-06-13" },
    ],
    notes: [{ id: "n1", title: "Best photo spots", body: "The famous blue dome is at the Three Bells of Fira church. Go at golden hour!", mood: "📸", date: "2024-06-12", color: "#E3F2FD" }],
  },
  {
    id: "pt4",
    name: "Backpacking Vietnam",
    destination: "Hanoi, Vietnam",
    flag: "🇻🇳",
    status: "ongoing",
    startDate: "2024-03-25",
    endDate: "2024-04-10",
    budget: 1500,
    spent: 620,
    currency: "USD",
    coverPhoto: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
    description: "Street food, motorbikes, and Ha Long Bay.",
    transport: "bus",
    visibility: "public",
    privacySettings: { photos: true, notes: false, expenses: true },
    user: { id: "u5", name: "Liam Park", avatar: "https://i.pravatar.cc/150?img=3" },
    likes: 89,
    comments: 14,
    createdAt: "2024-03-26T07:00:00Z",
    route: [
      { id: "s1", label: "A", name: "Hanoi", lat: 21.0278, lng: 105.8342, color: "green" },
      { id: "s2", label: "B", name: "Ha Long Bay", lat: 20.9101, lng: 107.1839, color: "blue" },
      { id: "s3", label: "C", name: "Hoi An", lat: 15.8801, lng: 108.3380, color: "blue" },
      { id: "s4", label: "D", name: "Ho Chi Minh", lat: 10.8231, lng: 106.6297, color: "coral" },
    ],
    expenses: [
      { id: "e1", description: "Pho breakfast", amount: 2, currency: "USD", date: "2024-03-26", category: "Food", icon: "🍕", aiSuggested: true },
      { id: "e2", description: "Overnight bus to Hue", amount: 12, currency: "USD", date: "2024-03-28", category: "Transport", icon: "🚗", aiSuggested: true },
    ],
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1557750255-c76072a7aee1?w=400", caption: "Ha Long Bay boat", lat: 20.91, lng: 107.18, date: "2024-03-27" },
      { id: "p2", url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400", caption: "Hanoi Old Quarter", lat: 21.03, lng: 105.85, date: "2024-03-26" },
    ],
    notes: [],
  },
  {
    id: "pt5",
    name: "Patagonia Trek",
    destination: "Torres del Paine, Chile",
    flag: "🇨🇱",
    status: "completed",
    startDate: "2024-01-05",
    endDate: "2024-01-14",
    budget: 2800,
    spent: 2300,
    currency: "USD",
    coverPhoto: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    description: "The W Trek through some of Earth's most dramatic landscapes.",
    transport: "flight",
    visibility: "public",
    privacySettings: { photos: true, notes: true, expenses: true },
    user: { id: "u6", name: "Elena Romero", avatar: "https://i.pravatar.cc/150?img=16" },
    likes: 198,
    comments: 32,
    createdAt: "2024-01-15T16:00:00Z",
    route: [
      { id: "s1", label: "A", name: "Punta Arenas", lat: -53.1638, lng: -70.9171, color: "green" },
      { id: "s2", label: "B", name: "Torres del Paine", lat: -50.9423, lng: -73.4068, color: "blue" },
      { id: "s3", label: "C", name: "Grey Glacier", lat: -51.0253, lng: -73.1811, color: "coral" },
    ],
    expenses: [
      { id: "e1", description: "Park entrance fee", amount: 35, currency: "USD", date: "2024-01-06", category: "Activities", icon: "🎭", aiSuggested: true },
      { id: "e2", description: "Refugio bed", amount: 90, currency: "USD", date: "2024-01-07", category: "Accommodation", icon: "🏨", aiSuggested: true },
    ],
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400", caption: "Torres at sunrise", lat: -50.94, lng: -73.41, date: "2024-01-08" },
      { id: "p2", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400", caption: "Grey Glacier", lat: -51.03, lng: -73.18, date: "2024-01-10" },
    ],
    notes: [{ id: "n1", title: "Packing essentials 🎒", body: "Bring layers! Weather changes every 30 minutes. Waterproof everything. Gaiters are essential.", mood: "😊", date: "2024-01-06", color: "#E8F5E9" }],
  },
];

// ── Destinations ───────────────────────────────
export const MOCK_DESTINATIONS = [
  { id: "d1", city: "Santorini", country: "Greece", flag: "🇬🇷", photo: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400", type: "Beach", estimatedCost: "$1,200" },
  { id: "d2", city: "Kyoto", country: "Japan", flag: "🇯🇵", photo: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400", type: "Cultural", estimatedCost: "$1,800" },
  { id: "d3", city: "Machu Picchu", country: "Peru", flag: "🇵🇪", photo: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400", type: "Adventure", estimatedCost: "$2,100" },
  { id: "d4", city: "New York", country: "USA", flag: "🇺🇸", photo: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400", type: "City", estimatedCost: "$2,500" },
  { id: "d5", city: "Queenstown", country: "New Zealand", flag: "🇳🇿", photo: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400", type: "Adventure", estimatedCost: "$3,000" },
  { id: "d6", city: "Amalfi Coast", country: "Italy", flag: "🇮🇹", photo: "https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=400", type: "Beach", estimatedCost: "$1,900" },
];
