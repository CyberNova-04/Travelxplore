const API_URL = 'http://localhost:3000/api';

// Check admin auth
const checkAdminAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href='/login';
    try {
        const res = await fetch(`${API_URL}/auth/verify`, { headers: { Authorization:`Bearer ${token}` } });
        const data = await res.json();
        if (!data.success || data.user.role!=='admin') {
            alert('Access denied! Admin only.');
            return window.location.href='/';
        }
        document.getElementById('adminName').textContent = data.user.username;
        document.getElementById('adminAvatar').textContent = data.user.username.charAt(0).toUpperCase();
        return data.user;
    } catch {
        return window.location.href='/login';
    }
};

// API request
const apiRequest = async (endpoint, options={}) => {
    const token = localStorage.getItem('token');
    const headers = options.body instanceof FormData ? { Authorization:`Bearer ${token}` } : { 'Content-Type':'application/json', Authorization:`Bearer ${token}` };
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {...options, headers});
        const data = await res.json();
        if (!res.ok) throw new Error(data.message||'Request failed');
        return data;
    } catch (err) {
        console.error('API Error:',err);
        throw err;
    }
};

const showAlert = (msg,type='success') => {
    const div = document.createElement('div');
    div.className = `alert alert-${type}`;
    div.textContent = msg;
    Object.assign(div.style,{position:'fixed',top:'90px',right:'20px',zIndex:10000,padding:'1rem 1.5rem',borderRadius:'8px',boxShadow:'0 4px 12px rgba(0,0,0,0.15)'});
    document.body.append(div);
    setTimeout(() => div.remove(),3000);
};

// Load dashboard stats
const loadDashboardStats = async () => {
    try {
        const [dest, pkg, msg] = await Promise.all([
            apiRequest('/destinations'),
            apiRequest('/packages'),
            apiRequest('/contact/stats/summary')
        ]);
        document.getElementById('totalDestinations').textContent = dest.count;
        document.getElementById('totalPackages').textContent = pkg.count;
        document.getElementById('totalMessages').textContent = msg.stats.total;
        document.getElementById('newMessages').textContent = msg.stats.new;
    } catch {
        console.error('Failed loading stats');
    }
};

// Load table rows
const loadTable = async (type, search='') => {
    const endpoint = type === 'dest' ? `/destinations?search=${search}` : `/packages?search=${search}`;
    const tbody = document.getElementById(type==='dest'?'destinationsTableBody':'packagesTableBody');
    try {
        const data = await apiRequest(endpoint);
        const items = type==='dest' ? data.destinations : data.packages;
        if (!items.length) {
            tbody.innerHTML = `<tr><td colspan="${type==='dest'?7:8}" class="text-center">No ${type==='dest'?'destinations':'packages'} found</td></tr>`;
            return;
        }
        tbody.innerHTML = items.map(item => {
            const img = `<img src="${item.image}" class="table-image" alt="">`;
            const name = type==='dest' ? `<strong>${item.name}</strong>` : `<strong>${item.title}</strong>`;
            const location = type==='pkg' ? item.destination_name : item.country;
            const status = `<span class="badge badge-${item.featured?'success':'warning'}">${item.featured?'Featured':'Regular'}</span>`;
            const actions = `
                <button class="btn-icon btn-edit" onclick="alert('Edit coming soon')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-delete" onclick="${type==='dest'?'deleteDestination':'deletePackage'}(${item.id})"><i class="fas fa-trash"></i></button>
            `;
            if(type==='dest'){
                return `<tr>
                    <td>${item.id}</td>
                    <td>${img}</td>
                    <td>${name}</td>
                    <td>${item.country}</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>${status}</td>
                    <td class="action-buttons">${actions}</td>
                </tr>`;
            } else {
                return `<tr>
                    <td>${item.id}</td>
                    <td>${img}</td>
                    <td>${name}</td>
                    <td>${location||'N/A'}</td>
                    <td>${item.duration_days} Days</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>${status}</td>
                    <td class="action-buttons">${actions}</td>
                </tr>`;
            }
        }).join('');
    } catch {
        showAlert(`Failed to load ${type==='dest'?'destinations':'packages'}`,'error');
    }
};

// Delete
const deleteDestination = async id => {
    if(!confirm('Delete this destination?')) return;
    try {
        await apiRequest(`/destinations/${id}`,{method:'DELETE'});
        showAlert('Deleted successfully','success');
        loadTable('dest');
    } catch {
        showAlert('Delete failed','error');
    }
};

const deletePackage = async id => {
    if(!confirm('Delete this package?')) return;
    try {
        await apiRequest(`/packages/${id}`,{method:'DELETE'});
        showAlert('Deleted successfully','success');
        loadTable('pkg');
    } catch {
        showAlert('Delete failed','error');
    }
};

// Add forms
const handleAdd = async (e,type) => {
    e.preventDefault();
    const form=e.target;
    const btn=form.querySelector('button[type="submit"]');
    const data=new FormData(form);
    btn.disabled=true; btn.textContent='Saving...';
    try {
        await apiRequest(`/${type}`,{method:'POST',body:data});
        showAlert(`${type==='destinations'?'Destination':'Package'} added!`,'success');
        setTimeout(()=>window.location.href=`/admin/${type}`,1500);
    } catch(err) {
        showAlert(err.message||`Failed to add ${type}`,'error');
    } finally {
        btn.disabled=false; btn.textContent=`Add ${type==='destinations'?'Destination':'Package'}`;
    }
};

// Load destinations for select
const loadDestinationsSelect = async () => {
    try {
        const data = await apiRequest('/destinations');
        const select = document.getElementById('destination_id');
        select.innerHTML = '<option value="">Select Destination</option>' +
            data.destinations.map(d=>`<option value="${d.id}">${d.name}, ${d.country}</option>`).join('');
    } catch {
        console.error('Failed to load select');
    }
};

// Preview image
const previewImage = input => {
    const preview = document.getElementById('imagePreview');
    if(!preview || !input.files||!input.files[0]) return;
    const reader=new FileReader();
    reader.onload=e => {
        preview.src=e.target.result;
        preview.style.display='block';
    };
    reader.readAsDataURL(input.files[0]);
};

// Init
document.addEventListener('DOMContentLoaded', async ()=>{
    await checkAdminAuth();
    const path = window.location.pathname;

    if(path === '/admin' || path === '/admin/') loadDashboardStats();

    if(path.includes('/admin/destinations')) {
        loadTable('dest');
        document.getElementById('searchDestinations')?.addEventListener('input',e=>loadTable('dest',e.target.value));
    }

    if(path.includes('/admin/packages')) {
        loadTable('pkg');
        document.getElementById('searchPackages')?.addEventListener('input',e=>loadTable('pkg',e.target.value));
    }

    if(path === '/admin/add-destination') {
        document.getElementById('addDestinationForm')?.addEventListener('submit',e=>handleAdd(e,'destinations'));
        document.getElementById('image')?.addEventListener('change',e=>previewImage(e.target));
    }

    if(path === '/admin/add-package') {
        await loadDestinationsSelect();
        document.getElementById('addPackageForm')?.addEventListener('submit',e=>handleAdd(e,'packages'));
        document.getElementById('image')?.addEventListener('change',e=>previewImage(e.target));
    }

    document.getElementById('adminLogout')?.addEventListener('click',e=>{
        e.preventDefault();
        localStorage.clear();
        window.location.href='/login';
    });
});

// Export
window.adminFunctions={deleteDestination,deletePackage,loadTable};
