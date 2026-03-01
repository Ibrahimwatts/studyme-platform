// script.js - Studyme Platform JavaScript
// FINAL VERSION: aggressive logout + guaranteed immediate redirect to index.html

const SUPABASE_URL = 'https://bszfkctapcyhgjdoxtqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzemZrY3RhcGN5aGdqZG94dHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDc2OTksImV4cCI6MjA4Njg4MzY5OX0.5i9eEunzNHeSArGROsTzkQC-LwMtE1CoIxrbshf6BX4';

// Global Supabase client
let supabaseClient = null;

function initializeSupabase() {
  if (window.supabaseClient) {
    console.log('[script.js] Supabase already initialized - reusing client');
    return window.supabaseClient;
  }

  if (typeof supabase === 'undefined') {
    console.error('[script.js] Supabase library not loaded. Check <script> in <head>');
    return null;
  }

  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
    console.log('[script.js] SUCCESS: Supabase client initialized globally');
    return supabaseClient;
  } catch (err) {
    console.error('[script.js] Failed to initialize Supabase:', err.message || err);
    return null;
  }
}

// Initialize immediately
initializeSupabase();

// ==================== Auth Functions ====================
async function loginWithGoogle() {
  const client = initializeSupabase();
  if (!client) {
    alert('Database connection not ready. Please refresh.');
    return;
  }

  try {
    console.log('[loginWithGoogle] Starting Google OAuth flow...');
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/home.html'
      }
    });

    if (error) throw error;
  } catch (err) {
    console.error('[loginWithGoogle] Error:', err.message || err);
    alert('Login failed: ' + (err.message || 'Unknown error'));
  }
}

// Aggressive logout with guaranteed redirect
async function logout() {
  console.log('[logout] Logout button clicked - starting full logout...');

  const client = initializeSupabase();
  if (!client) {
    console.warn('[logout] Supabase client not available');
    window.location.replace('/');
    return;
  }

  try {
    // 1. Sign out from Supabase
    const { error } = await client.auth.signOut();
    if (error) {
      console.warn('[logout] Supabase signOut failed:', error.message);
    } else {
      console.log('[logout] Supabase signOut successful');
    }

    // 2. Clear ALL possible Supabase storage keys
    const hostnameKey = 'sb-' + new URL(SUPABASE_URL).hostname + '-auth-token';
    localStorage.removeItem(hostnameKey);
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refresh_token');
    sessionStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.refresh_token');

    // 3. Nuclear option: wipe ALL local & session storage
    localStorage.clear();
    sessionStorage.clear();

    console.log('[logout] All storage cleared successfully');

    // 4. Force immediate redirect to index.html (landing page)
    console.log('[logout] Redirecting to index.html ...');
    window.location.replace('/');   // Main redirect

    // 5. Extra fallback - reload after 300ms to break any cache/session
    setTimeout(() => {
      console.log('[logout] Fallback reload triggered');
      window.location.reload(true);
    }, 300);
  } catch (err) {
    console.error('[logout] Critical error during logout:', err);
    // Even if error, force redirect anyway
    window.location.replace('/');
  }
}

async function updateAuthUI() {
  const client = initializeSupabase();
  if (!client) return;

  try {
    const { data: { user } } = await client.auth.getUser();

    const loginBtns = document.querySelectorAll('.login-btn');
    const logoutBtns = document.querySelectorAll('#signout-btn, .logout-btn');
    const userGreetings = document.querySelectorAll('#welcome-msg, .user-greeting');

    if (user) {
      loginBtns.forEach(btn => (btn.style.display = 'none'));
      logoutBtns.forEach(btn => {
        btn.style.display = 'inline-block';
        if (btn.classList) btn.classList.remove('hidden');
      });
      
      const name = user.user_metadata?.full_name || user.email.split('@')[0];
      userGreetings.forEach(greeting => {
        greeting.textContent = `Welcome, ${name}`;
        greeting.style.display = 'inline';
        if (greeting.classList) greeting.classList.remove('hidden');
      });

      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.location.href = '/home.html';
      }
    } else {
      loginBtns.forEach(btn => (btn.style.display = 'inline-block'));
      logoutBtns.forEach(btn => {
        btn.style.display = 'none';
        if (btn.classList) btn.classList.add('hidden');
      });
      userGreetings.forEach(greeting => {
        greeting.style.display = 'none';
        if (greeting.classList) greeting.classList.add('hidden');
      });

      if (window.location.pathname.includes('/home.html') || 
          window.location.pathname.includes('/dashboard.html') || 
          window.location.pathname.includes('/admin.html')) {
        window.location.href = '/';
      }
    }
  } catch (err) {
    console.error('updateAuthUI failed:', err.message || err);
  }
}

// ==================== Force clear session on login/landing pages ====================
document.addEventListener('DOMContentLoaded', async () => {
  initializeSupabase();

  // Force logout lingering sessions on login/landing pages
  if (window.location.pathname.includes('/login.html') || 
      window.location.pathname === '/' || 
      window.location.pathname === '/index.html') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Lingering session found on login/landing → signing out');
        await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      }
    } catch (err) {
      console.warn('Session check failed:', err);
    }
  }

  if (window.supabaseClient) {
    await updateAuthUI();

    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('[auth change]', event);
      await updateAuthUI();
      
      if (event === 'SIGNED_IN') {
        window.location.href = '/home.html';
      } else if (event === 'SIGNED_OUT') {
        console.log('[auth change] SIGNED_OUT → forcing redirect');
        window.location.replace('/');
      }
    });
  }

  // Global handler for Sign Out button (works on home.html and any other page)
  const signoutBtn = document.getElementById('signout-btn');
  if (signoutBtn) {
    console.log('[script.js] Found #signout-btn - attaching listener');
    signoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('[signout-btn] Clicked - starting logout');
      await logout();  // This MUST trigger redirect automatically
    });
  } else {
    console.warn('[script.js] No #signout-btn found on this page');
  }

  console.log('Studyme shared script loaded');
});

// ==================== Data Fetch Helpers (unchanged) ====================
async function fetchRevisionNotes(subject = null) {
  const client = initializeSupabase();
  if (!client) return [];

  try {
    let query = client.from('revision_notes').select('*').order('created_at', { ascending: false });
    if (subject && subject !== 'all') {
      query = query.ilike('subject', `%${subject}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchRevisionNotes error:', err.message || err);
    return [];
  }
}

async function fetchVideoLessons(subject = null) {
  const client = initializeSupabase();
  if (!client) return [];

  try {
    let query = client.from('video_lessons').select('*').order('created_at', { ascending: false });
    if (subject && subject !== 'all') {
      query = query.ilike('subject', `%${subject}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchVideoLessons error:', err.message || err);
    return [];
  }
}