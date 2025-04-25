import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  disabled?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  color = '#FFD700',
  disabled = false,
  onRatingChange
}: StarRatingProps) {
  const handlePress = (selectedRating: number) => {
    if (!disabled && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <View style={styles.container}>
      {[...Array(maxRating)].map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(starNumber)}
            disabled={disabled}
            style={styles.starContainer}
          >
            <FontAwesome
              name={isFilled ? 'star' : 'star-o'}
              size={size}
              color={isFilled ? color : '#CCCCCC'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    padding: 2,
  },
}); 