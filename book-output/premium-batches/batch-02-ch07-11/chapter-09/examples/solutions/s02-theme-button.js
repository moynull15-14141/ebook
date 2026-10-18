const toggle = document.createElement('button');
toggle.id = 'theme';
toggle.type = 'button';
toggle.textContent = 'থিম বদলান';
document.body.append(toggle);

toggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  console.log(isDark ? 'Dark' : 'Light');
});
