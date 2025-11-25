// ✅ FIXED: Render package details
function renderPackageDetails(pkg) {
    console.log('Rendering:', pkg);
    
    // ✅ USE CORRECT FIELD NAMES
    const name = pkg.title || 'Unnamed';                      // ✅ title (not name)
    const duration = pkg.duration_days || 0;                  // ✅ duration_days
    const price = parseFloat(pkg.price || 0).toFixed(2);
    const description = pkg.description || 'No description';
    const image = pkg.image || '/uploads/placeholder.jpg';
    const destName = pkg.destination_name || 'Unknown';
    const country = pkg.country || '';
    const rating = parseFloat(pkg.rating || 5).toFixed(1);
    const maxGuests = pkg.max_guests || 10;                   // ✅ max_guests
    
    // Handle inclusions/exclusions
    const inclusions = pkg.inclusions || '';
    const exclusions = pkg.exclusions || '';
    
    let inclusionsList = [];
    if (inclusions && inclusions.trim()) {
        inclusionsList = inclusions
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .map(item => item.replace(/^[•\-\*]\s*/, ''));
    }
    
    let exclusionsList = [];
    if (exclusions && exclusions.trim()) {
        exclusionsList = exclusions
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .map(item => item.replace(/^[•\-\*]\s*/, ''));
    }
    
    // Update page
    document.title = `${name} - TravelXplore`;
    
    // Hero section
    const hero = document.querySelector('.package-hero');
    if (hero) {
        hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${image}')`;
        const heroTitle = hero.querySelector('h1');
        const heroLocation = hero.querySelector('p');
        if (heroTitle) heroTitle.textContent = name;
        if (heroLocation) heroLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${destName}${country ? ', ' + country : ''}`;
    }
    
    // Price & info
    const priceEl = document.querySelector('.price');
    if (priceEl) priceEl.textContent = `₹${price}`;
    
    const durationEl = document.querySelector('.info-item:nth-child(1) .info-value');
    if (durationEl) durationEl.textContent = `${duration} Days`;
    
    const guestsEl = document.querySelector('.info-item:nth-child(2) .info-value');
    if (guestsEl) guestsEl.textContent = `${maxGuests} People`;
    
    const ratingEl = document.querySelector('.info-item:nth-child(3) .info-value');
    if (ratingEl) ratingEl.innerHTML = `<i class="fas fa-star"></i> ${rating}`;
    
    // Description
    const descEl = document.querySelector('.package-description p');
    if (descEl) descEl.textContent = description;
    
    // Inclusions
    const inclusionsUl = document.querySelector('.inclusions-list');
    if (inclusionsUl) {
        if (inclusionsList.length > 0) {
            inclusionsUl.innerHTML = inclusionsList.map(item => 
                `<li><i class="fas fa-check-circle"></i> ${item}</li>`
            ).join('');
        } else {
            inclusionsUl.innerHTML = '<li><i class="fas fa-check-circle"></i> All meals</li><li><i class="fas fa-check-circle"></i> Accommodation</li><li><i class="fas fa-check-circle"></i> Tour guide</li>';
        }
    }
    
    // Exclusions
    const exclusionsUl = document.querySelector('.exclusions-list');
    if (exclusionsUl) {
        if (exclusionsList.length > 0) {
            exclusionsUl.innerHTML = exclusionsList.map(item => 
                `<li><i class="fas fa-times-circle"></i> ${item}</li>`
            ).join('');
        } else {
            exclusionsUl.innerHTML = '<li><i class="fas fa-times-circle"></i> Flights</li><li><i class="fas fa-times-circle"></i> Travel insurance</li>';
        }
    }
    
    console.log('✅ Package rendered');
}