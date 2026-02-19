// script.js - Studyme Platform Shared Script
const SUPABASE_URL = 'https://bszfkctapcyhgjdoxtqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzemZrY3RhcGN5aGdqZG94dHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDc2OTksImV4cCI6MjA4Njg4MzY5OX0.5i9eEunzNHeSArGROsTzkQC-LwMtE1CoIxrbshf6BX4';

// Initialize Supabase Client globally
if (typeof supabase !== 'undefined') {
  if (!window.supabase || !window.supabase.from) {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully.');
  }
} else {
  console.error('Supabase library not detected. Ensure the CDN link is in your HTML head.');
}

// ==================== Auth Functions ====================
async function loginWithGoogle() {
  if (!window.supabase) return;
  try {
    const { error } = await window.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/admin.html' }
    });
    if (error) throw error;
  } catch (err) {
    console.error('Login error:', err.message);
  }
}

async function logout() {
  if (!window.supabase) return;
  try {
    await window.supabase.auth.signOut();
    updateAuthUI();
  } catch (err) {
    console.error('Logout error:', err.message);
  }
}

async function updateAuthUI() {
  // Safety check to prevent "Cannot read properties of undefined (reading 'getUser')"
  if (!window.supabase || !window.supabase.auth) return;

  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    const loginBtns = document.querySelectorAll('.login-btn');
    const logoutBtns = document.querySelectorAll('.logout-btn');

    if (user) {
      loginBtns.forEach(btn => btn.style.display = 'none');
      logoutBtns.forEach(btn => btn.style.display = 'inline-block');
    } else {
      loginBtns.forEach(btn => btn.style.display = 'inline-block');
      logoutBtns.forEach(btn => btn.style.display = 'none');
    }
  } catch (err) {
    console.warn('Auth UI update skipped:', err.message);
  }
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
  if (window.supabase && window.supabase.auth) {
    await updateAuthUI();
    window.supabase.auth.onAuthStateChange(() => updateAuthUI());
  }

  document.addEventListener('click', e => {
    if (e.target.matches('.login-btn')) {
      e.preventDefault();
      loginWithGoogle();
    }
    if (e.target.matches('.logout-btn')) {
      e.preventDefault();
      logout();
    }
  });
});
