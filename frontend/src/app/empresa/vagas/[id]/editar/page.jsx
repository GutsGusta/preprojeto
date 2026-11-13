'use client';

import { useParams } from 'next/navigation';
import RotaProtegida from '@/app/_components/RotaProtegida';
import FormularioVaga from '@/app/_components/FormularioVaga';

export default function EditarVaga() {
  const { id } = useParams();
  return <RotaProtegida perfis={['RECRUTADOR']}><FormularioVaga id={id} /></RotaProtegida>;
}
