// ✅ FIXED: Render admin packages
const renderAdminPackages = (packages) => {
    const tbody = document.getElementById('packagesTableBody');
    if (!tbody) return;
    
    console.log('Rendering admin packages:', packages);
    
    if (!packages || !packages.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state" style="text-align: center; padding: 4rem 2rem;">
                        <i class="fas fa-box-open" style="font-size: 4rem; color: #ddd;"></i>
                        <h3>No Packages</h3>
                        <a href="/admin/add-package" class="btn btn-success">
                            <i class="fas fa-plus"></i> Add Package
                        </a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = packages.map(pkg => {
        // ✅ USE CORRECT FIELD NAMES
        const pkgTitle = pkg.title || 'Unnamed';                  // ✅ title (not name)
        const pkgDuration = pkg.duration_days || 0;               // ✅ duration_days
        const pkgDestName = pkg.destination_name || 'Unknown';
        const pkgPrice = parseFloat(pkg.price || 0).toFixed(2);
        const pkgFeatured = pkg.featured === 1;
        const pkgImage = pkg.image || '/uploads/placeholder.jpg';
        
        return `
            <tr>
                <td><strong>#${pkg.id}</strong></td>
                <td><img src="${pkgImage}" style="width:90px;height:90px;object-fit:cover;border-radius:8px;"></td>
                <td>
                    <div style="font-weight:700;color:#1a1f71;">${pkgTitle}</div>
                    <div style="color:#666;font-size:0.9rem;">
                        <i class="fas fa-map-marker-alt"></i> ${pkgDestName}
                    </div>
                </td>
                <td>
                    <span style="color:#667eea;font-weight:700;">
                        <i class="fas fa-calendar-alt"></i> ${pkgDuration} Days
                    </span>
                </td>
                <td style="font-weight:800;color:#667eea;font-size:1.3rem;">$${pkgPrice}</td>
                <td>
                    <span class="badge ${pkgFeatured ? 'badge-success' : 'badge-secondary'}">
                        ${pkgFeatured ? '<i class="fas fa-star"></i> Featured' : 'Regular'}
                    </span>
                </td>
                <td>
                    <a href="/admin/edit-package?id=${pkg.id}" class="btn btn-primary btn-sm">
                        <i class="fas fa-edit"></i> Edit
                    </a>
                    <button onclick="deletePackage(${pkg.id})" class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
};