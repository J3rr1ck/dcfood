import { Platform } from 'react-native';

// API Keys - In a real app, these would be stored securely in environment variables
// For this demo, we're including them directly (these are placeholder values)
const GOOGLE_MAPS_API_KEY = 'AIzaSyBA5Aj5LZVF_w7DP7BxEhjbooe0UHRf49c';

// Types
export interface Restaurant {
  id: string;
  name: string;
  distance: number;
  waitTime: number;
  volume: string;
  volumeScore: number;
  cuisine: string;
  address: string;
  pentagon: boolean;
  placeId?: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

export interface VolumeHistory {
  time: string;
  score: number;
}

export interface NearbyLocation {
  name: string;
  distance: number;
  type: 'government' | 'shopping' | 'transit' | 'airport';
  latitude: number;
  longitude: number;
}

export interface KeyLocation {
  name: string;
  lat: number;
  lng: number;
  type: string;
}

// Key DC locations
export const KEY_LOCATIONS: KeyLocation[] = [
  { name: 'Pentagon', lat: 38.8719, lng: -77.0563, type: 'government' },
  { name: 'Capitol', lat: 38.8899, lng: -77.0091, type: 'government' },
  { name: 'White House', lat: 38.8977, lng: -77.0365, type: 'government' },
  { name: 'Reagan National Airport', lat: 38.8512, lng: -77.0402, type: 'airport' },
  { name: 'Union Station', lat: 38.8977, lng: -77.0074, type: 'transit' },
  { name: 'Pentagon City Mall', lat: 38.8629, lng: -77.0595, type: 'shopping' }
];

// Calculate distance between two coordinates in miles
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

// Check if a location is near the Pentagon (within 1 mile)
export function isNearPentagon(lat: number, lng: number): boolean {
  const pentagonLocation = KEY_LOCATIONS.find(loc => loc.name === 'Pentagon');
  if (!pentagonLocation) return false;
  
  const distance = calculateDistance(lat, lng, pentagonLocation.lat, pentagonLocation.lng);
  return distance <= 1.0;
}

// Fetch restaurants from Google Places API
export async function fetchNearbyRestaurants(
  latitude: number, 
  longitude: number, 
  radius: number = 5000
): Promise<Restaurant[]> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || ''}`);
    }

    if (!data.results) {
      if (data.status === 'ZERO_RESULTS') {
        return []; // No error if API returns zero results
      }
      throw new Error("No restaurants found by API.");
    }

    return data.results.map((place: any) => {
      const placeLat = place.geometry.location.lat;
      const placeLng = place.geometry.location.lng;
      const distance = calculateDistance(latitude, longitude, placeLat, placeLng);
      const volumeScore = place.user_ratings_total ? Math.min(place.user_ratings_total, 100) : 50;
      const waitTime = estimateWaitTime(volumeScore, distance);
      const volume = volumeScore > 70 ? 'High' : volumeScore > 40 ? 'Medium' : 'Low';
      const photoUrl = place.photos && place.photos.length > 0
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        : undefined;
      return {
        id: place.place_id,
        name: place.name,
        latitude: placeLat,
        longitude: placeLng,
        distance,
        waitTime,
        volume,
        volumeScore,
        cuisine: place.types && place.types.length > 0 ? place.types[0] : 'restaurant',
        address: place.vicinity,
        pentagon: isNearPentagon(placeLat, placeLng),
        placeId: place.place_id,
        photoUrl,
      } as Restaurant;
    });
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error in fetchNearbyRestaurants:', error);
      throw new Error('Network error: Failed to fetch restaurant data. Please check your internet connection.');
    }
    // Log other errors, but re-throw them so they can be handled by the caller
    console.error('Error fetching nearby restaurants:', error);
    // If it's one of our custom errors (e.g., API status error), it's already an Error instance.
    // Otherwise, wrap it or re-throw.
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching restaurants.');
  }
}

// Fetch volume history for a restaurant
export async function fetchRestaurantVolumeHistory(restaurantId: string): Promise<VolumeHistory[]> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate realistic volume history data
    // This would normally come from historical data or predictions
    const currentHour = new Date().getHours();
    
    const volumeHistory: VolumeHistory[] = [];
    for (let i = 8; i <= 21; i++) { // 8 AM to 9 PM
      let baseScore: number;
      
      // Lunch rush (11 AM - 1 PM)
      if (i >= 11 && i <= 13) {
        baseScore = 75 + Math.floor(Math.random() * 20);
      } 
      // Dinner rush (5 PM - 7 PM)
      else if (i >= 17 && i <= 19) {
        baseScore = 80 + Math.floor(Math.random() * 15);
      }
      // Normal hours
      else {
        baseScore = 30 + Math.floor(Math.random() * 30);
      }
      
      // Add some randomness
      let score = baseScore + Math.floor(Math.random() * 10) - 5;
      score = Math.max(10, Math.min(95, score)); // Clamp between 10 and 95
      
      // Format time
      const amPm = i < 12 ? 'AM' : 'PM';
      const hour = i <= 12 ? i : i - 12;
      const time = `${hour}:00 ${amPm}`;
      
      volumeHistory.push({ time, score });
    }
    
    return volumeHistory;
  } catch (error) {
    console.error('Error fetching restaurant volume history:', error);
    return [];
  }
}

// Fetch nearby locations for a restaurant
export async function fetchNearbyLocations(
  latitude: number, 
  longitude: number, 
  radius: number = 2000
): Promise<NearbyLocation[]> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Calculate distances to key locations
    const nearbyLocations: NearbyLocation[] = KEY_LOCATIONS.map(location => {
      const distance = calculateDistance(latitude, longitude, location.lat, location.lng);
      
      // Determine location type
      let locationType: 'government' | 'shopping' | 'transit' | 'airport';
      if (location.type === 'airport') {
        locationType = 'airport';
      } else if (location.type === 'shopping') {
        locationType = 'shopping';
      } else if (location.type === 'transit') {
        locationType = 'transit';
      } else {
        locationType = 'government';
      }
      
      return {
        name: location.name,
        distance,
        type: locationType,
        latitude: location.lat,
        longitude: location.lng
      };
    })
    .filter(location => location.distance <= radius / 1000) // Convert meters to km
    .sort((a, b) => a.distance - b.distance);
    
    return nearbyLocations;
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    return [];
  }
}

// Geocode an address string into latitude/longitude, fallback to current location
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
  try {
    const encoded = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Geocoding API error: ${data.status} - ${data.error_message || ''}`);
    }

    if (data.results.length === 0) {
      throw new Error('No geocoding results found for the address.');
    }

    // Assuming the first result is the most relevant one
    const loc = data.results[0].geometry.location;
    return { latitude: loc.lat, longitude: loc.lng };

  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error in geocodeAddress:', error);
      throw new Error('Network error: Failed to geocode address. Please check your internet connection.');
    }
    // Log other errors, but re-throw them to be handled by HomeScreen
    console.error('Error geocoding address:', error);
    // If it's one of our custom errors (e.g., API status error), it's already an Error instance.
    // Otherwise, wrap it or re-throw.
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during geocoding.');
  }
}

// Estimate wait time based on volume, distance, and time of day
export function estimateWaitTime(volumeScore: number, distance: number): number {
  // Base wait time increases with volume
  let baseWaitTime = 5 + (volumeScore / 10);
  
  // Add time based on distance (further = longer wait)
  const distanceFactor = Math.min(distance * 2, 10); // Cap at 10 minutes
  
  // Total estimated wait time
  const waitTime = Math.round(baseWaitTime + distanceFactor);
  
  return waitTime;
}

// Get user's current location
export async function getCurrentLocation(): Promise<{ latitude: number, longitude: number }> {
  // Default to Pentagon coordinates if geolocation fails or is unavailable
  const defaultLocation = { latitude: 38.8719, longitude: -77.0563 };

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      resolve(defaultLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting current location:', error.message);
        resolve(defaultLocation);
      }
    );
  });
}

// Generate a static map URL for a location
export function getStaticMapUrl(
  latitude: number,
  longitude: number,
  zoom: number = 14,
  width: number = 400,
  height: number = 200
): string {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&key=${GOOGLE_MAPS_API_KEY}`;
}