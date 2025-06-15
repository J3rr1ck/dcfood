import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VolumeHistory } from '../services/api';

interface VolumeHistoryChartProps {
  data: VolumeHistory[];
  height?: number;
}

const VolumeHistoryChart: React.FC<VolumeHistoryChartProps> = ({
  data,
  height = 150
}) => {
  // Get color based on volume score
  const getVolumeColor = (score: number) => {
    if (score > 70) return '#F44336'; // Red for high volume
    if (score > 40) return '#FF9800'; // Orange for medium volume
    return '#4CAF50'; // Green for low volume
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartContainer}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.chartItem}>
            <View style={[styles.chartBarContainer, { height }]}>
              <View 
                style={[
                  styles.chartBar, 
                  { 
                    height: `${item.score}%`, 
                    backgroundColor: getVolumeColor(item.score) 
                  }
                ]} 
              />
            </View>
            <Text style={styles.chartLabel}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Low Volume</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Medium Volume</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>High Volume</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  chartItem: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 30,
  },
  chartBarContainer: {
    width: 8,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    transform: [{ rotate: '-45deg' }],
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default VolumeHistoryChart;