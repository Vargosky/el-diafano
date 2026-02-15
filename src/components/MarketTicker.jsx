'use client';

import { useState, useEffect } from 'react';

export default function MarketTicker() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const res = await fetch('/api/markets');
        const data = await res.json();
        setMarkets(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching markets:', error);
        setLoading(false);
      }
    }

    fetchMarkets();
    
    // Actualizar cada 1 minuto
    const interval = setInterval(fetchMarkets, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="hidden lg:block bg-gray-900 text-white border-b border-gray-700">
        <div className="max-w-[1400px] mx-auto px-6 py-2">
          <div className="text-xs text-gray-500">Cargando datos de mercado...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block bg-gray-900 text-white border-b border-gray-700">
      <div className="max-w-[1400px] mx-auto px-6 py-2">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {markets.map((market, i) => (
            <div key={i} className="flex items-center gap-2 whitespace-nowrap text-xs">
              <span className="font-semibold text-gray-400">{market.symbol}:</span>
              <span className="font-bold">{market.value}</span>
              <span className={market.up ? 'text-green-400' : 'text-red-400'}>
                {market.up ? '↗' : '↘'} 
                {market.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}