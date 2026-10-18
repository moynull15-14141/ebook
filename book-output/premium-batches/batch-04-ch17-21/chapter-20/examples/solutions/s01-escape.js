const HTML_ESCAPES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

console.log(escapeHtml('Tom & "Jerry" <b>'));
