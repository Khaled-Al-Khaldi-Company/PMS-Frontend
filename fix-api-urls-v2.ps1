# PMS ERP - Fix hardcoded API URLs for production (v2 - safe version)
# Run from: d:\OneDrive\المستندات\projects\PMS 2\

$frontendSrc = "d:\OneDrive\المستندات\projects\PMS 2\frontend\src"

Write-Host "=== PMS: Scanning for remaining hardcoded URLs ===" -ForegroundColor Cyan

$files = Get-ChildItem -Path $frontendSrc -Recurse -Include "*.tsx","*.ts" | 
         Where-Object { (Get-Content $_.FullName -Raw -Encoding UTF8) -match "localhost:4000" }

Write-Host "Files with localhost:4000: $($files.Count)" -ForegroundColor Yellow
foreach ($f in $files) {
    Write-Host "  - $($f.Name) ($($f.FullName))" -ForegroundColor Gray
}
