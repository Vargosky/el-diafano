// app/test-bias/page.js

import BiasBar from '@/components/BiasBar';

export default function TestBiasPage() {
  return (
    <div className="p-8 space-y-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Test BiasBar</h1>
      
      {/* Caso 1: Balanceado */}
      <div>
        <h2 className="text-lg mb-2">Cobertura balanceada</h2>
        <BiasBar 
          izquierda={2}
          centro_izq={2}
          centro={3}
          centro_der={2}
          derecha={2}
        />
      </div>
      
      {/* Caso 2: Sesgo derecha */}
      <div>
        <h2 className="text-lg mb-2">Sesgo derecha</h2>
        <BiasBar 
          izquierda={1}
          centro_izq={1}
          centro={1}
          centro_der={3}
          derecha={5}
        />
      </div>
      
      {/* Caso 3: Solo izquierda */}
      <div>
        <h2 className="text-lg mb-2">Solo izquierda</h2>
        <BiasBar 
          izquierda={5}
          centro_izq={0}
          centro={0}
          centro_der={0}
          derecha={0}
        />
      </div>
      
      {/* Caso 4: Sin cobertura */}
      <div>
        <h2 className="text-lg mb-2">Sin cobertura</h2>
        <BiasBar 
          izquierda={0}
          centro_izq={0}
          centro={0}
          centro_der={0}
          derecha={0}
        />
      </div>
      
      {/* Caso 5: Con tus medios actuales */}
      <div>
        <h2 className="text-lg mb-2">Medios actuales (4 total)</h2>
        <BiasBar 
          izquierda={1}
          centro_izq={0}
          centro={2}
          centro_der={0}
          derecha={1}
        />
      </div>
    </div>
  );
}