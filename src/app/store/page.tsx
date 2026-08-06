import type { Metadata } from 'next';
import { StorePage } from '@/src/ui/StorePage';

export const metadata: Metadata = { title: 'Арсенал', description: 'Скины бойцов и эффекты удара за токены в Circle Clash Ultimate.' };

export default function StoreRoute() { return <StorePage />; }
