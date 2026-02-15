import Link from 'next/link';
import MarketTicker from './MarketTicker';  // ← NUEVO

export default function Header() {
  return (
    <>
      {/* ← NUEVO: Barra de mercados */}
      <MarketTicker />
      
      <header className="border-b-4 border-black bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 md:py-4">
          {/* Live indicator */}
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                Live Feed
              </span>
            </div>
            <span className="text-xs text-gray-500 hidden sm:inline">• HACE 17 MIN</span>
            <div className="ml-auto text-xs text-gray-600 font-medium uppercase tracking-wider">
              Alpha 1.0
            </div>
          </div>

          {/* Logo */}
          <div className="text-center mb-2 md:mb-3">
            <Link href="/">
              <h1 className="font-serif text-4xl md:text-6xl font-black tracking-tight">
                EL <span className="text-blue-600">DIÁFANO</span>
              </h1>
              <p className="text-xs md:text-sm italic text-gray-600 mt-1">
                Crónica de Consensos
              </p>
            </Link>
          </div>

          {/* Fecha y ubicación */}
          <div className="text-center border-t border-black pt-2">
            <p className="text-xs uppercase tracking-widest text-gray-700 font-semibold">
              Valparaíso, Chile • {new Date().toLocaleDateString('es-CL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }).toUpperCase()}
            </p>
          </div>
        </div>
      </header>
    </>
  );
}