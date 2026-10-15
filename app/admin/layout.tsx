import type { Metadata } from 'next';
import { BUSINESS } from '@/lib/site';

export const metadata: Metadata = {
  title: `Panel · ${BUSINESS.name}`,
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
