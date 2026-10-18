let ownEvents = 0;
window.addEventListener('storage', () => {
  ownEvents += 1;
});

document.querySelector('#other').addEventListener('load', () => {
  localStorage.setItem('last-update', '10:30');
  setTimeout(() => {
    console.log(`এই Page নিজে Event পেয়েছে ${ownEvents} বার`);
    localStorage.removeItem('last-update');
  }, 200);
});
