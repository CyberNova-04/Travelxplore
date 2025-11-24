console.log('✅ packages.js loaded');

const API_URL = window.location.origin + '/api';


// Load packages
async function loadPackages() {
    try {
        console.log('📦 Fetching packages...');
        
        const response = await fetch(API_URL + '/packages');
        const data = await response.json();
        
        console.log('📦 Response:', data);
        
        if (!data.success) {
            console.error('❌ API error');
            showError('Failed to load packages');
            return;
        }
        
        if (!data.packages || data.packages.length === 0) {
            console.warn('⚠️ No packages');
            showEmpty();
            return;
        }
        
        console.log(`✅ Loaded ${data.packages.length} packages`);
        renderPackages(data.packages);
        
    } catch (error) {
        console.error('❌ Error:', error);
        showError('Network error: ' + error.message);
    }
}

// ✅ FIXED: Render packages
function renderPackages(packages) {
    const container = document.getElementById('packagesContainer');
    
    if (!container) {
        console.error('❌ #packagesContainer not found!');
        return;
    }
    
    console.log('🎨 Rendering...');
    
    container.innerHTML = packages.map(pkg => {
        console.log('Package:', pkg);
        
        // ✅ USE CORRECT FIELD NAMES
        const id = pkg.id;
        const title = pkg.title || 'Untitled';                    // ✅ title (not name)
        const durationDays = pkg.duration_days || 0;              // ✅ duration_days
        const price = parseFloat(pkg.price || 0).toFixed(2);
        const destinationName = pkg.destination_name || 'Unknown';
        const image = pkg.image || '/uploads/placeholder.jpg';
        const rating = parseFloat(pkg.rating || 5).toFixed(1);
        const maxGuests = pkg.max_guests || 10;                   // ✅ max_guests
        const description = pkg.description || '';
        const featured = pkg.featured === 1;
        
        const shortDesc = description.length > 80 
            ? description.substring(0, 80) + '...' 
            : description;
        
        return `
            <div class="package-card">
                <div class="package-image">
                    <img src="${image}" alt="${title}">
                    ${featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                </div>
                <div class="package-content">
                    <h3>${title}</h3>
                    <p class="package-location">
                        <i class="fas fa-map-marker-alt"></i> ${destinationName}
                    </p>
                    <p class="package-desc">${shortDesc}</p>
                    <div class="package-meta">
                        <span class="meta-item">
                            <i class="fas fa-clock"></i> ${durationDays} Days
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-users"></i> Max ${maxGuests}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-star"></i> ${rating}
                        </span>
                    </div>
                    <div class="package-footer">
                        <div class="price">
                            <span class="from">From</span>
                            <span class="amount">$${price}</span>
                        </div>
                        <a href="/package/${id}" class="btn-view">
                            View Details <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('✅ Rendered!');
}

// Show error
function showError(message) {
    const container = document.getElementById('packagesContainer');
    if (container) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem; grid-column: 1/-1;">
                <i class="fas fa-exclamation-triangle" style="font-size:3rem; color:#f44336;"></i>
                <h3>Error Loading Packages</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">Reload</button>
            </div>
        `;
    }
}

// Show empty
function showEmpty() {
    const container = document.getElementById('packagesContainer');
    if (container) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem; grid-column: 1/-1;">
                <i class="fas fa-box-open" style="font-size:3rem; color:#ccc;"></i>
                <h3>No Packages Available</h3>
                <p>Check back later!</p>
            </div>
        `;
    }
}

// Load on ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPackages);
} else {
    loadPackages();
}

window.reloadPackages = loadPackages;