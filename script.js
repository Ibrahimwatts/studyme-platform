// script.js - Shared Studyme Logic
const SUPABASE_URL = 'https://bszfkctapcyhgjdoxtqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzemZrY3RhcGN5aGdqZG94dHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDc2OTksImV4cCI6MjA4Njg4MzY5OX0.5i9eEunzNHeSArGROsTzkQC-LwMtE1CoIxrbshf6BX4';

// 1. SAFE INITIALIZATION
if (typeof supabase !== 'undefined') {
    if (!window.supabase || !window.supabase.from) {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully.');
    }
} else {
    // This handles the error you see in your screenshot
    console.error('Supabase library not detected. Ensure the CDN link is in your HTML head.');
}

// 2. AUTH UI Logic
async function updateAuthUI() {
  if (!window.supabase || !window.supabase.auth) return;
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    const loginBtns = document.querySelectorAll('.login-btn');
    const logoutBtns = document.querySelectorAll('.logout-btn');

    if (user) {
      loginBtns.forEach(b => b.style.display = 'none');
      logoutBtns.forEach(b => b.style.display = 'inline-block');
    } else {
      loginBtns.forEach(b => b.style.display = 'inline-block');
      logoutBtns.forEach(b => b.style.display = 'none');
    }
  } catch (e) { console.warn("Auth check skipped"); }
}

// 3. EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    if (window.supabase && window.supabase.auth) {
        window.supabase.auth.onAuthStateChange(() => updateAuthUI());
    }
});
