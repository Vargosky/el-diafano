// src/components/LiveFeedIndicator.js
'use client';

import { useState, useEffect } from 'react';

export default function LiveFeedIndicator({ lastUpdate }) {
  const [timeAgo, setTimeAgo] = useState('Calculando...');

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const updateTime = new Date(lastUpdate);
      const diffInSeconds = Math.floor((now - updateTime) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);

      if (diffInSeconds < 30) {
        setTimeAgo('Actualizado ahora');
      } else if (diffInMinutes < 1) {
        setTimeAgo('Hace menos de 1 min');
      } else if (diffInMinutes === 1) {
        setTimeAgo('Hace 1 min');
      } else if (diffInMinutes < 60) {
        setTimeAgo(`Hace ${diffInMinutes} min`);
      } else {
        const hours = Math.floor(diffInMinutes / 60);
        const remainingMinutes = diffInMinutes % 60;
        if (hours === 1) {
          setTimeAgo(remainingMinutes === 0 ? 'Hace 1h' : `Hace 1h ${remainingMinutes}min`);
        } else {
          setTimeAgo(remainingMinutes === 0 ? `Hace ${hours}h` : `Hace ${hours}h ${remainingMinutes}min`);
        }
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000); // Actualiza cada 10 segundos

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      <span>LIVE FEED</span>
      <span className="text-gray-400">•</span>
      <span className="text-gray-500 font-normal">{timeAgo}</span>
    </span>
  );
}