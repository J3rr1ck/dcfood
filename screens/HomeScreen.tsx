import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import MapView from '../components/MapView';
import RestaurantCard from '../components/RestaurantCard';
import { 
  Restaurant, 
  KEY_LOCATIONS,
  fetchNearbyRestaurants,
  geocodeAddress
} from '../services/api';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('Pentagon');
  const [userLocation, setUserLocation] = useState({ latitude: 38.8719, longitude: -77.0563 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Added errorMsg state
  const navigation = useNavigation();

  // Load restaurant data
  const loadData = async () => {
    // Outer try-catch for general errors, setLoading is handled by inner finally or this catch
    try {
      setLoading(true);
      setErrorMsg(null); // Clear previous errors on new load attempt

      // Inner try-catch-finally for API calls
      try {
        // Geocode the Defense Pentagon address (fallback to current location)
        const location = await geocodeAddress('1400 Defense Pentagon, Washington, DC');
        setUserLocation(location);

        // Fetch nearby restaurants
        const restaurantData = await fetchNearbyRestaurants(
          location.latitude,
          location.longitude,
          11265 // ~7 miles radius in meters
        );

        setRestaurants(restaurantData);
        setErrorMsg(null); // Clear error message if successful
      } catch (apiError: any) {
        console.error('Error fetching data from API:', apiError);
        setErrorMsg(apiError.message || 'Failed to load restaurant data. Please try again.');
        setRestaurants([]); // Clear restaurants on API error
      } finally {
        setLoading(false); // Ensure loading is false after API attempt
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      // This catch is for errors outside the inner try-catch, e.g., if setLoading itself fails.
      // setErrorMsg is likely already set by inner catch, or could be set here for unexpected errors.
      if (!errorMsg) { // Avoid overwriting a more specific message from inner catch
        setErrorMsg('An unexpected error occurred.');
      }
      setLoading(false); // Ensure loading is false in case of outer errors
    }
  };
  
  // Initial data load
  useEffect(() => {
    loadData();
  }, []);
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter restaurants based on selection
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      if (filter === 'all') return true;
      if (filter === 'pentagon') return restaurant.pentagon;
      if (filter === 'quick') return restaurant.waitTime <= 15;
      if (filter === 'high') return restaurant.volumeScore > 70;
      return true;
    });
  }, [restaurants, filter]);

  // Sort restaurants by proximity to selected location
  const sortedRestaurants = useMemo(() => {
    return [...filteredRestaurants].sort((a, b) => {
      return a.distance - b.distance;
    });
  }, [filteredRestaurants]);

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurant });
  };
  
  // Create map markers for restaurants and key locations
  const mapMarkers = useMemo(() => {
    const markers = [];
    
    // Add key location markers
    const pentagonLocation = KEY_LOCATIONS.find(loc => loc.name === 'Pentagon');
    if (pentagonLocation) {
      markers.push({
        lat: pentagonLocation.lat,
        lng: pentagonLocation.lng,
        label: 'P',
        color: '#FF5722'
      });
    }
    
    // Add restaurant markers (limit to 5 for performance)
    sortedRestaurants.slice(0, 5).forEach(restaurant => {
      // Determine color based on volume
      let color = '#4CAF50'; // Green for low volume
      if (restaurant.volumeScore > 70) color = '#F44336'; // Red for high volume
      else if (restaurant.volumeScore > 40) color = '#FF9800'; // Orange for medium volume
      
      markers.push({
        lat: restaurant.latitude,
        lng: restaurant.longitude,
        label: restaurant.waitTime.toString(),
        color
      });
    });
    
    return markers;
  }, [sortedRestaurants]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading DC area restaurant data...</Text>
      </View>
    );
  }

  // Display error message if present
  if (errorMsg) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DC Food Delivery Tracker</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#D32F2F" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DC Food Delivery Tracker</Text>
        <View style={styles.locationSelector}>
          <MaterialIcons name="location-on" size={20} color="#0066CC" />
          <Text style={styles.locationText}>Near: {selectedLocation}</Text>
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView 
          latitude={userLocation.latitude}
          longitude={userLocation.longitude}
          markers={mapMarkers}
          height={200}
        />
      </View>

      {/* Filter Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All Restaurants</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'pentagon' && styles.filterButtonActive]}
          onPress={() => setFilter('pentagon')}
        >
          <Text style={[styles.filterText, filter === 'pentagon' && styles.filterTextActive]}>Near Pentagon</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'quick' && styles.filterButtonActive]}
          onPress={() => setFilter('quick')}
        >
          <Text style={[styles.filterText, filter === 'quick' && styles.filterTextActive]}>Quick Delivery (≤15min)</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'high' && styles.filterButtonActive]}
          onPress={() => setFilter('high')}
        >
          <Text style={[styles.filterText, filter === 'high' && styles.filterTextActive]}>High Volume</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Restaurant List */}
      <ScrollView 
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {sortedRestaurants.length > 0 ? (
          sortedRestaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onPress={handleRestaurantPress}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="restaurant" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No restaurants found</Text>
            <Text style={styles.emptySubtext}>Try changing your filters</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0066CC',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#0066CC',
    marginLeft: 4,
    fontWeight: '500',
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#E9EEFF',
    padding: 8,
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#0066CC',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});