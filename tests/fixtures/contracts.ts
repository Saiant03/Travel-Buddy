export const validProfile = {
  schemaVersion: 1,
  uid: 'u-alfa',
  revision: 2,
  locale: 'ro',
  descriptionLocale: 'en',
  categories: [
    { categoryId: 'food', complete: true, noSpecialPreferences: false },
    { categoryId: 'culture', complete: true, noSpecialPreferences: false },
    { categoryId: 'nature', complete: false, noSpecialPreferences: false },
    { categoryId: 'relaxation', complete: false, noSpecialPreferences: false },
    { categoryId: 'shopping', complete: false, noSpecialPreferences: false },
  ],
  preferences: [
    { categoryId: 'food', subcategoryId: 'cuisine', itemId: 'vegetarian', answer: 'try', note: 'Uneori' },
    { categoryId: 'food', subcategoryId: 'cuisine', itemId: 'seafood', answer: 'avoid' },
    { categoryId: 'culture', subcategoryId: 'museum', itemId: 'art', answer: 'strong_like' },
    { categoryId: 'nature', subcategoryId: 'walk', itemId: 'hiking', answer: 'no_interest' },
    { categoryId: 'nature', subcategoryId: 'walk', itemId: 'climbing', answer: 'hard_no' },
  ],
  avoidFoods: ['peanuts'],
  allergies: [],
  intolerances: [],
};

export const validTrip = {
  schemaVersion: 1,
  id: 'trip-1',
  revision: 7,
  memberUids: ['u-alfa', 'u-beta'],
  destination: { id: 'dest-lisbon', name: 'Lisbon', location: { lat: 38.7223, lng: -9.1393 } },
  dates: { start: '2027-04-10', end: '2027-04-12', days: 3 },
  transport: ['walk', 'transit'],
  bases: [{ id: 'base-old-town', place: { id: 'stay-old-town', name: 'Old Town', location: { lat: 38.72, lng: -9.14 } }, startDay: 1, endDay: 3 }],
  arrivalTime: '15:30',
  departureTime: '11:00',
  budget: { amount: 450, currency: 'EUR' },
};

export const validLicensedImage = {
  url: 'https://images.example.test/museum.jpg',
  sourceUrl: 'https://museum.example.test/photo',
  author: 'A. Example',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  attribution: 'Photo by A. Example',
  checkedAt: '2026-10-20T12:00:00Z',
  cacheAllowed: true,
};

export const validSource = {
  url: 'https://museum.example.test/',
  title: 'Official museum site',
  checkedAt: '2026-10-20T12:00:00Z',
};

export const validPlace = {
  id: 'place-lisbon-museum',
  name: 'Museu de Lisboa',
  location: { lat: 38.7223, lng: -9.1393 },
  description: 'A small city museum.',
  price: { amount: 8, currency: 'EUR' },
  opening: '10:00–18:00',
  reservation: 'https://museum.example.test/tickets',
  photo: validLicensedImage,
  sources: [validSource],
  confidence: 'verified',
  matchReasons: ['culture:art'],
};

export const validItinerary = {
  schemaVersion: 1,
  tripId: 'trip-1',
  revision: 7,
  locale: 'ro',
  days: [
    {
      dayNumber: 1,
      date: '2027-04-10',
      baseId: 'base-old-town',
      stops: [{ id: 'stop-1', place: validPlace }],
      suggestions: [{
        id: 'place-cafe',
        name: 'Café do Bairro',
        location: { lat: 38.721, lng: -9.141 },
        sources: [validSource],
        confidence: 'unconfirmed',
        matchReasons: ['food:vegetarian'],
      }],
      route: { geometry: 'encoded-route', provider: 'geoapify', confidence: 'unconfirmed' },
    },
    { dayNumber: 2, date: '2027-04-11', baseId: 'base-old-town', stops: [], suggestions: [] },
    { dayNumber: 3, date: '2027-04-12', baseId: 'base-old-town', stops: [], suggestions: [] },
  ],
};

export const validGenerationJob = {
  schemaVersion: 1,
  id: 'job-1',
  tripId: 'trip-1',
  status: 'running',
  attemptId: 'attempt-2',
  claimVersion: 2,
  leaseToken: 'lease-2',
  checkpoint: { page: 1, ids: ['a', 'b'] },
  stage: 'search',
  completed: 1,
  total: 3,
};

export const validOfflineSnapshot = {
  schemaVersion: 1,
  ownerUid: 'u-alfa',
  tripId: 'trip-1',
  revision: 7,
  locale: 'ro',
  sessionGeneration: 4,
  savedAt: '2026-10-22T09:30:00Z',
  trip: validTrip,
  payload: validItinerary,
  assets: [
    { status: 'included', assetId: 'asset-museum', placeId: 'place-lisbon-museum', image: validLicensedImage, mimeType: 'image/jpeg', byteLength: 512_000, checksum: 'a'.repeat(64) },
    { status: 'unavailable', placeId: 'place-cafe', reason: 'missing' },
  ],
  checksum: 'b'.repeat(64),
};
