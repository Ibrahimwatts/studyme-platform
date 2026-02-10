// script.js - Studyme Platform JavaScript
// Shared across all pages

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
          // No answer selected → neutral
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

// ==================== Simple "Login" Simulation ====================
function simulateLogin(role = 'student') {
  // In real app → replace with Netlify Identity / Supabase / Firebase Auth
  const user = {
    name: role === 'teacher' ? 'Teacher Jane' : 'Student Ibrahim',
    role: role,
    loggedIn: true,
    timestamp: new Date().toISOString()
  };

  localStorage.setItem('studyme_user', JSON.stringify(user));
  updateAuthUI();
  alert(`Welcome, ${user.name}! (${user.role} mode)`);
}

function logout() {
  localStorage.removeItem('studyme_user');
  updateAuthUI();
  alert('You have been logged out.');
}

function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem('studyme_user'));

  // Update login/logout buttons (you can add these in HTML)
  const loginBtns = document.querySelectorAll('.login-btn, .student-login, .teacher-login');
  const logoutBtns = document.querySelectorAll('.logout-btn');
  const userGreeting = document.querySelector('.user-greeting');

  if (user && user.loggedIn) {
    loginBtns.forEach(btn => btn.style.display = 'none');
    logoutBtns.forEach(btn => btn.style.display = 'inline-block');
    if (userGreeting) {
      userGreeting.textContent = `Welcome, ${user.name}`;
      userGreeting.style.display = 'inline';
    }
  } else {
    loginBtns.forEach(btn => btn.style.display = 'inline-block');
    logoutBtns.forEach(btn => btn.style.display = 'none');
    if (userGreeting) userGreeting.style.display = 'none';
  }
}

// ==================== Dark Mode Toggle (optional) ====================
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

// Load saved preference
if (localStorage.getItem('darkMode') === 'enabled' ||
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.body.classList.add('dark-mode');
}

// ==================== Initialize on page load ====================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize quizzes if any exist on the page
  initQuizzes();

  // Update UI based on auth state
  updateAuthUI();

  // Attach global event listeners (example)
  document.addEventListener('click', e => {
    if (e.target.matches('.logout-btn')) {
      e.preventDefault();
      logout();
    }
    if (e.target.matches('#dark-mode-toggle')) {
      toggleDarkMode();
    }
  });
});

// Export functions if using modules later
// export { simulateLogin, logout, initQuizzes };