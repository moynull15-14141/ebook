const $ = id => document.getElementById(id);
function renderPreview(text, query) {
  const parent = $('preview'); parent.replaceChildren();
  const matches = TextTools.search(text, query);
  if (!matches.length) { parent.textContent = text; return; }
  let cursor = 0;
  for (const { index, text: matched } of matches) {
    parent.append(document.createTextNode(text.slice(cursor, index)));
    const mark = document.createElement('mark'); mark.textContent = matched; parent.append(mark);
    cursor = index + matched.length;
  }
  parent.append(document.createTextNode(text.slice(cursor)));
}
function render() {
  try {
    const content = $('content').value;
    const query = $('query').value;
    const max = Number($('max').value);
    const report = TextTools.analyze(content, query);
    $('words').textContent = report.wordCount;
    $('chars').textContent = report.characterCount;
    $('graphemes').textContent = report.graphemeCount;
    $('matches').textContent = report.matches.length;
    $('slug').textContent = report.slug || '(empty)';
    $('excerpt').textContent = TextTools.excerpt(content, max);
    const list = $('frequency'); list.replaceChildren();
    for (const [word, count] of report.frequency) {
      const li = document.createElement('li'); li.textContent = `${word} — ${count}`; list.append(li);
    }
    renderPreview(TextTools.normalize(content), query);
    $('notice').textContent = 'Analysis complete';
  } catch (error) { $('notice').textContent = error.message; }
}
$('analyze').addEventListener('click', render);
$('copySlug').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(TextTools.slugify($('content').value)); $('notice').textContent = 'Slug copied'; }
  catch { $('notice').textContent = 'Clipboard unavailable. Select the slug and copy manually.'; }
});
render();
