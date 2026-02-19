// script.js - Studyme Platform JavaScript (Updated & Fixed)
// Shared across all pages - Admin + Frontend

// ==================== Safe Supabase Initialization ====================
const SUPABASE_URL = 'https://bszfkctapcyhgjdoxtqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzemZrY3RhcGN5aGdqZG94dHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDc2OTksImV4cCI6MjA4Njg4MzY5OX0.5i9eEunzNHeSArGROsTzkQC-LwMtE1CoIxrbshf6BX4';

// Safe global init - only create if not already defined
if (!window.supabase) {
  window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Supabase client initialized globally (shared script.js)');
} else {
  console.log('Supabase client already exists — reusing');
}

// ==================== Auth Functions ====================
async function loginWithGoogle() {
  try {
    const { error } = await window.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/admin.html' // redirect to admin after login
      }
    });
    if (error) throw error;
  } catch (err) {
    console.error('Google login error:', err.message);
    alert('Login failed: ' + err.message);
  }
}

async function logout() {
  try {
    const { error } = await window.supabase.auth.signOut();
    if (error) throw error;
    alert('You have been logged out.');
    updateAuthUI();
  } catch (err) {
    console.error('Logout error:', err.message);
    alert('Logout failed: ' + err.message);
  }
}

// Update UI based on auth state
async function updateAuthUI() {
  const { data: { user } } = await window.supabase.auth.getUser();

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
}

// ==================== Quiz Functionality ====================
function initQuizzes() {
  document.querySelectorAll('.quiz').forEach(quiz => {
    const submitBtn = quiz.querySelector('.quiz-submit');
    const resultEl = quiz.querySelector('.quiz-result');

    if (!submitBtn || !resultEl) return;

    submitBtn.addEventListener('click', () => {
      let score = 0;
      let total = 0;

      quiz.querySelectorAll('.question').forEach(question => {
        const radios = question.querySelectorAll('input[type="radio"]');
        const correctValue = question.dataset.correct;
        let selectedValue = null;

        radios.forEach(radio => {
          if (radio.checked) selectedValue = radio.value;
        });

        total++;

        if (selectedValue === correctValue) {
          score++;
          question.classList.add('correct');
          question.classList.remove('wrong');
        } else if (selectedValue !== null) {
          question.classList.add('wrong');
          question.classList.remove('correct');
        } else {
          question.classList.remove('correct', 'wrong');
        }
      });

      const percentage = Math.round((score / total) * 100);
      resultEl.innerHTML = `
        <strong>${score}/${total} correct (${percentage}%)</strong><br>
        ${percentage >= 80 ? 'Excellent! Keep it up!' : percentage >= 50 ? 'Good effort – review and try again.' : 'More practice needed – you’ve got this!'}
      `;
      resultEl.classList.add('visible');
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

// ==================== Dark Mode Toggle ====================
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

if (localStorage.getItem('darkMode') === 'enabled' ||
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.body.classList.add('dark-mode');
}

// ==================== Initialize on page load ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize quizzes if any exist on the page
  initQuizzes();

  // Check and update auth UI
  await updateAuthUI();

  // Listen for auth state changes (auto-update after login/logout)
  window.supabase.auth.onAuthStateChange(async (event, session) => {
    await updateAuthUI();
  });

  // Attach global event listeners
  document.addEventListener('click', e => {
    if (e.target.matches('#google-login-btn, .login-btn')) {
      e.preventDefault();
      loginWithGoogle();
    }
    if (e.target.matches('#logout-btn')) {
      e.preventDefault();
      logout();
    }
    if (e.target.matches('#dark-mode-toggle')) {
      toggleDarkMode();
    }
  });

  console.log('Studyme shared script loaded successfully');
});