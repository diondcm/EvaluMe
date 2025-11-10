import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-t-transparent border-blue-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-300">Analyzing image, please wait...</p>
    </div>
  );
};

export default Spinner;
