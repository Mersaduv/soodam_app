// components/LoadingScreen.tsx
import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-red-600 text-white flex-col">
      <img
        src="/logo/logo.png"
        alt="Logo"
        className="w-2/3" 
      />
    </div>
  );
};

export default LoadingScreen;
