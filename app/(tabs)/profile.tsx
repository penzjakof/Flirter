import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 items-center pt-10">
      <View className="w-32 h-32 rounded-full bg-gray-300 mb-6 overflow-hidden">
        {user?.photos?.[0] ? (
          <Image source={{ uri: user.photos[0] }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full justify-center items-center bg-pink-100">
            <Text className="text-pink-500 text-4xl">{user?.name?.charAt(0) || 'U'}</Text>
          </View>
        )}
      </View>
      
      <Text className="text-3xl font-bold text-gray-800">{user?.name}, {user?.age}</Text>
      <Text className="text-gray-500 mt-2 text-base px-6 text-center">{user?.bio}</Text>

      <TouchableOpacity 
        className="mt-12 bg-white px-8 py-3 rounded-full shadow-sm border border-gray-200"
        onPress={logout}
      >
        <Text className="text-pink-500 font-semibold text-lg">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
