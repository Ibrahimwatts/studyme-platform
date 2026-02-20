// script.js - Studyme Platform JavaScript (UPDATED for new routing: index.html → home.html)

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
        redirectTo: window.location.origin + '/home.html'  // Redirect to home.html after login
      }
    });

    if (error) throw error;
  } catch (err) {
    console.error('Google login error:', err.message || err);
    alert('Login failed: ' + (err.message || 'Unknown error'));
  }
}

async function logout() {
  const client = initializeSupabase();
  if (!client) return;

  try {
    await client.auth.signOut();
    alert('Logged out successfully');
    // Redirect to landing page (index.html)
    window.location.href = '/';
  } catch (err) {
    console.error('Logout error:', err.message || err);
    alert('Logout failed: ' + (err.message || 'Unknown error'));
  }
}

async function updateAuthUI() {
  const client = initializeSupabase();
  if (!client) return;

  try {
    const { data: { user } } = await client.auth.getUser();

    // Update all login/logout buttons across pages
    const loginBtns = document.querySelectorAll('.login-btn');
    const logoutBtns = document.querySelectorAll('.logout-btn');
    const userGreetings = document.querySelectorAll('.user-greeting');

    if (user) {
      loginBtns.forEach(btn => (btn.style.display = 'none'));
      logoutBtns.forEach(btn => (btn.style.display = 'inline-block'));
      
      const name = user.user_metadata?.full_name || user.email.split('@')[0];
      userGreetings.forEach(greeting => {
        greeting.textContent = `Welcome, ${name}`;
        greeting.style.display = 'inline';
      });

      // If on landing page (index.html), redirect to home
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.location.href = '/home.html';
      }
    } else {
      loginBtns.forEach(btn => (btn.style.display = 'inline-block'));
      logoutBtns.forEach(btn => (btn.style.display = 'none'));
      userGreetings.forEach(greeting => greeting.style.display = 'none');

      // If on protected page (e.g. home.html), redirect to landing
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

// ==================== Data Fetch Helpers ====================
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

// ==================== UI & Auth Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
  initializeSupabase();

  if (window.supabaseClient) {
    await updateAuthUI();

    // Listen for auth state changes (login/logout/redirect)
    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      await updateAuthUI();
      
      // Auto-redirect logic on auth change
      if (event === 'SIGNED_IN') {
        window.location.href = '/home.html';
      } else if (event === 'SIGNED_OUT') {
        window.location.href = '/';
      }
    });
  }

  console.log('Studyme shared script loaded');
});