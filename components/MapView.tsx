import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { getStaticMapUrl } from '../services/api';

interface MapViewProps {
  latitude: number;
  longitude: number;
  markers?: Array<{
    lat: number;
    lng: number;
    label: string;
    color?: string;
  }>;
  zoom?: number;
  height?: number;
}

const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  markers = [],
  zoom = 14,
  height = 200
}) => {
  const { width } = Dimensions.get('window');
  
  // Get map image URL
  const mapUrl = getStaticMapUrl(latitude, longitude, zoom, width, height);
  
  return (
    <View style={[styles.container, { height }]}>
      <Image 
        source={{ uri: mapUrl }}
        style={styles.mapImage}
        resizeMode="cover"
      />
      
      {/* Render markers on top of the map */}
      {markers.map((marker, index) => {
        // Calculate position based on relative coordinates
        // This is a simplified approach - in a real app with actual maps,
        // we would use the map's projection to calculate pixel coordinates
        const latDiff = marker.lat - latitude;
        const lngDiff = marker.lng - longitude;
        
        // Simple linear mapping - this is just for demonstration
        // In a real app, we would use proper geo-projection
        const top = 50 + (latDiff * -1000);
        const left = 50 + (lngDiff * 1000);
        
        return (
          <View 
            key={index}
            style={[
              styles.marker,
              { 
                top: `${top}%`, 
                left: `${left}%`,
                backgroundColor: marker.color || '#F44336'
              }
            ]}
          >
            <Text style={styles.markerText}>{marker.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default MapView;