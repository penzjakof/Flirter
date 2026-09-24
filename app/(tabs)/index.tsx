import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDiscoveryStore } from '../../src/store/discoveryStore';
import { SwipeCard } from '../../src/components/SwipeCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DiscoveryScreen() {
  const { deck, currentIndex, isLoading, fetchDeck, swipeRight, swipeLeft } = useDiscoveryStore();

  useEffect(() => {
    fetchDeck();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading profiles...</Text>
      </View>
    );
  }

  if (currentIndex >= deck.length) {
    return (
      <View style={styles.center}>
        <Text className="text-xl font-bold">No more profiles nearby</Text>
        <Text className="text-gray-500 mt-2">Try changing your filters</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.deckContainer}>
          {/* Render up to 2 cards for a stacked effect, reverse to put current on top */}
          {deck.slice(currentIndex, currentIndex + 2).reverse().map((profile) => {
            const isTopCard = profile.id === deck[currentIndex].id;
            
            return (
              <View 
                key={profile.id} 
                style={StyleSheet.absoluteFillObject} 
                pointerEvents={isTopCard ? 'auto' : 'none'}
              >
                <SwipeCard
                  profile={profile}
                  onLike={swipeRight}
                  onPass={swipeLeft}
                />
              </View>
            );
          })}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  deckContainer: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
