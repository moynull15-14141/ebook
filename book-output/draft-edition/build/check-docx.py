# Independent integrity check of the DOCX using only the Python standard library.
# Usage: python -I check-docx.py <file.docx>
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
path = sys.argv[1]
sys.stdout.reconfigure(encoding='utf-8')

with zipfile.ZipFile(path) as z:
    bad = z.testzip()
    print('zip CRC check:', 'OK' if bad is None else f'CORRUPT MEMBER {bad}')
    names = z.namelist()
    print('parts:', len(names))
    for n in names:
        if n.endswith('.xml') or n.endswith('.rels'):
            ET.fromstring(z.read(n))  # raises on malformed XML
    print('all XML parts well-formed: OK')
    doc = ET.fromstring(z.read('word/document.xml'))
    styles = ET.fromstring(z.read('word/styles.xml'))

defined = {s.get(W + 'styleId') for s in styles.iter(W + 'style')}
used = {e.get(W + 'val') for e in doc.iter(W + 'pStyle')} | {e.get(W + 'val') for e in doc.iter(W + 'rStyle')}
print('undefined styles used:', sorted(used - defined) or 'none')

body = doc.find(W + 'body')
h1, counts = [], {}
for p in body.iter(W + 'p'):
    st = p.find(f'{W}pPr/{W}pStyle')
    sid = st.get(W + 'val') if st is not None else 'Normal'
    counts[sid] = counts.get(sid, 0) + 1
    if sid == 'Heading1':
        h1.append(''.join(t.text or '' for t in p.iter(W + 't')))
print('paragraphs by style:', dict(sorted(counts.items(), key=lambda kv: -kv[1])))
print('tables:', len(list(body.iter(W + 'tbl'))))

BN = '০১২৩৪৫৬৭৮৯'
chapters = [h for h in h1 if re.match(r'^অধ্যায়\s*[০-৯]+ — ', h.replace('য়', 'য়'))]
nums = [int(''.join(str(BN.index(c)) for c in re.findall(r'[০-৯]', h.split(' — ')[0]))) for h in chapters]
print('Heading 1 total:', len(h1), '| chapter headings:', len(chapters))
print('chapter numbers in order 1..30:', nums == list(range(1, 31)))
text = ''.join(t.text or '' for t in doc.iter(W + 't'))
print('characters of text:', len(text))
for term in ['EDITORIAL STATUS', 'RECONSTRUCTED', 'Editorial note', 'TOC_PLACEHOLDER', 'ZIP']:
    print(f'  occurrences of "{term}":', text.count(term))
for term in ['Moynul Hasan', '01745334044', 'Daffodil International University', 'M&N Holidays', 'Bogura, Bangladesh']:
    print(f'  author detail "{term}":', text.count(term))
print('first headings:', h1[:4])
print('last heading:', h1[-1])
