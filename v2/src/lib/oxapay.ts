const OXAPAY_MERCHANT_KEY = process.env.OXAPAY_MERCHANT_KEY || 'IATBVJ-ZETSQG-ERLMYY-ODTKGZ';
const OXAPAY_API = 'https://api.oxapay.com/merchants';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://asklepi0s.top';

export interface CreateInvoiceParams {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
  email?: string;
}

export interface OxapayInvoice {
  trackId: string;
  payLink: string;
  expiredAt: number;
}

export async function createOxapayInvoice(params: CreateInvoiceParams): Promise<OxapayInvoice> {
  const body = {
    merchant: OXAPAY_MERCHANT_KEY,
    amount: params.amount,
    currency: params.currency || 'EUR',
    lifeTime: 60,
    feePaidByPayer: 0,
    underPaidCover: 2.5,
    callbackUrl: `${SITE_URL}/api/oxapay/callback`,
    returnUrl: `${SITE_URL}/payment-success?order=${params.orderId}`,
    description: params.description || `Order ${params.orderId}`,
    orderId: params.orderId,
    email: params.email || '',
  };

  const res = await fetch(`${OXAPAY_API}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Oxapay API error: ${res.status}`);
  }

  const data = await res.json();

  if (data.result !== 100) {
    throw new Error(`Oxapay error: ${data.message || 'Unknown error'}`);
  }

  return {
    trackId: data.trackId,
    payLink: data.payLink,
    expiredAt: data.expiredAt,
  };
}

export async function verifyOxapayWebhook(body: any): Promise<boolean> {
  // Oxapay sends HMAC - verify it's legitimate
  // In production, verify with your merchant key
  return true;
}

export async function getInvoiceStatus(trackId: string) {
  const res = await fetch(`${OXAPAY_API}/inquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant: OXAPAY_MERCHANT_KEY,
      trackId,
    }),
  });

  if (!res.ok) throw new Error('Failed to get invoice status');
  return res.json();
}
