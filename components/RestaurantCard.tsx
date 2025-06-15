import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import VolumeIndicator from './VolumeIndicator';
import { Restaurant } from '../services/api';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(restaurant)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        {restaurant.pentagon && (
          <View style={styles.pentagonBadge}>
            <FontAwesome5 name="pentagon" size={12} color="#fff" />
            <Text style={styles.pentagonText}>Near</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="restaurant" size={16} color="#666" />
          <Text style={styles.detailText}>{restaurant.cuisine}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.detailText}>{restaurant.distance} miles away</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.detailText}>Est. wait: {restaurant.waitTime} mins</Text>
        </View>
      </View>
      
      <VolumeIndicator volumeScore={restaurant.volumeScore} size="medium" />
      
      <Text style={styles.addressText}>{restaurant.address}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  pentagonBadge: {
    flexDirection: 'row',
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  pentagonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  addressText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

export default RestaurantCard;