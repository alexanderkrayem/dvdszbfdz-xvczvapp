// src/App.jsx
import React, { useEffect } from 'react';
import MainPanel from './components/MainPanel'; // Import the component
// We commented out App.css because Tailwind handles styles via index.css
// import './App.css'

// Access the Telegram Web App object safely
const tg = window.Telegram?.WebApp;

function App() {

  useEffect(() => {
    if (tg) {
      tg.ready(); // IMPORTANT: Tell Telegram the app is ready
      console.log("Telegram WebApp SDK loaded:", tg);
      console.log("InitData Unsafe:", tg.initDataUnsafe);

      // Example: If you want to show a username (if available)
      // You could pass this down to MainPanel as a prop later
      if (tg.initDataUnsafe?.user) {
        console.log("User:", tg.initDataUnsafe.user);
      } else {
        console.log("User data not available (maybe running outside Telegram?)");
      }

      // Example: Configure the main button (optional for now)
      // tg.MainButton.setText("View Cart");
      // tg.MainButton.show();
      // tg.MainButton.onClick(() => { /* Handle cart viewing */ });

    } else {
      console.log("Telegram WebApp SDK not found (running in browser?).");
    }

    // Cleanup function (optional but good practice)
    return () => {
      if (tg) {
          // Example: Hide main button if shown
          // tg.MainButton.offClick(/* your handler */); // Remove specific listener
          // tg.MainButton.hide();
      }
    }
  }, []); // Empty dependency array means this runs once when the component mounts

  // We will add Telegram specific hooks/logic here later
  // For now, just render the MainPanel

  return (
    <MainPanel /> // Render your MainPanel component
  );
}

export default App;