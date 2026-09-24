#!/bin/bash
cd /Users/ivanpenzakov/Documents/Flirter

# Initialize Expo app if not already done
if [ ! -f "package.json" ]; then
    echo "Initializing Expo app..."
    npx create-expo-app@latest temp-app
    shopt -s dotglob
    mv temp-app/* .
    rm -rf temp-app
fi

echo "Installing dependencies..."
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens @expo/vector-icons
npm install zustand nativewind
npm install --save-dev tailwindcss@3.3.2
npx tailwindcss init

echo "Done."
