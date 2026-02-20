// script.js - Studyme Platform JavaScript (UPDATED: aggressive logout + no auto-login after signout)

const SUPABASE_URL = 'https://bszfkctapcyhgjdoxtqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzemZrY3RhcGN5aGdqZG94dHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDc2OTksImV4cCI6MjA4Njg4MzY5OX0.5i9eEunzNHeSArGROsTzkQC-LwMtE1CoIxrbshf6BX4';

// Global Supabase client
let supabaseClient = null;

function initializeSupabase() {
  if (window.supabaseClient) {
    console.log('Supabase already initialized - reusing existing client');
    return window.supabaseClient;
  }

  if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded. Check CDN script in <head>');
    return null;
  }

  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
    console.log('SUCCESS: Supabase client initialized globally');
    return supabaseClient;
  } catch (err) {
    console.error('Failed to initialize Supabase:', err.message || err);
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
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/home.html'
      }
    });

    if (error) throw error;
  } catch (err) {
    console.error('Google login error:', err.message || err);
    alert('Login failed: ' + (err.message || 'Unknown error'));
  }
}

// Aggressive logout - clears everything so no auto-sign-in happens later
async function logout() {
  const client = initializeSupabase();
  if (!client) return;

  try {
    // Sign out from Supabase
    const { error } = await client.auth.signOut();
    if (error) throw error;

    // Manually wipe Supabase tokens from storage
    localStorage.removeItem('sb-' + new URL(SUPABASE_URL).hostname + '-auth-token');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refresh_token');
    sessionStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.refresh_token');

    // Optional: clear all storage (uncomment if you want nuclear option)
    // localStorage.clear();
    // sessionStorage.clear();

    console.log('Logout successful - session fully cleared');

    // Force redirect to landing page
    window.location.href = '/';  // or '/index.html'
  } catch (err) {
    console.error('Logout failed:', err.message || err);
    alert('Logout failed: ' + (err.message || 'Unknown error'));
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
      logoutBtns.forEach(btn => (btn.style.display = 'inline-block' || btn.classList.remove('hidden')));
      
      const name = user.user_metadata?.full_name || user.email.split('@')[0];
      userGreetings.forEach(greeting => {
        greeting.textContent = `Welcome, ${name}`;
        greeting.style.display = 'inline' || greeting.classList.remove('hidden');
      });

      // If on landing (index.html or /), redirect to home
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.location.href = '/home.html';
      }
    } else {
      loginBtns.forEach(btn => (btn.style.display = 'inline-block'));
      logoutBtns.forEach(btn => (btn.style.display = 'none' || btn.classList.add('hidden')));
      userGreetings.forEach(greeting => greeting.style.display = 'none' || greeting.classList.add('hidden'));

      // If on protected page, redirect to landing
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

  // On login page or landing → ensure no lingering session
  if (window.location.pathname.includes('/login.html') || 
      window.location.pathname === '/' || 
      window.location.pathname === '/index.html') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Lingering session found on login/landing → signing out');
        await supabase.auth.signOut();
        localStorage.removeItem('sb-' + new URL(SUPABASE_URL).hostname + '-auth-token');
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload(); // refresh to show clean login page
      }
    } catch (err) {
      console.warn('Session check failed:', err);
    }
  }

  if (window.supabaseClient) {
    await updateAuthUI();

    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      await updateAuthUI();
      
      if (event === 'SIGNED_IN') {
        window.location.href = '/home.html';
      } else if (event === 'SIGNED_OUT') {
        window.location.href = '/';
      }
    });
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