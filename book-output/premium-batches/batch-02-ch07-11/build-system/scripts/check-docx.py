# Independent structural check of a chapter DOCX using only the Python standard library
# (a different ZIP and XML implementation from the one that wrote the file).
# Usage: python -I scripts/check-docx.py <chapter-dir>
import json
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
chapter_dir = os.path.abspath(sys.argv[1])
system = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(chapter_dir, 'chapter.json'), encoding='utf-8'))
tokens = json.load(open(os.path.join(system, 'config', 'design-tokens.json'), encoding='utf-8'))
rules = json.load(open(os.path.join(system, 'config', 'chapter-rules.json'), encoding='utf-8'))
docx_path = os.path.join(chapter_dir, cfg['outputBase'] + '.docx')
md = open(os.path.join(chapter_dir, cfg['source']), encoding='utf-8').read().replace('\r\n', '\n')
sys.stdout.reconfigure(encoding='utf-8')
failures = []


def check(label, ok, detail=''):
    print(('PASS  ' if ok else 'FAIL  ') + label + (f'  [{detail}]' if detail else ''))
    if not ok:
        failures.append(label)


with zipfile.ZipFile(docx_path) as z:
    check('ZIP integrity (CRC of every part)', z.testzip() is None)
    names = z.namelist()
    for n in names:
        if n.endswith('.xml') or n.endswith('.rels'):
            ET.fromstring(z.read(n))  # raises on malformed XML
    check('every XML part is well-formed', True, f'{len(names)} package parts')
    doc = ET.fromstring(z.read('word/document.xml'))
    styles = ET.fromstring(z.read('word/styles.xml'))
    styles_raw = z.read('word/styles.xml').decode('utf-8')
    header = ''.join(t.text or '' for t in ET.fromstring(z.read('word/header1.xml')).iter(W + 't'))
    rels = z.read('word/_rels/document.xml.rels').decode('utf-8')
    missing = [t for t in re.findall(r'Target="([^"]+)"', rels) if 'word/' + t not in names]
    check('every relationship target exists in the package', not missing, ', '.join(missing))
    images = [n for n in names if n.startswith('word/media/')]
    md_images = len(re.findall(r'^!\[[^\]]*\]\([^)]+\)', md, re.M))
    check('figures are embedded', len(images) == md_images, f'{len(images)} of {md_images}')

defined = {s.get(W + 'styleId') for s in styles.iter(W + 'style')}
used = {e.get(W + 'val') for e in doc.iter(W + 'pStyle')} | {e.get(W + 'val') for e in doc.iter(W + 'rStyle')}
check('no undefined styles are used', not (used - defined), ', '.join(sorted(used - defined)))
body_font = tokens['fonts']['body']['family']
mono_font = tokens['fonts']['mono'].get('docxFamily', tokens['fonts']['mono']['family'])
named = set(re.findall(r'w:ascii="([^"]+)"', styles_raw))
check('styles name only the design-system fonts', named <= {body_font, mono_font}, ', '.join(sorted(named)))

body = doc.find(W + 'body')
by_style = {}
for p in body.iter(W + 'p'):
    st = p.find(f'{W}pPr/{W}pStyle')
    sid = st.get(W + 'val') if st is not None else 'Normal'
    by_style.setdefault(sid, []).append(''.join(t.text or '' for t in p.iter(W + 't')))
n = lambda *ids: sum(len(by_style.get(i, [])) for i in ids)

md_h2 = [re.sub(r'`', '', h).strip() for h in re.findall(r'^## (.+)$', md, re.M)]
md_h3 = re.findall(r'^### (.+)$', md, re.M)
docx_h2 = by_style.get('Heading2', []) + by_style.get('PanelHeading', [])
check('the chapter title is the only Heading 1', n('Heading1') == 1, by_style.get('Heading1', [''])[0])
check('every H2 section is a Word heading', sorted(md_h2) == sorted(docx_h2), f'{len(docx_h2)} of {len(md_h2)}')
check('every H3 subsection is a Word heading', n('Heading3', 'ExerciseLevel') == len(md_h3), f"{n('Heading3', 'ExerciseLevel')} of {len(md_h3)}")
levels = by_style.get('ExerciseLevel', [])
check('exercise levels use the Exercise Level style', levels == rules['exerciseLevels'], ' / '.join(levels))

fences = re.findall(r'^```[\w-]+[^\n]*\n(.*?)\n```', md, re.M | re.S)
check('every code panel has a caption', n('CodeCaption') == len(fences), f"{n('CodeCaption')} of {len(fences)}")
md_lines = sum(len(b.split('\n')) for b in fences)
code_styles = ('Code', 'CodeOutput', 'CodeError', 'CodeTerminal', 'CodeStructure')
check('code line count matches the Markdown', n(*code_styles) == md_lines, f'{n(*code_styles)} of {md_lines}')
# Code must survive character for character: every Markdown code line must exist as a code paragraph.
docx_code = {}
for sid in code_styles:
    for t in by_style.get(sid, []):
        docx_code[t] = docx_code.get(t, 0) + 1
lost = 0
for b in fences:
    for line in b.split('\n'):
        if docx_code.get(line, 0) > 0:
            docx_code[line] -= 1
        else:
            lost += 1
check('every code line is present character for character (indentation included)', lost == 0, f'{md_lines - lost} of {md_lines}')
excerpts = len(re.findall(r'^```[\w-]+[^\n]*\b(?:excerpt|fragment)=', md, re.M))
labelled = sum(1 for c in by_style.get('CodeCaption', []) if 'Selected Excerpt' in c or 'Fragment' in c or 'Part ' in c)
check('excerpts and fragments are labelled in their caption', labelled == excerpts, f'{labelled} of {excerpts}')

md_tables = len(re.findall(r'^\s*\|\s*:?-{2,}', md, re.M))
tables = list(body.iter(W + 'tbl'))
check('table count matches the Markdown', len(tables) == md_tables, f'{len(tables)} of {md_tables}')
check('every table has a repeating header row', all(t.find(f'{W}tr/{W}trPr/{W}tblHeader') is not None for t in tables))
check('no table row may split across pages', all(r.find(f'{W}trPr/{W}cantSplit') is not None for t in tables for r in t.iter(W + 'tr')))

q = rules['mcq']
check(f"{q['questions']} MCQ questions use the MCQ Question style", n('McqQuestion') == q['questions'], str(n('McqQuestion')))
check(f"{q['questions'] * q['optionsPerQuestion']} MCQ options use the MCQ Option style", n('McqOption') == q['questions'] * q['optionsPerQuestion'], str(n('McqOption')))
md_solutions = len(re.findall(rules['solutionPattern'], md, re.M))
check('every solution uses the Solution Label style', n('SolutionLabel') == md_solutions, f"{n('SolutionLabel')} of {md_solutions}")
md_callouts = len(re.findall(r'^> \*\*', md, re.M))
callouts = n('CalloutNote', 'CalloutWarn', 'CalloutTip', 'CalloutRemember')
check('every callout uses a Callout style', callouts >= md_callouts, f'{callouts} paragraphs for {md_callouts} callouts')

text = ''.join(t.text or '' for t in doc.iter(W + 't'))
bn = re.compile(r'[ঀ-৿‌‍]+')
want, got = {}, {}
for w in bn.findall(re.sub(r'^!\[[^\]]*\]\([^)]*\)', '', md, flags=re.M)):
    want[w] = want.get(w, 0) + 1
for p in body.iter(W + 'p'):
    for w in bn.findall(''.join(t.text or '' for t in p.iter(W + 't'))):
        got[w] = got.get(w, 0) + 1
short = sum(max(0, c - got.get(w, 0)) for w, c in want.items())
check('Bengali text is complete and uncorrupted (every source word present)', short == 0, f'{sum(want.values()) - short} of {sum(want.values())} words')
check('running header carries the book and chapter titles', 'JavaScript Mastery' in header and by_style.get('Heading1', [''])[0] in header)
for term in rules['placeholderTerms']:
    check(f'no "{term}" placeholder text', term not in text)
print(f'INFO  characters of text: {len(text)} | paragraphs by style: ' + ', '.join(f'{k} {len(v)}' for k, v in sorted(by_style.items(), key=lambda kv: -len(kv[1]))))
print('\n' + (f'{len(failures)} FAILED' if failures else 'All DOCX checks passed'))
sys.exit(1 if failures else 0)
