const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function fetchSettlements() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('Supabase credentials missing.');
    return [];
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/settlements?select=*&order=created_at.desc&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (!res.ok) throw new Error('Failed to fetch settlements');
    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err.message);
    return [];
  }
}