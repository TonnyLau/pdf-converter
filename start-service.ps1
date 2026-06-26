param(
    [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $Root '.pdfswitch-server.pid'
$LogFile = Join-Path $Root '.pdfswitch-server.log'
$ErrorLogFile = Join-Path $Root '.pdfswitch-server.err.log'

function Test-ServerProcess {
    param([int]$ProcessId)

    try {
        $process = Get-Process -Id $ProcessId -ErrorAction Stop
        return $null -ne $process
    } catch {
        return $false
    }
}

if (Test-Path -LiteralPath $PidFile) {
    $ExistingPid = (Get-Content -LiteralPath $PidFile -Raw).Trim()
    if ($ExistingPid -match '^\d+$' -and (Test-ServerProcess -ProcessId ([int]$ExistingPid))) {
        Write-Host "PDFSwitch local service is already running at http://localhost:$Port/ (PID $ExistingPid)"
        exit 0
    }

    Remove-Item -LiteralPath $PidFile -Force
}

$PythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $PythonCommand) {
    $PythonCommand = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $PythonCommand) {
    throw 'Python was not found. Install Python or start a static server manually from this directory.'
}

if ($PythonCommand.Name -eq 'py.exe' -or $PythonCommand.Name -eq 'py') {
    $ArgumentList = @('-m', 'http.server', $Port.ToString(), '--bind', '127.0.0.1')
} else {
    $ArgumentList = @('-m', 'http.server', $Port.ToString(), '--bind', '127.0.0.1')
}

$Process = Start-Process `
    -FilePath $PythonCommand.Source `
    -ArgumentList $ArgumentList `
    -WorkingDirectory $Root `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError $ErrorLogFile `
    -WindowStyle Hidden `
    -PassThru

Set-Content -LiteralPath $PidFile -Value $Process.Id -NoNewline

Write-Host "PDFSwitch local service started: http://localhost:$Port/"
Write-Host "PID: $($Process.Id)"
Write-Host "Log: $LogFile"
Write-Host "Error log: $ErrorLogFile"
