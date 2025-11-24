// const API_URL = window.location.origin + '/api';
const API_URL = window.location.origin + '/api';

// Check admin auth
const checkAdminAuth = async () => {
    try {
        const res = await fetch(`${API_URL}/auth/verify`, { 
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        
        if (!data.success) {
            console.log('Not authenticated');
            window.location.href = '/login';
            return null;
        }
        
        if (data.user.role !== 'admin') {
            alert('Admin access only!');
            window.location.href = '/';
            return null;
        }
        
        console.log('Admin authenticated:', data.user.email);
        return data.user;
    } catch (err) {
        console.error('Auth error:', err);
        window.location.href = '/login';
        return null;
    }
};

// API request
const apiRequest = async (endpoint, options = {}) => {
    const headers = options.body instanceof FormData 
        ? {} 
        : { 'Content-Type': 'application/json' };
    
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
};

// Show alert
const showAlert = (msg, type = 'success') => {
    const div = document.createElement('div');
    div.textContent = msg;
    Object.assign(div.style, {
        position: 'fixed',
        top: '90px',
        right: '20px',
        zIndex: 10000,
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        backgroundColor: type === 'success' ? '#4caf50' : '#f44336',
        color: 'white',
        fontWeight: 'bold'
    });
    document.body.append(div);
    setTimeout(() => div.remove(), 3000);
};

// Load dashboard stats
const loadDashboardStats = async () => {
    try {
        console.log('Loading dashboard stats...');
        
        const destData = await apiRequest('/destinations');
        const totalDest = document.getElementById('totalDestinations');
        if (totalDest) {
            const destinations = destData.destinations || [];
            totalDest.textContent = destinations.length;
        }
        
        const pkgData = await apiRequest('/packages');
        const totalPkg = document.getElementById('totalPackages');
        if (totalPkg) {
            const packages = pkgData.packages || [];
            totalPkg.textContent = packages.length;
        }
        
        await loadContactStats();
        
    } catch (err) {
        console.error('Failed loading stats:', err);
    }
};

// Load contact stats
const loadContactStats = async () => {
    try {
        const data = await apiRequest('/contact');
        const contacts = data.contacts || data.messages || [];
        
        const totalMessages = document.getElementById('totalMessages');
        if (totalMessages) {
            totalMessages.textContent = contacts.length;
        }
        
        const unreadCount = contacts.filter(c => c.status === 'new').length;
        const newMessages = document.getElementById('newMessages');
        if (newMessages) {
            newMessages.textContent = unreadCount;
        }
        
    } catch (err) {
        console.error('Failed loading contact stats:', err);
        const totalMessages = document.getElementById('totalMessages');
        const newMessages = document.getElementById('newMessages');
        if (totalMessages) totalMessages.textContent = '0';
        if (newMessages) newMessages.textContent = '0';
    }
};

// Load destinations table
const loadDestinationsTable = async () => {
    try {
        const data = await apiRequest('/destinations');
        const destinations = data.destinations || [];
        renderAdminDestinations(destinations);
    } catch (err) {
        console.error('Failed loading destinations:', err);
        showAlert('Failed to load destinations', 'error');
    }
};

// Load packages table
const loadPackagesTable = async () => {
    try {
        const data = await apiRequest('/packages');
        const packages = data.packages || [];
        renderAdminPackages(packages);
    } catch (err) {
        console.error('Failed loading packages:', err);
        showAlert('Failed to load packages', 'error');
    }
};

// FIXED: Render destinations table - CORRECT DATA MAPPING
const renderAdminDestinations = (destinations) => {
    const tbody = document.getElementById('destinationsTableBody');
    if (!tbody) return;
    
    console.log('Rendering destinations:', destinations);
    
    if (!destinations || !destinations.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state" style="text-align: center; padding: 4rem 2rem;">
                        <i class="fas fa-map-marked-alt" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
                        <h3 style="color: #1a1f71; margin-bottom: 0.75rem;">No Destinations Found</h3>
                        <p style="color: #999; margin-bottom: 1.5rem;">Start by adding your first amazing destination!</p>
                        <a href="/admin/add-destination" class="btn btn-success">
                            <i class="fas fa-plus"></i> Create First Destination
                        </a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = destinations.map(dest => {
        // CORRECT FIELD MAPPING
        const destName = dest.name || 'Unnamed';
        const destCountry = dest.country || 'Unknown';
        const destPrice = parseFloat(dest.price || 0).toFixed(2);
        const destRating = parseFloat(dest.rating || 5).toFixed(1);
        const destFeatured = dest.featured === 1 || dest.featured === true;
        const destImage = dest.image || '/uploads/placeholder.jpg';
        
        return `
            <tr>
                <td><strong style="color: #667eea; font-size: 1.1rem;">#${dest.id}</strong></td>
                <td><img src="${destImage}" class="dest-image" alt="${destName}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.12);"></td>
                <td>
                    <div style="font-weight: 700; color: #1a1f71; font-size: 1.125rem; margin-bottom: 0.375rem;">${destName}</div>
                    <div style="color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-globe" style="color: #667eea;"></i> ${destCountry}
                    </div>
                </td>
                <td><span style="font-weight: 800; color: #667eea; font-size: 1.375rem;">$${destPrice}</span></td>
                <td>
                    <span style="display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); padding: 0.625rem 1rem; border-radius: 12px; color: #f59e0b; font-weight: 700;">
                        <i class="fas fa-star"></i> ${destRating}
                    </span>
                </td>
                <td>
                    <span class="badge ${destFeatured ? 'badge-success' : 'badge-secondary'}" style="padding: 0.625rem 1.25rem; border-radius: 25px; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.5rem;">
                        ${destFeatured ? '<i class="fas fa-star"></i> Featured' : '<i class="fas fa-circle"></i> Regular'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 0.75rem;">
                        <a href="/admin/edit-destination?id=${dest.id}" class="btn btn-primary btn-sm">
                            <i class="fas fa-edit"></i> Edit
                        </a>
                        <button onclick="deleteDestination(${dest.id})" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

// FIXED: Render packages table - CORRECT DATA MAPPING
const renderAdminPackages = (packages) => {
    const tbody = document.getElementById('packagesTableBody');
    if (!tbody) return;
    
    console.log('Rendering packages:', packages);
    
    if (!packages || !packages.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state" style="text-align: center; padding: 4rem 2rem;">
                        <i class="fas fa-box-open" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
                        <h3 style="color: #1a1f71; margin-bottom: 0.75rem;">No Packages Found</h3>
                        <p style="color: #999; margin-bottom: 1.5rem;">Start creating amazing travel packages for your customers!</p>
                        <a href="/admin/add-package" class="btn btn-success">
                            <i class="fas fa-plus"></i> Create First Package
                        </a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = packages.map(pkg => {
        // CORRECT FIELD MAPPING
        const pkgName = pkg.name || 'Unnamed Package';
        const pkgDuration = pkg.duration || 0;
        const pkgDestName = pkg.destination_name || 'Unknown Destination';
        const pkgPrice = parseFloat(pkg.price || 0).toFixed(2);
        const pkgFeatured = pkg.featured === 1 || pkg.featured === true;
        const pkgImage = pkg.image || '/uploads/placeholder.jpg';
        
        return `
            <tr>
                <td><strong style="color: #667eea; font-size: 1.1rem;">#${pkg.id}</strong></td>
                <td><img src="${pkgImage}" class="pkg-image" alt="${pkgName}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.12);"></td>
                <td>
                    <div style="font-weight: 700; color: #1a1f71; font-size: 1.125rem; margin-bottom: 0.375rem;">${pkgName}</div>
                    <div style="color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-map-marker-alt" style="color: #667eea;"></i> ${pkgDestName}
                    </div>
                </td>
                <td>
                    <span style="display: inline-flex; align-items: center; gap: 0.625rem; background: linear-gradient(135deg, #f0f2ff 0%, #e8eaff 100%); padding: 0.75rem 1.25rem; border-radius: 12px; color: #667eea; font-weight: 700; font-size: 0.9rem;">
                        <i class="fas fa-calendar-alt"></i> ${pkgDuration} ${pkgDuration === 1 ? 'Day' : 'Days'}
                    </span>
                </td>
                <td><span style="font-weight: 800; color: #667eea; font-size: 1.375rem;">$${pkgPrice}</span></td>
                <td>
                    <span class="badge ${pkgFeatured ? 'badge-success' : 'badge-secondary'}" style="padding: 0.625rem 1.25rem; border-radius: 25px; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.5rem;">
                        ${pkgFeatured ? '<i class="fas fa-star"></i> Featured' : '<i class="fas fa-circle"></i> Regular'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 0.75rem;">
                        <a href="/admin/edit-package?id=${pkg.id}" class="btn btn-primary btn-sm">
                            <i class="fas fa-edit"></i> Edit
                        </a>
                        <button onclick="deletePackage(${pkg.id})" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

// Delete destination
const deleteDestination = async (id) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    
    try {
        await apiRequest(`/destinations/${id}`, { method: 'DELETE' });
        showAlert('Destination deleted successfully', 'success');
        loadDestinationsTable();
    } catch (err) {
        console.error('Delete error:', err);
        showAlert('Failed to delete destination', 'error');
    }
};

// Delete package
const deletePackage = async (id) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
        await apiRequest(`/packages/${id}`, { method: 'DELETE' });
        showAlert('Package deleted successfully', 'success');
        loadPackagesTable();
    } catch (err) {
        console.error('Delete error:', err);
        showAlert('Failed to delete package', 'error');
    }
};

// Logout function
const handleLogout = async () => {
    console.log('Logout clicked');
    try {
        const result = await apiRequest('/auth/logout', { method: 'POST' });
        showAlert('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = '/login';
        }, 800);
    } catch (err) {
        console.error('Logout error:', err);
        showAlert('Logout failed', 'error');
    }
};

// Attach logout button
const attachLogoutButton = () => {
    let logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) {
        logoutBtn = document.querySelector('.logout-btn');
    }
    
    if (!logoutBtn) {
        const allButtons = document.querySelectorAll('button, a');
        for (let btn of allButtons) {
            if (btn.textContent.toLowerCase().includes('logout')) {
                logoutBtn = btn;
                break;
            }
        }
    }
    
    if (logoutBtn) {
        console.log('Logout button found');
        logoutBtn.removeAttribute('onclick');
        const newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
        });
        
        console.log('Logout button attached successfully');
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin page loading...');
    
    await checkAdminAuth();
    await loadDashboardStats();
    
    if (document.getElementById('destinationsTableBody')) {
        await loadDestinationsTable();
    }
    
    if (document.getElementById('packagesTableBody')) {
        await loadPackagesTable();
    }
    
    setTimeout(attachLogoutButton, 500);
    
    console.log('Admin page loaded successfully');
});

// Export functions globally
window.handleLogout = handleLogout;
window.loadContactStats = loadContactStats;
window.deleteDestination = deleteDestination;
window.deletePackage = deletePackage;
window.renderAdminDestinations = renderAdminDestinations;
window.renderAdminPackages = renderAdminPackages;
