'use client';

import RotaProtegida from '@/app/_components/RotaProtegida';
import FormularioVaga from '@/app/_components/FormularioVaga';

export default function NovaVaga() {
  return <RotaProtegida perfis={['RECRUTADOR']}><FormularioVaga /></RotaProtegida>;
}
