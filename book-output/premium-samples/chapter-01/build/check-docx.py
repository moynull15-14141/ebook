# Independent structural check of the chapter DOCX using only the Python standard library.
# Usage: python -I build/check-docx.py JavaScript_Mastery_Chapter_01_Premium.docx chapter-01-premium.md
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
docx_path, md_path = sys.argv[1], sys.argv[2]
sys.stdout.reconfigure(encoding='utf-8')
failures = []


def check(label, ok, detail=''):
    print(('PASS  ' if ok else 'FAIL  ') + label + (f'  [{detail}]' if detail else ''))
    if not ok:
        failures.append(label)


with zipfile.ZipFile(docx_path) as z:
    check('ZIP CRC check', z.testzip() is None)
    names = z.namelist()
    for n in names:
        if n.endswith('.xml') or n.endswith('.rels'):
            ET.fromstring(z.read(n))  # raises on malformed XML
    check('all XML parts are well-formed', True, f'{len(names)} parts')
    doc = ET.fromstring(z.read('word/document.xml'))
    styles = ET.fromstring(z.read('word/styles.xml'))
    rels = z.read('word/_rels/document.xml.rels').decode('utf-8')
    targets = re.findall(r'Target="([^"]+)"', rels)
    missing = [t for t in targets if 'word/' + t not in names]
    check('every relationship target exists in the package', not missing, ', '.join(missing))
    images = [n for n in names if n.startswith('word/media/')]
    check('figure image is embedded', len(images) == 1, ', '.join(images))

defined = {s.get(W + 'styleId') for s in styles.iter(W + 'style')}
used = {e.get(W + 'val') for e in doc.iter(W + 'pStyle')} | {e.get(W + 'val') for e in doc.iter(W + 'rStyle')}
check('no undefined styles are used', not (used - defined), ', '.join(sorted(used - defined)))

body = doc.find(W + 'body')
by_style = {}
for p in body.iter(W + 'p'):
    st = p.find(f'{W}pPr/{W}pStyle')
    sid = st.get(W + 'val') if st is not None else 'Normal'
    by_style.setdefault(sid, []).append(''.join(t.text or '' for t in p.iter(W + 't')))

md = open(md_path, encoding='utf-8').read()
md_h2 = [re.sub(r'`', '', h) for h in re.findall(r'^## (.+)$', md, re.M)]
md_h3 = re.findall(r'^### (.+)$', md, re.M)
docx_h2 = by_style.get('Heading2', []) + by_style.get('PanelHeading', [])
check('chapter title is a Heading 1', len(by_style.get('Heading1', [])) == 1, by_style.get('Heading1', [''])[0])
check('every H2 section of the Markdown is present', sorted(md_h2) == sorted(docx_h2), f'{len(docx_h2)} of {len(md_h2)}')
check('every H3 subsection of the Markdown is present', len(by_style.get('Heading3', [])) == len(md_h3), f"{len(by_style.get('Heading3', []))} of {len(md_h3)}")
md_code = len(re.findall(r'^```\w', md, re.M))
check('every code block has a caption', len(by_style.get('CodeCaption', [])) == md_code, f"{len(by_style.get('CodeCaption', []))} of {md_code}")
md_code_lines = sum(len(b.split('\n')) for b in re.findall(r'^```\w[^\n]*\n(.*?)\n```', md, re.M | re.S))
docx_code_lines = sum(len(by_style.get(s, [])) for s in ('Code', 'CodeOutput', 'CodeError', 'CodeTerminal'))
check('code line count matches the Markdown', docx_code_lines == md_code_lines, f'{docx_code_lines} of {md_code_lines}')
md_tables = len(re.findall(r'^\s*\|\s*:?-{2,}', md, re.M))
check('table count matches the Markdown', len(list(body.iter(W + 'tbl'))) == md_tables, f"{len(list(body.iter(W + 'tbl')))} of {md_tables}")

text = ''.join(t.text or '' for t in doc.iter(W + 't'))
questions = re.findall(r'প্রশ্ন [০-৯]+\.', text)
check('10 MCQs present', len(questions) == 10, str(len(questions)))
check('40 MCQ options present', len(re.findall(r'^[কখগঘ]\) ', '\n'.join(by_style.get('ListBullet', [])), re.M)) == 40)
# Code must survive character-for-character: compare one full project file.
app_js = open('project/interactive-greeting-app/app.js', encoding='utf-8').read().rstrip('\n').split('\n')
code_text = by_style.get('Code', [])
start = next((i for i in range(len(code_text)) if code_text[i:i + len(app_js)] == app_js), None)
check('app.js listing is identical to the real project file', start is not None, f'{len(app_js)} lines')
for term in ['DRAFT', 'TODO', 'RECONSTRUCTED', 'Lorem']:
    check(f'no "{term}" placeholder text', term not in text)
print(f'characters of text: {len(text)}')
print('paragraphs by style:', {k: len(v) for k, v in sorted(by_style.items(), key=lambda kv: -len(kv[1]))})
sys.exit(1 if failures else 0)
