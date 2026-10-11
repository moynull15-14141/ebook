# Opens the generated DOCX in Microsoft Word, updates the TOC field (real page numbers),
# saves, then reports statistics and exports a PDF render for visual checks.
# Each step is appended to the log immediately, so a stuck step is identifiable.
# Usage: powershell -File finalize-docx.ps1 [-NoTocUpdate]
param([switch]$NoTocUpdate)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$docx = Join-Path (Split-Path -Parent $here) 'JavaScript_Mastery_Draft_Edition.docx'
$verifyPdf = Join-Path $here 'work\docx-verify.pdf'
$log = Join-Path $here 'work\docx-finalize.log'
Set-Content -Path $log -Value "finalize started $(Get-Date -Format s)" -Encoding UTF8
$sw = [Diagnostics.Stopwatch]::StartNew()
function T($m) { Add-Content -Path $log -Value ("{0,6:N1}s  {1}" -f $sw.Elapsed.TotalSeconds, $m) -Encoding UTF8 }

$w = New-Object -ComObject Word.Application
$w.Visible = $false; $w.DisplayAlerts = 0
try {
  T 'word started'
  $d = $w.Documents.Open($docx, $false, [bool]$NoTocUpdate)
  T "opened: paragraphs=$($d.Paragraphs.Count) tables=$($d.Tables.Count) sections=$($d.Sections.Count)"
  T "pages=$($d.ComputeStatistics(2)) words=$($d.ComputeStatistics(0))"
  if (-not $NoTocUpdate) {
    $toc = $d.TablesOfContents.Item(1)
    $toc.Update()
    T "TOC updated: entries=$($toc.Range.Paragraphs.Count)"
    $d.Save()
    T 'saved'
  }
  T "TOC fields=$($d.TablesOfContents.Count) pages after=$($d.ComputeStatistics(2))"
  $d.Close($false)
  # The visual-check render is done separately by render-docx-check.ps1: exporting to PDF from this
  # same Word session hangs on this machine.
  T 'DONE'
} catch {
  T "ERROR: $($_.Exception.Message)"
  throw
} finally {
  try { foreach ($doc in @($w.Documents)) { $doc.Close($false) } } catch {}
  $w.Quit()
}
