const API_URL = 'http://localhost:3000/api';

// Password Strength
const checkPasswordStrength = pwd => {
    let strength=0;
    if(pwd.length>=6) strength++;
    if(pwd.length>=10) strength++;
    if(/[a-z]/.test(pwd)&&/[A-Z]/.test(pwd)) strength++;
    if(/\d/.test(pwd)) strength++;
    if(/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
};

const updatePasswordStrength = pwd => {
    const bar = document.querySelector('.password-strength-bar');
    const text = document.querySelector('.password-strength-text');
    if(!bar) return;
    bar.className='password-strength-bar';
    const str = checkPasswordStrength(pwd);
    if(str<=2){
        bar.classList.add('weak');
        text.textContent='Weak password';
    } else if(str<=4){
        bar.classList.add('medium');
        text.textContent='Medium strength';
    } else {
        bar.classList.add('strong');
        text.textContent='Strong password';
    }
};

// Toggle visibility
const initPasswordToggle = () => {
    document.querySelectorAll('.password-toggle-icon').forEach(icon => {
        icon.addEventListener('click',() => {
            const input = icon.previousElementSibling;
            if(input.type==='password'){
                input.type='text';
                icon.innerHTML='<i class="fas fa-eye-slash"></i>';
            } else {
                input.type='password';
                icon.innerHTML='<i class="fas fa-eye"></i>';
            }
        });
    });
};

// Form validation
const validateForm = formId => {
    const form = document.getElementById(formId);
    if(!form) return false;
    let valid=true;
    form.querySelectorAll('.form-control[required]').forEach(input => {
        const err = input.parentElement.querySelector('.error-message');
        if(!input.value.trim()){
            input.classList.add('error');
            err && (err.textContent='This field is required',err.classList.add('show'));
            valid=false;
        } else {
            input.classList.remove('error');
            err && err.classList.remove('show');
            if(input.type==='email'){
                const re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(!re.test(input.value)){
                    input.classList.add('error');
                    err && (err.textContent='Invalid email',err.classList.add('show'));
                    valid=false;
                }
            }
            if(input.name==='password'&&input.value.length<6){
                input.classList.add('error');
                err && (err.textContent='Min 6 characters',err.classList.add('show'));
                valid=false;
            }
        }
    });
    const pwd = form.password, cpwd = form.confirm_password;
    if(pwd&&cpwd&&pwd.value!==cpwd.value){
        const err = cpwd.parentElement.querySelector('.error-message');
        cpwd.classList.add('error');
        err && (err.textContent='Passwords do not match',err.classList.add('show'));
        valid=false;
    }
    return valid;
};

// Show Alert
const showAlert = (msg, type='success') => {
    const div = document.createElement('div');
    div.className=`alert alert-${type}`;
    div.textContent=msg;
    Object.assign(div.style,{
        position:'fixed',top:'90px',right:'20px',zIndex:'10000',
        padding:'1rem 1.5rem',borderRadius:'8px',boxShadow:'0 4px 12px rgba(0,0,0,.15)'
    });
    document.body.append(div);
    setTimeout(()=>{
        div.style.animation='slideOut .3s ease';
        setTimeout(()=>div.remove(),300);
    },3000);
};

// Login
const handleLogin = async e => {
    e.preventDefault();
    if(!validateForm('loginForm')) return;
    const form=e.target;
    const btn=form.querySelector('button[type="submit"]');
    const { email, password } = form;
    btn.disabled=true; btn.classList.add('loading');
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ email: email.value, password: password.value })
        });
        const data=await res.json();
        if(data.success){
            localStorage.setItem('token',data.token);
            localStorage.setItem('user',JSON.stringify(data.user));
            showAlert('Login successful!','success');
            setTimeout(()=>{ window.location.href=data.user.role==='admin'?'/admin':'/'; },1000);
        } else {
            showAlert(data.message||'Login failed','error');
        }
    } catch (err) {
        console.error('Login error:',err);
        showAlert('Error during login','error');
    } finally{
        btn.disabled=false; btn.classList.remove('loading');
    }
};

// Signup
const handleSignup = async e => {
    e.preventDefault();
    if(!validateForm('signupForm')) return;
    const form=e.target;
    const btn=form.querySelector('button[type="submit"]');
    btn.disabled=true; btn.classList.add('loading');
    const payload = {
        username:form.username.value,
        email:form.email.value,
        password:form.password.value,
        full_name:form.full_name.value
    };
    try {
        const res = await fetch(`${API_URL}/auth/register`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(payload)
        });
        const data=await res.json();
        if(data.success){
            showAlert('Registration successful! Please login.','success');
            setTimeout(()=>window.location.href='/login',1500);
        } else {
            showAlert(data.message||'Registration failed','error');
        }
    } catch (err) {
        console.error('Signup error:',err);
        showAlert('Error during registration','error');
    } finally {
        btn.disabled=false; btn.classList.remove('loading');
    }
};

// Init
document.addEventListener('DOMContentLoaded',()=>{
    initPasswordToggle();
    const pwdInput=document.querySelector('input[name="password"]');
    pwdInput && pwdInput.addEventListener('input',e=>updatePasswordStrength(e.target.value));
    document.getElementById('loginForm')?.addEventListener('submit',handleLogin);
    document.getElementById('signupForm')?.addEventListener('submit',handleSignup);
    document.querySelectorAll('.form-control').forEach(input=>{
        input.addEventListener('input',()=>{
            input.classList.remove('error');
            input.parentElement.querySelector('.error-message')?.classList.remove('show');
        });
    });

    // Add CSS animations
    const style=document.createElement('style');
    style.textContent=`
        @keyframes slideIn {from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes slideOut {from{transform:translateX(0);opacity:1}to{transform:translateX(400px);opacity:0}}
    `;
    document.head.append(style);
});
