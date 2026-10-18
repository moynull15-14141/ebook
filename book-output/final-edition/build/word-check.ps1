# Opens the book DOCX in Microsoft Word (read-only), refreshes the table-of-contents field, and records what Word
# reports: page count, number of TOC entries, headings, sections. Exports a temporary PDF for visual inspection.
# The DOCX itself is not saved by Word (it keeps its "update fields on open" setting for readers).
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File build\word-check.ps1 -Docx <docx> -Pdf <pdf> -Log <log>
param([string]$Docx, [string]$Pdf, [string]$Log)
$ErrorActionPreference = 'Stop'
Set-Content $Log 'start' -Encoding utf8
$w = New-Object -ComObject Word.Application
$w.Visible = $false; $w.DisplayAlerts = 0
try {
  $d = $w.Documents.Open($Docx, $false, $true)
  Add-Content $Log "opened" -Encoding utf8
  Add-Content $Log "sections=$($d.Sections.Count)" -Encoding utf8
  Add-Content $Log "tocs=$($d.TablesOfContents.Count)" -Encoding utf8
  if ($d.TablesOfContents.Count -gt 0) {
    $toc = $d.TablesOfContents.Item(1)
    $toc.Update()
    Add-Content $Log "tocEntries=$($toc.Range.Paragraphs.Count)" -Encoding utf8
    $first = $toc.Range.Paragraphs.Item(1).Range.Text.Trim()
    $p20 = $toc.Range.Paragraphs.Item(20).Range.Text.Trim()
    Add-Content $Log "tocFirst=$first" -Encoding utf8
    Add-Content $Log "toc20=$p20" -Encoding utf8
    $n = $toc.Range.Paragraphs.Count
    Add-Content $Log "tocLast=$($toc.Range.Paragraphs.Item($n).Range.Text.Trim())" -Encoding utf8
  }
  $d.Repaginate()
  Add-Content $Log "pages=$($d.ComputeStatistics(2))" -Encoding utf8
  Add-Content $Log "words=$($d.ComputeStatistics(0))" -Encoding utf8
  $d.SaveAs2($Pdf, 17)
  Add-Content $Log 'pdf saved' -Encoding utf8
  $d.Close($false)
} catch { Add-Content $Log "ERROR: $($_.Exception.Message)" -Encoding utf8 } finally {
  try { foreach ($doc in @($w.Documents)) { $doc.Close($false) } } catch {}
  $w.Quit()
}
