const HTML_ESCAPES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

function isSafeLink(url) {
  try {
    const { protocol } = new URL(url, 'https://trip.example');
    return ['https:', 'http:'].includes(protocol);
  } catch {
    return false;
  }
}

const name = 'Rafi" onfocus="window.flag=1';
console.log(`<input value="${escapeHtml(name)}">`);
console.log(`<p>${escapeHtml('বাজেট <15000 & দুটি রুম')}</p>`);
console.log(`/search?q=${encodeURIComponent('Cox & Sylhet = সাগর')}`);
console.log(isSafeLink('javascript:alert(1)'), isSafeLink('/trips/7'));
