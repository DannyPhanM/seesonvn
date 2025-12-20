// recently-viewed.js
// Handles storing and retrieving recently viewed product IDs in a cookie

const RECENTLY_VIEWED_KEY = 'recently_viewed_products';
const RECENTLY_VIEWED_MAX = 4;

function getRecentlyViewedProducts() {
  const cookie = document.cookie.split('; ').find(row => row.startsWith(RECENTLY_VIEWED_KEY + '='));
  if (!cookie) return [];
  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1])) || [];
  } catch {
    return [];
  }
}

function setRecentlyViewedProducts(handles) {
  document.cookie = `${RECENTLY_VIEWED_KEY}=${encodeURIComponent(JSON.stringify(handles.slice(0, RECENTLY_VIEWED_MAX)))}; path=/; max-age=${60*60*24*30}`;
}

function addRecentlyViewedProduct(productHandle) {
  let handles = getRecentlyViewedProducts();
  handles = handles.filter(h => h !== productHandle);
  handles.unshift(productHandle);
  setRecentlyViewedProducts(handles);
}

// Usage: Call addRecentlyViewedProduct(productHandle) on product page view
window.addRecentlyViewedProduct = addRecentlyViewedProduct;
window.getRecentlyViewedProducts = getRecentlyViewedProducts;

// Debug: Log recently viewed product handles on every page load
console.log('[RecentlyViewed] Product handles in cookie:', getRecentlyViewedProducts());
