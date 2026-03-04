'use client';
import { Suspense } from 'react';
import { PaymentSuccess } from '@/components/PaymentPages';
export default function Page() {
  return <Suspense fallback={null}><PaymentSuccess /></Suspense>;
}
