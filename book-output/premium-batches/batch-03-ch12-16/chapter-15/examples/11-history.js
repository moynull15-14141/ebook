const params = new URLSearchParams(location.search);
params.set('q', 'javascript');
history.replaceState(null, '', `${location.pathname}?${params}`);
console.log(location.search);

history.pushState({ page: 2 }, '', '?q=javascript&page=2');
console.log(location.search, history.state.page);

window.addEventListener('popstate', (event) => {
  console.log(`Back: ${location.search}, state ${JSON.stringify(event.state)}`);
});
history.back();
