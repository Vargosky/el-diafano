// components/BiasLegend.jsx

export default function BiasLegend({ className = "" }) {
    const items = [
      { color: '#D32F2F', label: 'Izquierda' },
      { color: '#FFCDD2', label: 'Centro-Izquierda' },
      { color: '#F5F5F5', label: 'Centro' },
      { color: '#BBDEFB', label: 'Centro-Derecha' },
      { color: '#1565C0', label: 'Derecha' },
    ];
    
    return (
      <div className={`flex items-center gap-3 flex-wrap ${className}`}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] font-sans text-gray-600 uppercase tracking-wide">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }