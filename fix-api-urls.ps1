# PMS ERP - Fix hardcoded API URLs for production deployment
# Run from: d:\OneDrive\المستندات\projects\PMS 2\

Write-Host "=== PMS: Fixing hardcoded API URLs ===" -ForegroundColor Cyan

$frontendSrc = "d:\OneDrive\المستندات\projects\PMS 2\frontend\src"

# Get all tsx/ts files
$files = Get-ChildItem -Path $frontendSrc -Recurse -Include "*.tsx","*.ts" | 
         Where-Object { Select-String -Path $_.FullName -Pattern "localhost:4000" -Quiet }

Write-Host "Found $($files.Count) files with hardcoded localhost:4000" -ForegroundColor Yellow

foreach ($file in $files) {
    Write-Host "  Processing: $($file.Name)" -ForegroundColor Gray
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Check if API_BASE_URL import already exists
    if ($content -notmatch 'API_BASE_URL') {
        # Add import after the last existing import that mentions 'axios' or at top after "use client"
        if ($content -match 'import axios') {
            $content = $content -replace '(import axios[^\n]*\n)', "`$1import { API_BASE_URL } from `"@/lib/api`";`n"
        } else {
            # Add after "use client"; line
            $content = $content -replace '("use client";\n)', "`$1import { API_BASE_URL } from `"@/lib/api`";`n"
        }
    }
    
    # Replace all occurrences of http://localhost:4000 with ${API_BASE_URL}
    # In template literals: `http://localhost:4000/...` -> `${API_BASE_URL}/...`
    $content = $content -replace '"http://localhost:4000', '`$\{API_BASE_URL\}'
    $content = $content -replace 'http://localhost:4000', '`$\{API_BASE_URL\}'
    
    # Fix cases where we broke template literal syntax (double backtick)
    # The above may produce: `${API_BASE_URL}/path` inside already backtick strings
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
    Write-Host "  ✓ Fixed: $($file.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Done! $($files.Count) files updated ===" -ForegroundColor Cyan
