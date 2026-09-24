import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useChatStore } from '../../src/store/chatStore';
import { useAuthStore } from '../../src/store/authStore';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const matchId = Array.isArray(id) ? id[0] : id;
  
  const { user } = useAuthStore();
  const { matches, messages, sendMessage } = useChatStore();
  
  const [inputText, setInputText] = useState('');
  
  const match = matches.find(m => m.id === matchId);
  const chatMessages = messages[matchId] || [];

  const handleSend = () => {
    if (inputText.trim() && user) {
      sendMessage(matchId, inputText.trim(), user.id);
      setInputText('');
    }
  };

  if (!match) return null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome name="chevron-left" size={24} color="#fe3c72" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">{match.profileData?.name}</Text>
      </View>

      <FlatList
        data={chatMessages}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={{ flexDirection: 'column-reverse', padding: 16 }}
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.id;
          return (
            <View className={`mb-4 max-w-[80%] rounded-2xl p-3 ${isMe ? 'bg-pink-500 self-end rounded-br-sm' : 'bg-gray-100 self-start rounded-bl-sm'}`}>
              <Text className={`text-base ${isMe ? 'text-white' : 'text-gray-800'}`}>{item.text}</Text>
            </View>
          );
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-row p-4 border-t border-gray-100 items-center">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base mr-3"
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity 
            className="w-12 h-12 bg-pink-500 rounded-full items-center justify-center"
            onPress={handleSend}
          >
            <FontAwesome name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
