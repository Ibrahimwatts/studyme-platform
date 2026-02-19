// script.js - Studyme Platform JavaScript (FINAL ROBUST VERSION)

const SUPABASE_URL = 'https://bszfkctapcyhgjdoxtqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzemZrY3RhcGN5aGdqZG94dHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDc2OTksImV4cCI6MjA4Njg4MzY5OX0.5i9eEunzNHeSArGROsTzkQC-LwMtE1CoIxrbshf6BX4';

// Robust global Supabase initialization
function initSupabase() {
  if (typeof supabase === 'undefined') {
    console.error('Supabase CDN not loaded. Make sure <script src="https://unpkg.com/@supabase/supabase-js@2"></script> is in <head>');
    return false;
  }

  if (!window.supabase) {
    try {
      window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('SUCCESS: Supabase client created globally');
      return true;
    } catch (err) {
      console.error('Failed to create Supabase client:', err.message);
      return false;
    }
  }

  console.log('Supabase client already initialized - reusing');
  return true;
}

// Run initialization
initSupabase();

// ==================== Auth Functions ====================
async function loginWithGoogle() {
  if (!window.supabase) {
    alert('Database not ready. Please refresh.');
    return;
  }
  try {
    const { error } = await window.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/admin.html' }
    });
    if (error) throw error;
  } catch (err) {
    console.error('Login error:', err.message);
    alert('Login failed: ' + err.message);
  }
}

async function logout() {
  if (!window.supabase) return;
  try {
    await window.supabase.auth.signOut();
    alert('Logged out successfully');
    updateAuthUI();
  } catch (err) {
    console.error('Logout error:', err.message);
  }
}

async function updateAuthUI() {
  if (!window.supabase) return;
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    // ... your existing UI update code ...
  } catch (err) {
    console.error('updateAuthUI failed:', err);
  }
}

// ==================== Data Fetch Helpers ====================
async function fetchRevisionNotes(subject = null) {
  if (!window.supabase) return [];
  try {
    let query = window.supabase.from('revision_notes').select('*').order('created_at', { ascending: false });
    if (subject) query = query.ilike('subject', `%${subject}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchRevisionNotes error:', err.message);
    return [];
  }
}

// ==================== Other functions (quizzes, dark mode, etc.) remain the same as your previous version ====================

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  initSupabase(); // retry just in case
  await updateAuthUI();

  console.log('Studyme shared script loaded successfully');
});