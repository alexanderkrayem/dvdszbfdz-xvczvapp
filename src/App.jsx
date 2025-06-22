// src/App.jsx
import React, { useEffect, useState } from 'react';
import MainPanel from './components/MainPanel'; // Import your MainPanel component

function App() {
  const [telegramUser, setTelegramUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      // --- PRODUCTION / TELEGRAM ENVIRONMENT ---
      console.log("Telegram WebApp SDK found. App is running in Telegram.");
      tg.ready();
      tg.expand(); // Optional: Make the app full screen

      if (tg.initDataUnsafe?.user) {
        console.log("Real Telegram user found:", tg.initDataUnsafe.user);
        setTelegramUser(tg.initDataUnsafe.user);
      } else {
        console.warn("User data not available within Telegram. Using a fallback user.");
        // Provide a fallback user in the rare case the user object is missing in TG
        setTelegramUser({
          id: 999999999,
          first_name: 'TG',
          last_name: 'Fallback',
          username: 'tg_fallback_user'
        });
      }
    } else {
      // --- LOCAL DEVELOPMENT ENVIRONMENT ---
      console.warn("Telegram WebApp SDK not found. Running in local browser mode.");

      // Create a mock user object for local testing
      const mockUser = {
        id: 123456789, // Use a consistent ID for predictable testing
        first_name: 'Local',
        last_name: 'Developer',
        username: 'localdev',
        language_code: 'en',
        is_premium: true,
      };

      console.log("Using mock user for local development:", mockUser);
      setTelegramUser(mockUser);
    }

    setIsLoading(false); // We have a user (real or mock), so we can stop loading

  }, []); // Empty dependency array means this runs only once

  // While loading, show a simple message to prevent rendering the app without a user
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-600 animate-pulse">Initializing Application...</p>
      </div>
    );
  }

  // Once loaded, render the MainPanel with the telegramUser prop
  return (
    <div className="App">
        <MainPanel telegramUser={telegramUser} />
    </div>
  );
}

export default App;