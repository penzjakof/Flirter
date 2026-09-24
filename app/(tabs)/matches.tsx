import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useChatStore } from '../../src/store/chatStore';

export default function MatchesScreen() {
  const router = useRouter();
  const { matches, isLoading, fetchMatches } = useChatStore();

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-pink-500">Messages</Text>
      </View>
      
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Text>Loading matches...</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-50"
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <Image 
                source={{ uri: item.profileData?.photos[0] }} 
                className="w-14 h-14 rounded-full bg-gray-200"
              />
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold">{item.profileData?.name}</Text>
                <Text className="text-gray-500 mt-1" numberOfLines={1}>
                  {item.lastMessage?.text || 'Start a conversation'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="p-8 items-center">
              <Text className="text-gray-400">No matches yet. Keep swiping!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
