'use client';
import { Suspense } from 'react';
import { PaymentFailed } from '@/components/PaymentPages';
export default function Page() {
  return <Suspense fallback={null}><PaymentFailed /></Suspense>;
}
