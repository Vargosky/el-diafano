'use client';

export default function SentimentPieChart({ positivo, negativo, neutro }) {
  const total = positivo + negativo + neutro;
  
  if (total === 0) {
    return <div className="text-gray-500 text-sm">Sin datos</div>;
  }

  const pctPositivo = (positivo / total) * 100;
  const pctNegativo = (negativo / total) * 100;
  const pctNeutro = (neutro / total) * 100;

  // SVG Pie Chart simple
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  const positivoOffset = 0;
  const neutroOffset = (pctPositivo / 100) * circumference;
  const negativoOffset = neutroOffset + (pctNeutro / 100) * circumference;

  return (
    <div className="flex justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth="40"
          strokeDasharray={`${(pctPositivo / 100) * circumference} ${circumference}`}
          strokeDashoffset="0"
          transform="rotate(-90 100 100)"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="40"
          strokeDasharray={`${(pctNeutro / 100) * circumference} ${circumference}`}
          strokeDashoffset={-neutroOffset}
          transform="rotate(-90 100 100)"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth="40"
          strokeDasharray={`${(pctNegativo / 100) * circumference} ${circumference}`}
          strokeDashoffset={-negativoOffset}
          transform="rotate(-90 100 100)"
        />
        
        {/* Texto central */}
        <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold fill-gray-900">
          {total}
        </text>
        <text x="100" y="115" textAnchor="middle" className="text-xs fill-gray-600">
          menciones
        </text>
      </svg>
    </div>
  );
}