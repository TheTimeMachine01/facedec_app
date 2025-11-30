// components/AnimatedGradientBackground.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

// Create an Animated version of LinearGradient
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface AnimatedGradientBackgroundProps {
  // You can pass different color sets as props if needed,
  // or keep them internal if they are always the same.
}

export default function AnimatedGradientBackground(_props: AnimatedGradientBackgroundProps) {
  // Animated values for gradient colors
  const animatedColor1 = useRef(new Animated.Value(0)).current;
  const animatedColor2 = useRef(new Animated.Value(0)).current;

  // Define your gradient color sets
  const gradientColorSets = [
    ['#4c669f', '#3b5998', '#192f6a'], // Dark Blue to Deep Blue
    ['#6a5acd', '#8a2be2', '#4b0082'], // Medium Purple to Dark Purple
    // Add more sets if you want a longer sequence of transitions
    ['#000080', '#483d8b', '#6a5acd'], // Navy to Slate Blue to Medium Purple
    ['#1e90ff', '#4169e1', '#0000cd'], // Dodger Blue to Royal Blue to Medium Blue
  ];

  useEffect(() => {
    // Determine the total number of sets to cycle through
    const numSets = gradientColorSets.length;

    // Create a sequence of animations
    const animations = [];
    for (let i = 0; i < numSets; i++) {
      const nextIndex = (i + 1) % numSets; // Loop back to the first set
      
      animations.push(
        Animated.timing(animatedColor1, {
          toValue: i, // Use the index to drive the interpolation
          duration: 5000, // Duration for the transition to the next color set
          useNativeDriver: false,
        })
      );
    }

    Animated.loop(
      Animated.sequence(animations)
    ).start();

    // Cleanup on unmount
    return () => {
      animatedColor1.stopAnimation();
    };
  }, [gradientColorSets]); // Re-run effect if gradientColorSets change

  // Interpolate colors based on animatedValue
  // This approach allows cycling through more than two sets.
  const interpolatedColors = gradientColorSets[0].map((_, colorIndex) => {
    return animatedColor1.interpolate({
      inputRange: gradientColorSets.map((_, i) => i), // [0, 1, 2, ..., numSets-1]
      outputRange: gradientColorSets.map(set => set[colorIndex]),
    });
  });

  return (
    <AnimatedLinearGradient
      colors={interpolatedColors}
      style={StyleSheet.absoluteFillObject}
      start={[0, 0]}
      end={[1, 1]}
    />
  );
}