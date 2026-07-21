# ============================================
# 修改 hosts: xalgo.com -> Shopify IP
# 右键此文件 -> 用 PowerShell 管理员身份运行
# ============================================

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entry = "23.227.38.74  xalgo.com"

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "需要管理员权限运行！正在提权..." -ForegroundColor Yellow
    Start-Process PowerShell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

$content = Get-Content $hostsPath -Raw
if ($content -match "xalgo\.com") {
    Write-Host "hosts 中已存在 xalgo.com 记录，先移除旧的..." -ForegroundColor Yellow
    $content = $content -replace ".*xalgo\.com.*`r?`n?", ""
}

$newContent = $content.TrimEnd() + "`r`n" + $entry + "`r`n"
Set-Content -Path $hostsPath -Value $newContent -Encoding ASCII -Force
ipconfig /flushdns | Out-Null

Write-Host ""
Write-Host "[OK] hosts 已更新: $entry" -ForegroundColor Green
Write-Host ""
Write-Host "验证:" -ForegroundColor Cyan
Get-Content $hostsPath | Select-String "xalgo"
Write-Host ""
Write-Host "DNS 缓存已刷新。现在可以重新打开浏览器访问 xalgo.com 了。"
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
