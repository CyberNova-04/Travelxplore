// API Config
const API_URL = window.location.origin + '/api';


// Alerts
const showAlert = (message, type = 'success') => {
    const div = document.createElement('div');
    div.className = `alert alert-${type}`;
    div.textContent = message;
    const container = document.querySelector('.container') || document.body;
    container.prepend(div);
    setTimeout(() => div.remove(), 5000);
};

// Token Helpers
const getToken = () => localStorage.getItem('token');
const setToken = token => localStorage.setItem('token', token);
const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
const getUser = () => JSON.parse(localStorage.getItem('user'));
const setUser = user => localStorage.setItem('user', JSON.stringify(user));

// API Request
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {'Content-Type':'application/json', ...options.headers};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {...options, headers});
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
};

// Auth Check & UI Update
const updateUIForAuth = user => {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    if (user) {
        loginBtn && (loginBtn.style.display='none');
        userMenu && (userMenu.style.display='flex');
        userName && (userName.textContent='Hi, ' + user.username);

    } else {
        loginBtn && (loginBtn.style.display='inline-block');
        userMenu && (userMenu.style.display='none');
    }
};

const checkAuth = async () => {
    const token = getToken();
    if (!token) return null;
    try {
        const data = await apiRequest('/auth/verify');
        setUser(data.user);
        updateUIForAuth(data.user);
        return data.user;
    } catch {
        removeToken();
        return null;
    }
};

// Logout
const logout = () => {
    removeToken();
    showAlert('Logged out successfully','success');
    setTimeout(() => window.location.href='/',1000);
};

// Mobile Menu
const initMobileMenu = () => {
    const btn = document.createElement('button');
    btn.className='mobile-menu-btn';
    btn.innerHTML='<i class="fas fa-bars"></i>';
    Object.assign(btn.style,{display:'none',fontSize:'1.5rem',background:'none',border:'none',cursor:'pointer',color:'var(--primary-blue)'});
    const navbar = document.querySelector('.navbar');
    const links = document.querySelector('.nav-links');
    if (navbar && links) {
        navbar.append(btn);
        btn.addEventListener('click',() => links.classList.toggle('active'));
        const check = () => {
            if (window.innerWidth<=768) btn.style.display='block';
            else { btn.style.display='none'; links.classList.remove('active'); }
        };
        check();
        window.addEventListener('resize',check);
    }
};

// Utilities
const formatPrice = price => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(price);
const formatDate = date => new Date(date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
const createStarRating = rating => {
    const full = Math.floor(rating);
    const half = rating%1>=0.5;
    let stars='';
    for(let i=0;i<full;i++) stars+='★';
    if(half) stars+='☆';
    while(stars.length<5) stars+='☆';
    return stars;
};

// Data Loaders
const loadDestinations = async filters => {
    try {
        const query = new URLSearchParams(filters).toString();
        const data = await apiRequest(`/destinations?${query}`);
        return data.destinations;
    } catch {
        showAlert('Failed to load destinations','error');
        return [];
    }
};

const loadPackages = async filters => {
    try {
        const query = new URLSearchParams(filters).toString();
        const data = await apiRequest(`/packages?${query}`);
        return data.packages;
    } catch {
        showAlert('Failed to load packages','error');
        return [];
    }
};

// Renderers
const renderDestinationCards = (destinations, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!destinations.length) {
        container.innerHTML='<p class="text-center">No destinations found.</p>';
        return;
    }
    container.innerHTML = destinations.map(dest => `
        <div class="card" onclick="viewDestination(${dest.id})">
            <img src="${dest.image}" alt="${dest.name}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${dest.name}</h3>
                <p class="card-description">${dest.short_description || dest.description.substring(0,100)+'...'}</p>
                <div class="card-meta">
                    <div class="card-price">${formatPrice(dest.price)} <span>/person</span></div>
                    <div class="star-rating">${createStarRating(dest.rating)}</div>
                </div>
            </div>
        </div>
    `).join('');
};

const renderPackageCards = (packages, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!packages.length) {
        container.innerHTML='<p class="text-center">No packages found.</p>';
        return;
    }
    container.innerHTML = packages.map(pkg => `
        <div class="card" onclick="viewPackage(${pkg.id})">
            <img src="${pkg.image}" alt="${pkg.title}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${pkg.title}</h3>
                <p class="card-description">${pkg.description.substring(0,100)}...</p>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;">
                    <span><i class="fas fa-clock"></i> ${pkg.duration_days} Days</span>
                    <span><i class="fas fa-users"></i> Max ${pkg.max_guests}</span>
                </div>
                <div class="card-meta">
                    <div class="card-price">${formatPrice(pkg.price)} <span>/person</span></div>
                    <div class="star-rating">${createStarRating(pkg.rating)}</div>
                </div>
            </div>
        </div>
    `).join('');
};

// Navigators
const viewDestination = id => window.location.href=`/destinations?id=${id}`;
const viewPackage = id => window.location.href=`/package/${id}`;

// Smooth Scroll
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click',e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            target && target.scrollIntoView({behavior:'smooth',block:'start'});
        });
    });
};

// Navbar scroll effect
const initNavbarScroll = () => {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll',() => {
        if(window.scrollY>100){
            navbar.style.background='rgba(255,255,255,.98)';
            navbar.style.boxShadow='0 2px 20px rgba(0,0,0,.1)';
        } else {
            navbar.style.background='rgba(255,255,255,.95)';
            navbar.style.boxShadow='0 2px 10px rgba(0,0,0,.1)';
        }
    });
};

// Init
document.addEventListener('DOMContentLoaded',async() => {
    await checkAuth();
    initMobileMenu();
    initSmoothScroll();
    initNavbarScroll();

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn && logoutBtn.addEventListener('click',e => {
        e.preventDefault();
        logout();
    });
});

window.TravelXplore = {
    apiRequest,
    checkAuth,
    getToken,
    setToken,
    removeToken,
    getUser,
    setUser,
    showAlert,
    formatPrice,
    formatDate,
    createStarRating,
    loadDestinations,
    loadPackages,
    renderDestinationCards,
    renderPackageCards,
    viewDestination,
    viewPackage,
    logout
};
