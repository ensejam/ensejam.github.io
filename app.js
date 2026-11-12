let products = []; 
let services = [];
let cartCount = 0;
let currentCategory = 'all';
let searchQuery = '';

const productGrid = document.getElementById('productGrid');
const servicesContainer = document.getElementById('servicesContainer');

// لود کردن داده‌ها
async function fetchData() {
    try {
        const prodRes = await fetch('products.json');
        products = await prodRes.json();
        renderProducts();

        const servRes = await fetch('services.json');
        services = await servRes.json();
        renderServices();
    } catch (error) {
        console.error('خطا در دریافت داده‌ها:', error);
        productGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff5252;">خطا در بارگذاری اطلاعات.</div>`;
    }
}

// رندر محصولات
function renderProducts() {
    let filtered = products;
    if (currentCategory !== 'all') filtered = filtered.filter(p => p.cat === currentCategory);
    if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    }

    productGrid.innerHTML = filtered.map(p => {
        let imgContent = p.image ? `<img src="${p.image}">` : `<span>${p.icon || '📦'}</span>`;
        return `
        <div class="product-card" onclick="openProductModal(${p.id})">
            <div class="product-img">
                ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
                ${imgContent}
            </div>
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-price">${p.price.toLocaleString('fa-IR')} <span>تومان</span></div>
            </div>
        </div>
        `;
    }).join('');
}

// رندر خدمات محلی
function renderServices() {
    servicesContainer.innerHTML = services.map(s => `
        <div class="service-card" onclick="openServiceModal(${s.id})">
            <div class="service-icon">${s.icon || '🏪'}</div>
            <div class="service-name">${s.name}</div>
            <div class="service-type">${s.type}</div>
        </div>
    `).join('');
}

// رویدادها
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value; renderProducts();
});
document.getElementById('categoriesContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) return;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat; renderProducts();
});

// مدیریت پنجره‌ها
const overlay = document.getElementById('modalOverlay');
const bottomSheet = document.getElementById('bottomSheet');
const productView = document.getElementById('productView');
const serviceView = document.getElementById('serviceView');

window.openProductModal = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    productView.style.display = 'block';
    serviceView.style.display = 'none';

    const imgElement = document.getElementById('modalImage');
    const iconElement = document.getElementById('modalIcon');

    if (product.image) {
        imgElement.src = product.image; imgElement.style.display = 'block'; iconElement.style.display = 'none';
    } else {
        imgElement.style.display = 'none'; iconElement.style.display = 'block'; iconElement.innerText = product.icon || '📦';
    }

    document.getElementById('modalTitle').innerText = product.name;
    document.getElementById('modalDesc').innerText = product.desc || 'بدون توضیحات';
    document.getElementById('modalPrice').innerText = product.price.toLocaleString('fa-IR') + ' تومان';

    overlay.classList.add('active');
    bottomSheet.classList.add('active');
}

window.openServiceModal = function(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;

    productView.style.display = 'none';
    serviceView.style.display = 'block';

    document.getElementById('modalIcon').style.display = 'block';
    document.getElementById('modalImage').style.display = 'none';
    document.getElementById('modalIcon').innerText = service.icon || '🏪';
    
    document.getElementById('modalTitle').innerText = service.name;
    document.getElementById('modalDesc').innerText = `دسته‌بندی: ${service.type}`;
    
    document.getElementById('serviceAddress').innerText = service.address;
    document.getElementById('servicePhone').innerText = service.phone;
    document.getElementById('callBtn').href = `tel:${service.phone}`;

    overlay.classList.add('active');
    bottomSheet.classList.add('active');
}

function closeModal() {
    overlay.classList.remove('active');
    bottomSheet.classList.remove('active');
}
overlay.addEventListener('click', closeModal);

// سبد خرید
const cartBadge = document.getElementById('cartBadge');
document.getElementById('addToCartBtn').addEventListener('click', () => {
    cartCount++; cartBadge.innerText = cartCount; cartBadge.classList.add('show');
    const btn = document.getElementById('addToCartBtn');
    btn.innerText = '✓ به سبد اضافه شد'; btn.style.background = 'var(--gold)';
    setTimeout(() => { closeModal(); setTimeout(() => { btn.innerText = 'افزودن به سبد خرید'; btn.style.background = ''; }, 300); }, 800);
});

// منوی ناوبری پایین
function setActiveNav(id) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

window.scrollToTop = function() {
    document.getElementById('scrollArea').scrollTo({ top: 0, behavior: 'smooth' });
    setActiveNav('navHome');
}

window.scrollToCategories = function() {
    const catSection = document.getElementById('categoriesContainer');
    catSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setActiveNav('navCats');
}

window.showToast = function(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
}

// شروع
(function init() {
    if (window.Eitaa && window.Eitaa.WebApp) {
        window.Eitaa.WebApp.ready();
        if (!window.Eitaa.WebApp.isExpanded) window.Eitaa.WebApp.expand();
    }
    fetchData();
})();
