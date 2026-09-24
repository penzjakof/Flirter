import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Profile } from '../models';
import { LinearGradient } from 'expo-linear-gradient'; // Need to install this

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeCardProps {
  profile: Profile;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
}

export const SwipeCard = ({ profile, onLike, onPass }: SwipeCardProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isSwiped = useSharedValue(false);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number; startY: number }>({
    onStart: (_, ctx) => {
      if (isSwiped.value) return;
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      if (isSwiped.value) return;
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: (event) => {
      if (isSwiped.value) return;

      if (event.translationX > SWIPE_THRESHOLD) {
        // Like
        isSwiped.value = true;
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, (isFinished) => {
          if (isFinished) runOnJS(onLike)(profile.id);
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Pass
        isSwiped.value = true;
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, (isFinished) => {
          if (isFinished) runOnJS(onPass)(profile.id);
        });
      } else {
        // Reset
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-10, 0, 10]);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <View style={styles.cardContainer}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          <Image
            source={{ uri: profile.photos[0] }}
            style={styles.image}
            contentFit="cover"
            transition={500}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{profile.name}, {profile.age}</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  bio: {
    fontSize: 16,
    color: 'white',
  },
});
