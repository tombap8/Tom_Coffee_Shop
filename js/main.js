let menuData = [];
let currentTab = 'main';
let currentCategory = 'ALL';
let cart = [];

window.addEventListener('DOMContentLoaded', async () => {
    await loadMenuData();
    renderMenuItems();
    lucide.createIcons();
    switchTab('main');
});

async function loadMenuData() {
    try {
        const response = await fetch('./data/main.json');
        menuData = await response.json();
    } catch (error) {
        console.error('메뉴 데이터 로드 실패:', error);
        menuData = [];
    }
}

function switchTab(tabId) {
    currentTab = tabId;

    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`page-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('text-brand-500', 'border-b-2', 'border-brand-700', 'active-nav');
        link.classList.add('text-brand-800');
    });

    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.classList.remove('text-brand-800');
        activeNav.classList.add('text-brand-500', 'border-b-2', 'border-brand-700', 'active-nav');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-icon');

    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.setAttribute('data-lucide', 'x');
    } else {
        menu.classList.add('hidden');
        icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
}

function renderMenuItems() {
    const grid = document.getElementById('menu-grid');
    const searchQuery = document.getElementById('menu-search').value.toLowerCase();
    grid.innerHTML = '';

    const filteredItems = menuData.filter(item => {
        const matchesCategory = currentCategory === 'ALL' || item.category === currentCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filteredItems.length === 0) {
        document.getElementById('no-results').classList.remove('hidden');
        grid.classList.add('hidden');
        return;
    } else {
        document.getElementById('no-results').classList.add('hidden');
        grid.classList.remove('hidden');
    }

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-white p-5 rounded-2xl border border-brand-200/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold tracking-widest text-brand-500 bg-brand-100 px-2 py-1 rounded">${item.category}</span>
                    <span class="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">${item.icon}</span>
                </div>
                <div class="mt-4">
                    <h3 class="font-bold text-lg text-brand-800 flex items-center justify-between">
                        <span class="hover:text-brand-500 transition-colors cursor-pointer" onclick="openDetailModal('${item.id}')">${item.name}</span>
                    </h3>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">${item.story}</p>
                </div>
            </div>
            <div class="mt-6 pt-4 border-t border-brand-100 flex items-center justify-between">
                <span class="font-serif font-bold text-brand-800 text-lg">${item.price.toLocaleString()}원</span>
                <div class="flex gap-1">
                    <button onclick="openDetailModal('${item.id}')" title="상세보기 및 재료설명" class="p-2 bg-brand-100 hover:bg-brand-200 text-brand-800 rounded-lg transition-colors">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    <button onclick="addToCart('${item.id}')" title="장바구니 담기" class="px-3 py-2 bg-brand-800 hover:bg-brand-700 text-brand-50 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5">
                        <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i>
                        <span>담기</span>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    lucide.createIcons();
}

function setCategoryFilter(category) {
    currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.className = "category-btn px-4 py-2 rounded-full font-medium text-sm transition-all bg-brand-100 text-brand-800 hover:bg-brand-200";
    });
    const activeBtn = document.querySelector(`.category-btn[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.className = "category-btn px-4 py-2 rounded-full font-medium text-sm transition-all bg-brand-800 text-brand-50";
    }
    renderMenuItems();
}

function filterMenuItems() {
    renderMenuItems();
}

function openDetailModal(itemId) {
    const item = menuData.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('modal-category').innerText = item.category;
    document.getElementById('modal-title').innerText = item.name;
    document.getElementById('modal-price').innerText = `${item.price.toLocaleString()}원`;
    document.getElementById('modal-ingredient').innerText = item.ingredient;
    document.getElementById('modal-caffeine').innerText = item.caffeine;
    document.getElementById('modal-story').innerText = item.story;

    const btn = document.getElementById('modal-add-cart-btn');
    btn.setAttribute('onclick', `addToCart('${item.id}'); closeDetailModal();`);

    document.getElementById('backdrop').classList.remove('hidden');
    document.getElementById('detail-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    if (document.getElementById('cart-panel').classList.contains('translate-x-full')) {
        document.getElementById('backdrop').classList.add('hidden');
    }
}

function toggleCart() {
    const panel = document.getElementById('cart-panel');
    const backdrop = document.getElementById('backdrop');

    if (panel.classList.contains('translate-x-full')) {
        panel.classList.remove('translate-x-full');
        backdrop.classList.remove('hidden');
    } else {
        panel.classList.add('translate-x-full');
        if (document.getElementById('detail-modal').classList.contains('hidden')) {
            backdrop.classList.add('hidden');
        }
    }
}

function closeAllOverlays() {
    document.getElementById('cart-panel').classList.add('translate-x-full');
    document.getElementById('detail-modal').classList.add('hidden');
    document.getElementById('backdrop').classList.add('hidden');
}

function addToCart(itemId) {
    const item = menuData.find(i => i.id === itemId);
    if (!item) return;

    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    updateCartUI();
    showToast(`${item.name}이(가) 장바구니에 추가되었습니다.`);
}

function updateCartQuantity(itemId, newQty) {
    if (newQty <= 0) {
        cart = cart.filter(i => i.id !== itemId);
    } else {
        const item = cart.find(i => i.id === itemId);
        if (item) item.quantity = newQty;
    }
    updateCartUI();
}

function removeFromCart(itemId) {
    const item = cart.find(i => i.id === itemId);
    cart = cart.filter(i => i.id !== itemId);
    updateCartUI();
    if (item) {
        showToast(`${item.name}을(를) 제거했습니다.`);
    }
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-message');
    const badge = document.getElementById('cart-badge');

    const dynamicItems = container.querySelectorAll('.cart-dynamic-item');
    dynamicItems.forEach(el => el.remove());

    if (cart.length === 0) {
        emptyMsg.classList.remove('hidden');
        badge.classList.add('hidden');
        badge.innerText = '0';
    } else {
        emptyMsg.classList.add('hidden');
        badge.classList.remove('hidden');

        let totalQty = 0;
        cart.forEach(item => {
            totalQty += item.quantity;
        });
        badge.innerText = totalQty;
    }

    let totalSum = 0;
    let totalQtySum = 0;

    cart.forEach(item => {
        totalSum += item.price * item.quantity;
        totalQtySum += item.quantity;

        const card = document.createElement('div');
        card.className = "cart-dynamic-item bg-white p-3 rounded-lg border border-brand-200 flex items-center justify-between space-x-3";
        card.innerHTML = `
            <div class="text-xl">${item.icon}</div>
            <div class="flex-grow min-w-0">
                <h4 class="font-bold text-brand-800 text-sm truncate">${item.name}</h4>
                <span class="text-xs text-brand-500 font-serif">${item.price.toLocaleString()}원</span>
            </div>
            <div class="flex items-center space-x-1.5 bg-brand-100 rounded px-1 py-0.5 border border-brand-200">
                <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" class="p-0.5 text-brand-800 hover:bg-brand-200 rounded">
                    <i data-lucide="minus" class="w-3 h-3"></i>
                </button>
                <span class="text-xs font-bold text-brand-800 w-4 text-center">${item.quantity}</span>
                <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" class="p-0.5 text-brand-800 hover:bg-brand-200 rounded">
                    <i data-lucide="plus" class="w-3 h-3"></i>
                </button>
            </div>
            <button onclick="removeFromCart('${item.id}')" class="text-red-400 hover:text-red-600 p-1">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;
        container.appendChild(card);
    });

    document.getElementById('cart-total-qty').innerText = `${totalQtySum}개`;
    document.getElementById('cart-total-price').innerText = `${totalSum.toLocaleString()}원`;

    lucide.createIcons();
}

function checkoutOrder() {
    if (cart.length === 0) {
        showToast('장바구니가 비어 있어 주문을 할 수 없습니다.');
        return;
    }

    const totalSum = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const backdrop = document.getElementById('backdrop');
    const panel = document.getElementById('cart-panel');
    panel.classList.add('translate-x-full');

    showToast(`주문 완료! ${totalSum.toLocaleString()}원 가상 주문 접수됨.`);
    cart = [];
    updateCartUI();
    backdrop.classList.add('hidden');
}

let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');

    msgEl.innerText = message;

    clearTimeout(toastTimeout);
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');

    toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
    }, 3000);
}
