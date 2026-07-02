$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $Root '.pdfswitch-server.pid'
$LogFile = Join-Path $Root '.pdfswitch-server.log'
$ErrorLogFile = Join-Path $Root '.pdfswitch-server.err.log'

if (-not (Test-Path -LiteralPath $PidFile)) {
    Write-Host 'PDFOnly local service is not running: PID file not found.'
    exit 0
}

$PidValue = (Get-Content -LiteralPath $PidFile -Raw).Trim()
if ($PidValue -notmatch '^\d+$') {
    Remove-Item -LiteralPath $PidFile -Force
    Write-Host 'Removed invalid PID file.'
    exit 0
}

$ProcessId = [int]$PidValue

try {
    $Process = Get-Process -Id $ProcessId -ErrorAction Stop
    Stop-Process -Id $Process.Id -Force
    Write-Host "PDFOnly local service stopped. PID: $ProcessId"
} catch {
    Write-Host "PDFOnly local service was not running. Stale PID: $ProcessId"
}

Remove-Item -LiteralPath $PidFile -Force

if (Test-Path -LiteralPath $LogFile) {
    Write-Host "Log retained: $LogFile"
}

if (Test-Path -LiteralPath $ErrorLogFile) {
    Write-Host "Error log retained: $ErrorLogFile"
}
