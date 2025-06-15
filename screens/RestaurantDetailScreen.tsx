import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import MapView from '../components/MapView';
import VolumeIndicator from '../components/VolumeIndicator';
import VolumeHistoryChart from '../components/VolumeHistoryChart';
import { 
  Restaurant, 
  NearbyLocation,
  VolumeHistory,
  fetchRestaurantVolumeHistory,
  fetchNearbyLocations
} from '../services/api';

export default function RestaurantDetailScreen() {
  const [loading, setLoading] = useState(true);
  const [volumeHistory, setVolumeHistory] = useState<VolumeHistory[]>([]);
  const [nearbyLocations, setNearbyLocations] = useState<NearbyLocation[]>([]);
  const [activeTab, setActiveTab] = useState('volume');
  const navigation = useNavigation();
  const route = useRoute();
  const restaurant = route.params?.restaurant as Restaurant;
  
  // Load restaurant data
  useEffect(() => {
    const loadData = async () => {
      if (!restaurant) return;
      
      try {
        setLoading(true);
        
        // Fetch volume history
        const history = await fetchRestaurantVolumeHistory(restaurant.id);
        setVolumeHistory(history);
        
        // Fetch nearby locations
        const locations = await fetchNearbyLocations(
          restaurant.latitude,
          restaurant.longitude,
          2000 // 2km radius
        );
        setNearbyLocations(locations);
      } catch (error) {
        console.error('Error loading restaurant data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [restaurant]);

  const handleOrder = () => {
    toast.success('Order placed successfully!', {
      description: `Your order from ${restaurant?.name} has been placed.`,
      duration: 3000,
    });
  };

  const handleTrackOrder = () => {
    toast.info('Tracking your order', {
      description: 'Your order is being prepared. Estimated delivery: 25-35 minutes.',
      duration: 3000,
    });
  };

  if (loading || !restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading restaurant details...</Text>
      </View>
    );
  }

  // Get volume color based on score
  const getVolumeColor = (score: number) => {
    if (score > 70) return '#F44336'; // Red for high volume
    if (score > 40) return '#FF9800'; // Orange for medium volume
    return '#4CAF50'; // Green for low volume
  };
  
  // Create map markers for nearby locations
  const createMapMarkers = () => {
    const markers = [
      // Restaurant marker
      {
        lat: restaurant.latitude,
        lng: restaurant.longitude,
        label: 'R',
        color: '#0066CC'
      }
    ];
    
    // Add nearby location markers
    nearbyLocations.forEach(location => {
      let color = '#F44336'; // Default red
      
      // Set color based on location type
      if (location.type === 'shopping') {
        color = '#4CAF50'; // Green
      } else if (location.type === 'transit') {
        color = '#FF9800'; // Orange
      } else if (location.type === 'airport') {
        color = '#9C27B0'; // Purple
      }
      
      markers.push({
        lat: location.latitude,
        lng: location.longitude,
        label: location.name.charAt(0),
        color
      });
    });
    
    return markers;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        {restaurant.pentagon && (
          <View style={styles.pentagonBadge}>
            <FontAwesome5 name="pentagon" size={12} color="#fff" />
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Restaurant Image */}
        <View style={styles.imageContainer}>
          {restaurant.photoUrl ? (
            <Image 
              source={{ uri: restaurant.photoUrl }}
              style={styles.restaurantImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>{restaurant.name}</Text>
              <Text style={styles.cuisineText}>{restaurant.cuisine} Restaurant</Text>
            </View>
          )}
          
          {/* Current Volume Indicator */}
          <View style={styles.currentVolumeContainer}>
            <Text style={styles.currentVolumeTitle}>Current Volume</Text>
            <VolumeIndicator 
              volumeScore={restaurant.volumeScore}
              size="large"
            />
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#0066CC" />
            <Text style={styles.infoText}>{restaurant.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={20} color="#0066CC" />
            <Text style={styles.infoText}>Current Wait Time: {restaurant.waitTime} minutes</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="directions-car" size={20} color="#0066CC" />
            <Text style={styles.infoText}>{restaurant.distance} miles from your location</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'volume' && styles.activeTab]}
            onPress={() => setActiveTab('volume')}
          >
            <Text style={[styles.tabText, activeTab === 'volume' && styles.activeTabText]}>Volume History</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'nearby' && styles.activeTab]}
            onPress={() => setActiveTab('nearby')}
          >
            <Text style={[styles.tabText, activeTab === 'nearby' && styles.activeTabText]}>Nearby Locations</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'volume' ? (
          <View style={styles.volumeHistoryContainer}>
            <Text style={styles.sectionTitle}>Today's Volume History</Text>
            <VolumeHistoryChart data={volumeHistory} height={150} />
          </View>
        ) : (
          <View style={styles.nearbyLocationsContainer}>
            <Text style={styles.sectionTitle}>Key Locations Nearby</Text>
            {nearbyLocations.length > 0 ? (
              nearbyLocations.map((location, index) => (
                <View key={index} style={styles.locationItem}>
                  <View style={styles.locationIconContainer}>
                    {location.type === 'government' && <FontAwesome5 name="building" size={20} color="#0066CC" />}
                    {location.type === 'shopping' && <FontAwesome5 name="shopping-bag" size={20} color="#4CAF50" />}
                    {location.type === 'transit' && <FontAwesome5 name="subway" size={20} color="#FF9800" />}
                    {location.type === 'airport' && <FontAwesome5 name="plane" size={20} color="#F44336" />}
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    <Text style={styles.locationDistance}>{location.distance} miles away</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noLocationsText}>No key locations found nearby</Text>
            )}
            
            <View style={styles.mapContainer}>
              <MapView 
                latitude={restaurant.latitude}
                longitude={restaurant.longitude}
                markers={createMapMarkers()}
                height={200}
                zoom={15}
              />
            </View>
          </View>
        )}

        {/* Order Section */}
        <View style={styles.orderContainer}>
          <Text style={styles.orderTitle}>Ready to Order?</Text>
          <Text style={styles.orderSubtitle}>
            Current estimated delivery time: {restaurant.waitTime + 10}-{restaurant.waitTime + 20} minutes
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
              <Text style={styles.orderButtonText}>Place Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
              <Text style={styles.trackButtonText}>Track Order</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  pentagonBadge: {
    backgroundColor: '#FF5722',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#E9EEFF',
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#D1DBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  cuisineText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  currentVolumeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
  },
  currentVolumeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0066CC',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#0066CC',
  },
  volumeHistoryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  nearbyLocationsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  locationDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noLocationsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  mapContainer: {
    marginTop: 16,
    height: 200,
  },
  orderContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 24,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  orderSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  orderButton: {
    flex: 2,
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackButton: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  trackButtonText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: 'bold',
  },
});