import Link from 'next/link';
import MarketTicker from './MarketTicker';

export default function Header() {
  return (
    <>
      <MarketTicker />

      <header className="border-b-4 border-black bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 md:py-4">

          {/* Barra superior: Live + Alpha + Buscar */}
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                Live Feed
              </span>
            </div>
            <span className="text-xs text-gray-500 hidden sm:inline">&bull; HACE 17 MIN</span>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">
                Alpha 1.0
              </span>

              {/* Boton buscar */}
              <Link
                href="/buscar"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:text-black transition-colors border border-gray-300 hover:border-black rounded px-2.5 py-1"
                title="Buscar historias"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="hidden sm:inline">Buscar</span>
              </Link>
            </div>
          </div>

          {/* Logo */}
          <div className="text-center mb-2 md:mb-3">
            <Link href="/">
              <h1 className="font-serif text-4xl md:text-6xl font-black tracking-tight">
                EL <span className="text-blue-600">DI&Aacute;FANO</span>
              </h1>
              <p className="text-xs md:text-sm italic text-gray-600 mt-1">
                Cr&oacute;nica de Consensos
              </p>
            </Link>
          </div>

          {/* Fecha */}
          <div className="text-center border-t border-black pt-2">
            <p className="text-xs uppercase tracking-widest text-gray-700 font-semibold">
              Valpara&iacute;so, Chile &bull;{' '}
              {new Date().toLocaleDateString('es-CL', {
                weekday: 'long',
                year:    'numeric',
                month:   'long',
                day:     'numeric',
              }).toUpperCase()}
            </p>
          </div>

        </div>
      </header>
    </>
  );
}