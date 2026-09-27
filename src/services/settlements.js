import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Mengambil seluruh riwayat transaksi settlement dari Supabase
 */
export async function fetchSettlements() {
  const { data, error } = await supabase
    .from('settlements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching settlements:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Menyimpan transaksi settlement baru ke Supabase
 */
export async function insertSettlementRecord(payload) {
  const { data, error } = await supabase
    .from('settlements')
    .insert([payload])
    .select();

  if (error) {
    console.error('Error saving settlement to Supabase:', error.message);
    throw error;
  }
  return data?.[0];
}

/**
 * Verifikasi Lisensi Riil langsung ke tabel Supabase (Poin 4)
 */
export async function verifyLicenseOnDb(licenseKey) {
  const { data, error } = await supabase
    .from('settlements')
    .select('*')
    .eq('license_key', licenseKey.trim())
    .maybeSingle();

  if (error) {
    console.error('Database query error on verify:', error.message);
    return { valid: false, msg: 'Database connection error.' };
  }

  if (!data) {
    return { valid: false, msg: 'License key not found in on-chain settlement registry.' };
  }

  return {
    valid: true,
    data: {
      sku: data.sku,
      licenseKey: data.license_key,
      buyer: data.buyer_wallet,
      txSignature: data.tx_signature,
      settledAt: data.created_at,
      status: data.status || 'ACTIVE'
    }
  };
}

/**
 * Realtime Listener: Mendengarkan transaksi baru secara instan tanpa refresh browser (Poin 2)
 */
export function subscribeToLiveSettlements(onNewRecord) {
  const channel = supabase
    .channel('settlements-realtime-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'settlements' },
      (payload) => {
        if (payload?.new) {
          onNewRecord(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}