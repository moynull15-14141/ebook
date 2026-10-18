const THEME_KEY = 'jsm-theme';

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    console.log('থিম সংরক্ষণ করা গেল না');
  }
}

console.log(loadTheme());
saveTheme('dark');
console.log(loadTheme());
localStorage.setItem(THEME_KEY, 'purple');
console.log(loadTheme());
localStorage.removeItem(THEME_KEY);
