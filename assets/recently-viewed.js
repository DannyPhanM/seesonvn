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

// Hiển thị hoặc ẩn thông báo trống trong header search
document.addEventListener('DOMContentLoaded', function() {
  var emptyText = document.getElementById('predictive-search-recently-viewed-empty');
  var list = document.getElementById('predictive-search-recently-viewed-list');
  function updateRecentlyViewedEmptyText() {
    if (!emptyText || !list) return;
    if (list.children.length === 0) {
      emptyText.style.display = 'flex';
    } else {
      emptyText.style.display = 'none';
    }
  }
  window.updateRecentlyViewedEmptyText = updateRecentlyViewedEmptyText;
  // Nếu predictive_search bị tắt (search-form), tự động render sản phẩm đã xem gần đây
  var group = document.getElementById('predictive-search-recently-viewed-group');
  if (group && list && !window.customElements.get('predictive-search')) {
    const handles = window.getRecentlyViewedProducts ? window.getRecentlyViewedProducts() : [];
    if (!handles.length) {
      group.style.display = '';
      list.innerHTML = '';
      updateRecentlyViewedEmptyText();
      return;
    }
    group.style.display = '';
    list.innerHTML = '';
    Promise.all(handles.map(handle => fetch(`/products/${handle}.js`).then(r => r.json()).catch(() => null)))
      .then(products => {
        products = products.filter(Boolean);
        if (!products.length) {
          updateRecentlyViewedEmptyText();
          return;
        }
        products.forEach((product, idx) => {
          const li = document.createElement('li');
          li.className = 'predictive-search__list-item';
          li.setAttribute('role', 'option');
          li.setAttribute('aria-selected', 'false');
          li.id = `predictive-search-option-recently-${idx+1}`;
          let imgHtml = '';
          if (product.featured_media && product.featured_media.preview_image) {
            const aspect = product.featured_media.preview_image.aspect_ratio || 1;
            imgHtml = `<img class="predictive-search__image" src="${product.featured_media.preview_image.src}&width=150" alt="${product.featured_media.alt || product.title}" width="50" height="${50 / aspect}">`;
          } else if (product.featured_image) {
            imgHtml = `<img class="predictive-search__image" src="${product.featured_image}" alt="${product.title}" width="120" height="auto">`;
          }
          let priceHtml = '';
          if (product.price) {
            priceHtml = `<div class="predictive-search__item-price">${(product.price/100).toLocaleString('vi-VN', {style:'currency',currency:'VND'})}</div>`;
          }
          li.innerHTML = `
            <a href="${product.url || '/products/' + product.handle}" class="predictive-search__item predictive-search__item--link-with-thumbnail link link--text" tabindex="-1">
              ${imgHtml}
              <div class="predictive-search__item-content">
                <p class="predictive-search__item-heading h5">${product.title}</p>
                ${priceHtml}
              </div>
            </a>
          `;
          list.appendChild(li);
        });
        updateRecentlyViewedEmptyText();
      });
  } else {
    // Gọi khi trang load để ẩn/hiện text nếu predictive-search đã render
    updateRecentlyViewedEmptyText();
  }
});
