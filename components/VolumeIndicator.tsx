import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VolumeIndicatorProps {
  volumeScore: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const VolumeIndicator: React.FC<VolumeIndicatorProps> = ({
  volumeScore,
  showLabel = true,
  size = 'medium'
}) => {
  // Get color based on volume score
  const getVolumeColor = (score: number) => {
    if (score > 70) return '#F44336'; // Red for high volume
    if (score > 40) return '#FF9800'; // Orange for medium volume
    return '#4CAF50'; // Green for low volume
  };
  
  // Get volume label
  const getVolumeLabel = (score: number) => {
    if (score > 70) return 'High Volume';
    if (score > 40) return 'Medium Volume';
    return 'Low Volume';
  };
  
  // Determine height based on size
  const getBarHeight = () => {
    switch (size) {
      case 'small': return 4;
      case 'large': return 12;
      default: return 8;
    }
  };
  
  // Determine font size based on size
  const getFontSize = () => {
    switch (size) {
      case 'small': return 10;
      case 'large': return 14;
      default: return 12;
    }
  };
  
  const color = getVolumeColor(volumeScore);
  const label = getVolumeLabel(volumeScore);
  const barHeight = getBarHeight();
  const fontSize = getFontSize();
  
  return (
    <View style={styles.container}>
      <View style={[styles.barContainer, { height: barHeight }]}>
        <View 
          style={[
            styles.barFill, 
            { 
              width: `${volumeScore}%`, 
              backgroundColor: color,
              height: barHeight
            }
          ]} 
        />
      </View>
      
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.scoreText, { fontSize, color }]}>
            {volumeScore}%
          </Text>
          <Text style={[styles.labelText, { fontSize }]}>
            {label}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scoreText: {
    fontWeight: 'bold',
  },
  labelText: {
    color: '#666',
  },
});

export default VolumeIndicator;