param([string]$Docx, [string]$Pdf, [string]$Log)
$ErrorActionPreference = 'Stop'
Set-Content $Log 'start'
$w = New-Object -ComObject Word.Application
$w.Visible = $false; $w.DisplayAlerts = 0
try {
  $d = $w.Documents.Open($Docx, $false, $true)
  Add-Content $Log "opened pages=$($d.ComputeStatistics(2))"
  $d.SaveAs2($Pdf, 17)
  Add-Content $Log 'pdf saved'
  $d.Close($false)
} catch { Add-Content $Log "ERROR: $($_.Exception.Message)" } finally {
  try { foreach ($doc in @($w.Documents)) { $doc.Close($false) } } catch {}
  $w.Quit()
}
