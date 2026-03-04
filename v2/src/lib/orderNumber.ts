import { query } from './db';

export async function generateOrderNumber(): Promise<string> {
  const result = await query(
    "SELECT nextval('order_sequence') as seq"
  );
  const seq = result.rows[0].seq;
  return `ORD-${String(seq).padStart(6, '0')}`;
}
