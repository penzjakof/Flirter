import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [phone, setPhone] = useState('');

  const handleLogin = () => {
    if (phone.length > 5) {
      login(phone);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6">
      <View className="items-center mb-10">
        <Text className="text-pink-500 text-5xl font-extrabold italic">flirter</Text>
        <Text className="text-gray-500 mt-4 text-center">Find your match today.</Text>
      </View>
      
      <Text className="text-gray-700 font-semibold mb-2">Phone Number</Text>
      <TextInput 
        className="bg-gray-100 p-4 rounded-xl text-lg mb-6"
        placeholder="+1 234 567 8900"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity 
        className={`p-4 rounded-full items-center justify-center ${phone.length > 5 ? 'bg-pink-500' : 'bg-gray-300'}`}
        disabled={phone.length <= 5 || isLoading}
        onPress={handleLogin}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-bold">Sign In</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
