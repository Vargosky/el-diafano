import { getLaboratorioData } from './actions';
import LaboratorioClient from './LaboratorioClient';

export const dynamic = 'force-dynamic'; // Para que no cachee y veas datos frescos

export default async function LaboratorioPage() {
  const datos = await getLaboratorioData();
  
  return <LaboratorioClient datosIniciales={datos} />;
}