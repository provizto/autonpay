import { supabase } from './settlements'; // Uses your existing Supabase client instance

// 1. Fetch live products from DB
export async function getProductsFromDB() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB] Fetch failed:', error.message);
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.id,
    sku: item.sku,
    title: item.title,
    category: item.category,
    priceSol: Number(item.price_sol),
    description: item.description,
    seller: item.seller || 'Vendor Node',
    vendorWallet: item.vendor_wallet,
    instantAccessUrl: item.instant_access_url || ''
  }));
}

// 2. Insert new product directly into DB
export async function insertProductToDB(prod) {
  const payload = {
    sku: prod.sku,
    title: prod.title,
    category: prod.category,
    price_sol: prod.priceSol,
    description: prod.description,
    seller: prod.seller,
    vendor_wallet: prod.vendorWallet,
    instant_access_url: prod.instantAccessUrl
  };

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[DB] Insert failed:', error.message);
    throw error;
  }

  return {
    id: data.id,
    sku: data.sku,
    title: data.title,
    category: data.category,
    priceSol: Number(data.price_sol),
    description: data.description,
    seller: data.seller,
    vendorWallet: data.vendor_wallet,
    instantAccessUrl: data.instant_access_url
  };
}

// 3. Delete product directly from DB
export async function removeProductFromDB(productId) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('[DB] Delete failed:', error.message);
    throw error;
  }
}