import React, { useState } from 'react';
import Login from './components/Login';
import ImageAnalyzer from './components/ImageAnalyzer';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <header className="w-full max-w-5xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          EvaluMe
        </h1>
        <p className="text-gray-400 mt-2">Helping you to improve your writing!</p>
      </header>
      <main className="w-full max-w-5xl mx-auto">
        {isLoggedIn ? (
          <ImageAnalyzer />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  );
}

export default App;
