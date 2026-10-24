# ============================================================
# Script: add-credit.ps1
# Adds a professional "Designed by e.a.Peace" footer credit
# ============================================================

$ProjectPath = "C:\Users\Peace\Desktop\projects\pastor-wilfred-website"

# --- Professional credit markup ---
$CreditHTML = @'

<!-- e.a.Peace Credit -->
<div class="eapeace-credit">
  <span class="eapeace-credit__divider"></span>
  <span class="eapeace-credit__text">
    Designed &amp; developed by
    <a href="https://my-website-eapeace.vercel.app/"
       target="_blank"
       rel="noopener noreferrer"
       class="eapeace-credit__link">e.a.Peace</a>
  </span>
</div>
<!-- /e.a.Peace Credit -->
'@

# --- Professional credit CSS ---
$CreditCSS = @'

/* ===== e.a.Peace Credit ===== */
.eapeace-credit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 28px 16px 32px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: inherit;
  opacity: 0.62;
  transition: opacity 0.3s ease;
}
.eapeace-credit:hover { opacity: 0.95; }
.eapeace-credit__divider {
  display: block;
  width: 48px;
  height: 1px;
  background: currentColor;
  opacity: 0.35;
}
.eapeace-credit__text { line-height: 1.6; }
.eapeace-credit__link {
  color: inherit;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  padding-bottom: 1px;
  transition: border-color 0.25s ease, color 0.25s ease;
}
.eapeace-credit__link:hover,
.eapeace-credit__link:focus-visible {
  border-bottom-color: currentColor;
  outline: none;
}
/* ===== /e.a.Peace Credit ===== */
'@

# --- Backup ---
$BackupDir = Join-Path $ProjectPath "_backup_credit_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
Write-Host "Backup folder: $BackupDir" -ForegroundColor Cyan

function Test-Skip($path) {
    return $path -match '\\node_modules\\' -or
           $path -match '\\_backup_' -or
           $path -match '\\.git\\'
}

# --- 1. Inject HTML into every .html file ---
$HtmlFiles = Get-ChildItem -Path $ProjectPath -Recurse -Filter *.html -File | Where-Object { -not (Test-Skip $_.FullName) }
$htmlCount = 0

foreach ($file in $HtmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    if ($content -match 'eapeace-credit') {
        Write-Host "  Skip (already has credit): $($file.Name)" -ForegroundColor DarkGray
        continue
    }

    $original = $content
    if ($content -match '(?i)</footer>') {
        $content = [regex]::Replace($content, '(?i)(\s*)</footer>', "`$1$CreditHTML`$1</footer>", 1)
    } elseif ($content -match '(?i)</body>') {
        $content = [regex]::Replace($content, '(?i)(\s*)</body>', "`$1$CreditHTML`$1</body>", 1)
    } else {
        Write-Host "  No </footer> or </body>: $($file.Name)" -ForegroundColor DarkYellow
        continue
    }

    if ($content -ne $original) {
        $safe = $file.FullName.Substring($ProjectPath.Length).TrimStart('\','/') -replace '[\\/:*?"<>|]', '_'
        Copy-Item $file.FullName (Join-Path $BackupDir $safe)
        Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "  Updated HTML: $($file.Name)" -ForegroundColor Green
        $htmlCount++
    }
}

# --- 2. Append CSS to main stylesheet(s) ---
$CssFiles = Get-ChildItem -Path $ProjectPath -Recurse -Filter *.css -File |
    Where-Object { -not (Test-Skip $_.FullName) -and $_.Name -notmatch '\.min\.css$' }

$cssCount = 0
foreach ($file in $CssFiles) {
    # Prefer files named style/style/main/app/global/index
    if ($file.BaseName -match '(?i)^(style|styles|main|app|global|index|site)$') {
        $css = Get-Content -Path $file.FullName -Raw
        if ($css -match '\.eapeace-credit') {
            Write-Host "  Skip CSS (already styled): $($file.Name)" -ForegroundColor DarkGray
            continue
        }
        $safe = $file.FullName.Substring($ProjectPath.Length).TrimStart('\','/') -replace '[\\/:*?"<>|]', '_'
        Copy-Item $file.FullName (Join-Path $BackupDir $safe)
        Add-Content -Path $file.FullName -Value $CreditCSS -Encoding UTF8
        Write-Host "  Updated CSS: $($file.Name)" -ForegroundColor Green
        $cssCount++
    }
}

# --- 3. If no main stylesheet found, create one and note it ---
if ($cssCount -eq 0) {
    $fallback = Join-Path $ProjectPath "eapeace-credit.css"
    Set-Content -Path $fallback -Value $CreditCSS -Encoding UTF8
    Write-Host "  No main CSS found. Created: eapeace-credit.css" -ForegroundColor Yellow
    Write-Host "  → Add this line to your <head>: <link rel=`"stylesheet`" href=`"eapeace-credit.css`">" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done. HTML files updated: $htmlCount | CSS files updated: $cssCount" -ForegroundColor Green
Write-Host "Backup: $BackupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next:" -ForegroundColor Yellow
Write-Host "  1. Open site in browser, scroll to footer to verify."
Write-Host "  2. git add . ; git commit -m 'Add professional e.a.Peace credit' ; git push"