// src/App.jsx
import React, { useEffect, useState } from 'react';
import MainPanel from './components/MainPanel'; // Import your MainPanel component

// Access the Telegram Web App object safely
const tg = window.Telegram?.WebApp;

function App() {

  const [telegramUser, setTelegramUser] = useState(null);

  useEffect(() => {
    // This code runs once when the app starts
    if (tg) {
      console.log("Telegram WebApp SDK found. Calling tg.ready().");
      tg.ready(); // IMPORTANT: Tell Telegram the app is ready

      // Log initial data (useful for debugging in Telegram)
      console.log("InitData Unsafe:", tg.initDataUnsafe);
      if (tg.initDataUnsafe?.user) {
        console.log("User:", tg.initDataUnsafe.user);
        setTelegramUser(tg.initDataUnsafe.user);
      } else {
        console.log("User data not available within initDataUnsafe.");
      }
    } else {
      // This message will likely show when running in a normal browser
      console.warn("Telegram WebApp SDK (window.Telegram.WebApp) not found. App might not function fully outside Telegram.");
    }

    // Cleanup function (optional)
    return () => {
      if (tg) {
        // You might add cleanup here later if you use things like tg.MainButton.onClick
      }
    }
  }, []); // Empty dependency array means run once on mount

  // Render the MainPanel component which now handles its own data fetching
  return (
    <MainPanel telegramUser={telegramUser} />
  );

}

export default App;