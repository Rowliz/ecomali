// User menu: fetches current user (via /api/auth/me) and renders a small menu in headers
document.addEventListener('DOMContentLoaded', async ()=>{
  // find any header container to attach the menu
  const headers = document.querySelectorAll('header.admin-header, header');
  if(!headers || headers.length===0) return;

  // Attempt to get cached user name
  let user = null;
  try{
    const cached = localStorage.getItem('userInfo');
    if(cached) user = JSON.parse(cached);
  }catch(e){ user = null; }

  async function fetchUser(){
    try{
      const resp = await apiGet('/api/auth/me');
      if(resp && resp.user){
        localStorage.setItem('userInfo', JSON.stringify(resp.user));
        localStorage.setItem('userRole', resp.user.role || localStorage.getItem('userRole'));
        user = resp.user;
      }
    }catch(e){
      // apiGet will handle 401 redirect; ignore otherwise
      console.debug('user-menu: could not fetch /api/auth/me', e);
    }
  }

  if(!user) await fetchUser();

  headers.forEach(h => {
    // create container if not present
    let actions = h.querySelector('.nav-actions');
    if(!actions){
      actions = document.createElement('div');
      actions.className = 'nav-actions';
      h.appendChild(actions);
    }

    // build menu
    const menu = document.createElement('div');
    menu.className = 'user-menu';
    const name = (user && (user.name || user.username)) || 'Account';
    const role = (user && user.role) || (localStorage.getItem('userRole') || '');
    menu.innerHTML = `
      <button class="user-menu-btn">${escapeHtml(name)} <span class="caret">▾</span></button>
      <div class="user-menu-dropdown">
        <div class="user-info"><strong>${escapeHtml(name)}</strong><div class="muted">${escapeHtml(role)}</div></div>
        <a href="/profile.html">My Profile</a>
        <a href="/portal/generator/dashboard.html">My Dashboard</a>
        <a href="/login-signup.html" data-logout>Sign out</a>
      </div>
    `;

    actions.appendChild(menu);

    // simple toggle
    const btn = menu.querySelector('.user-menu-btn');
    const dd = menu.querySelector('.user-menu-dropdown');
    btn.addEventListener('click', ()=> dd.classList.toggle('open'));
    document.addEventListener('click', (ev)=>{ if(!menu.contains(ev.target)) dd.classList.remove('open'); });
  });

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c])); }
});