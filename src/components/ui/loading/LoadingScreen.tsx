// components/LoadingScreen.tsx
import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-red-600 text-white flex-col">
      <img
        src="/logo/logo.png"
        alt="Logo"
        className="w-32 mb-4" 
      />
      <h1 className="text-2xl font-bold text-center text-white">
        با سودم همیشه تو سود باش
      </h1>
    </div>
  );
};

export default LoadingScreen;
