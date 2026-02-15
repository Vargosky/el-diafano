import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache 5 minutos

async function getForexRates() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 300 }
    });
    const data = await res.json();
    
    return {
      usdClp: data.rates.CLP,
      eurClp: data.rates.CLP * (1 / data.rates.EUR),
    };
  } catch (error) {
    console.error('Error fetching forex:', error);
    return { usdClp: 856, eurClp: 1016 };
  }
}

export async function GET() {
  try {
    const forex = await getForexRates();
    
    // Calcular cambios aproximados del dólar
    const usdChange = ((forex.usdClp - 850) / 850) * 100;
    const eurChange = ((forex.eurClp - 1020) / 1020) * 100;

    const markets = [
      {
        symbol: 'USD/CLP',
        value: Math.round(forex.usdClp).toString(),
        change: `${usdChange >= 0 ? '+' : ''}${usdChange.toFixed(2)}%`,
        up: usdChange >= 0
      },
      {
        symbol: 'EUR/CLP',
        value: Math.round(forex.eurClp).toString(),
        change: `${eurChange >= 0 ? '+' : ''}${eurChange.toFixed(2)}%`,
        up: eurChange >= 0
      },
      {
        symbol: 'IPSA',
        value: '10.898',
        change: '+1.2%',
        up: true
      },
      {
        symbol: 'S&P 500',
        value: '6.836',
        change: '+0.8%',
        up: true
      },
      {
        symbol: 'IBOVESPA',
        value: '186.464',
        change: '+0.3%',
        up: true
      },
      {
        symbol: 'MERVAL',
        value: '2816.1k',
        change: '-0.5%',
        up: false
      },
    ];

    return NextResponse.json(markets);
  } catch (error) {
    console.error('Error in markets API:', error);
    
    // Fallback completo
    return NextResponse.json([
      { symbol: 'USD/CLP', value: '856', change: '+0.5%', up: true },
      { symbol: 'EUR/CLP', value: '1016', change: '-0.2%', up: false },
      { symbol: 'IPSA', value: '10.898', change: '+1.2%', up: true },
      { symbol: 'S&P 500', value: '6.836', change: '+0.8%', up: true },
      { symbol: 'IBOVESPA', value: '186.464', change: '+0.3%', up: true },
      { symbol: 'MERVAL', value: '2816.1k', change: '-0.5%', up: false },
    ]);
  }
}