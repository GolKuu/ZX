import type { Metadata } from 'next';
import { AangLab } from '@/src/aang/components/AangLab';

export const metadata: Metadata = {
  title: 'Аанг — интерактивный список приёмов',
  description:
    '22 анимированных приёма Аанга: четыре стихии, спецприёмы, смена стойки и состояние Аватара.',
};

export default function AangPage() {
  return <AangLab />;
}
