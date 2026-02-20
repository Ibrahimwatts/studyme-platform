// script.js - Studyme Platform JavaScript (FINAL WORKING VERSION - Optimized & Clean)

const SUPABASE_URL = 'https://bszfkctapcyhgjdoxtqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzemZrY3RhcGN5aGdqZG94dHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDc2OTksImV4cCI6MjA4Njg4MzY5OX0.5i9eEunzNHeSArGROsTzkQC-LwMtE1CoIxrbshf6BX4';

// Global Supabase client
let supabaseClient = null;

function initializeSupabase() {
  if (window.supabaseClient) {
    console.log('Supabase already initialized - reusing');
    return window.supabaseClient;
  }

  if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded from CDN. Ensure <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script> is in <head>');
    return null;
  }

  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabaseClient;
    console.log('SUCCESS: Supabase client initialized globally');
    return supabaseClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err.message || err);
    return null;
  }
}

// Initialize immediately
initializeSupabase();

// ==================== Auth Functions ====================
async function loginWithGoogle() {
  const client = initializeSupabase();
  if (!client) {
    alert('Database connection not ready. Please refresh the page.');
    return;
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/admin.html' }
    });

    if (error) throw error;
  } catch (err) {
    console.error('Login error:', err.message || err);
    alert('Login failed: ' + (err.message || 'Unknown error'));
  }
}

async function logout() {
  const client = initializeSupabase();
  if (!client) return;

  try {
    await client.auth.signOut();
    alert('Logged out successfully');
    updateAuthUI();
  } catch (err) {
    console.error('Logout error:', err.message || err);
  }
}

async function updateAuthUI() {
  const client = initializeSupabase();
  if (!client) return;

  try {
    const { data: { user } } = await client.auth.getUser();

    const loginBtns = document.querySelectorAll('.login-btn');
    const logoutBtns = document.querySelectorAll('.logout-btn');
    const userGreeting = document.querySelector('.user-greeting');

    if (user) {
      loginBtns.forEach(btn => btn.style.display = 'none');
      logoutBtns.forEach(btn => btn.style.display = 'inline-block');
      const name = user.user_metadata?.full_name || user.email.split('@')[0];
      if (userGreeting) {
        userGreeting.textContent = `Welcome, ${name}`;
        userGreeting.style.display = 'inline';
      }
    } else {
      loginBtns.forEach(btn => btn.style.display = 'inline-block');
      logoutBtns.forEach(btn => btn.style.display = 'none');
      if (userGreeting) userGreeting.style.display = 'none';
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
    if (subject) {
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
    if (subject) {
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

// ==================== UI Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Ensure client is ready
  initializeSupabase();

  // Update UI on load
  if (window.supabaseClient) {
    await updateAuthUI();
    window.supabaseClient.auth.onAuthStateChange(() => updateAuthUI());
  }

  console.log('Studyme shared script loaded');
});