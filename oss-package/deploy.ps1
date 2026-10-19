#Requires -Version 5.1
param(
    [ValidateSet('up', 'down', 'status', 'test', 'logs', 'reset')]
    [string]$Command = 'up'
)

$ErrorActionPreference = 'Stop'

function Invoke-Compose {
    & docker compose --env-file .env -f docker-compose.yml -f docker-compose.windows.yml @args
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed (exit $LASTEXITCODE)."
    }
}

function New-Secret([int]$Length = 32) {
    $bytes = New-Object byte[] ([int][Math]::Ceiling($Length / 2))
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    return [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant().Substring(0, $Length)
}

function Initialize-Environment {
    $path = Join-Path $PSScriptRoot '.env'
    $isNew = -not (Test-Path -LiteralPath $path)
    if ($isNew) {
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot '.env.example') -Destination $path
        Write-Host 'Created .env'
    }
    if ($env:OS -eq 'Windows_NT') {
        $acl = Get-Acl -LiteralPath $path
        $acl.SetAccessRuleProtection($true, $false)
        $identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
        $rule = New-Object Security.AccessControl.FileSystemAccessRule($identity, 'FullControl', 'Allow')
        $acl.SetAccessRule($rule)
        Set-Acl -LiteralPath $path -AclObject $acl
    }
    $content = [IO.File]::ReadAllText($path)
    $secrets = [ordered]@{
        POSTGRES_PASSWORD = (New-Secret 24)
        LITELLM_MASTER_KEY = "sk-$(New-Secret)"
        WEBUI_SECRET_KEY = (New-Secret)
        LANGFUSE_NEXTAUTH_SECRET = (New-Secret)
        LANGFUSE_SALT = (New-Secret)
        LANGFUSE_PUBLIC_KEY = "pk-lf-$(New-Secret 16)"
        LANGFUSE_SECRET_KEY = "sk-lf-$(New-Secret 16)"
        LANGFUSE_ADMIN_PASSWORD = (New-Secret 16)
    }
    foreach ($key in $secrets.Keys) {
        $pattern = "(?m)^${key}=[ `t]*`r?$"
        if ($content -match $pattern) {
            $content = [regex]::Replace($content, $pattern, "${key}=$($secrets[$key])")
        } elseif ($content -notmatch "(?m)^${key}=") {
            $content += "`n${key}=$($secrets[$key])`n"
        }
    }
    # UTF-8 without BOM works with Compose and Windows PowerShell 5.1.
    [IO.File]::WriteAllText($path, $content, (New-Object Text.UTF8Encoding($false)))
}

function Get-EnvironmentValue([string]$Key) {
    foreach ($line in [IO.File]::ReadAllLines((Join-Path $PSScriptRoot '.env'))) {
        if ($line -match "^${Key}=(.*)$") {
            $value = $Matches[1].Trim()
            if ($value -match '^["''](.*)["'']$') { $value = $Matches[1] }
            return $value
        }
    }
    throw "Missing $Key in .env."
}

function Wait-ForService([string]$Url, [string]$Name) {
    for ($i = 0; $i -lt 60; $i++) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 | Out-Null
            Write-Host "  ok: $Name"
            return
        } catch {
            Start-Sleep -Seconds 3
        }
    }
    throw "Timeout waiting for $Name ($Url). Check the service and firewall settings."
}

function Receive-Models {
    $base = "http://localhost:$(Get-EnvironmentValue OLLAMA_PORT)"
    $models = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'config/litellm.yaml') |
        ForEach-Object {
            if ($_ -match '^\s*model:\s*[''"]?ollama[a-z_]*/([^''"\s#]+)') { $Matches[1] }
        } | Select-Object -Unique
    foreach ($model in $models) {
        Write-Host "Pulling model $model into native Ollama (first run downloads several GB)..."
        $body = @{ name = $model; stream = $false } | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$base/api/pull" -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 3600
        if ($result.error) { throw "Ollama could not pull ${model}: $($result.error)" }
    }
}

function Show-Summary {
    Write-Host @"

AI platform is running (container ports bound to localhost):
  Chat UI (Open WebUI)   http://localhost:$(Get-EnvironmentValue WEBUI_PORT)
  AI gateway (LiteLLM)   http://localhost:$(Get-EnvironmentValue GATEWAY_PORT)/v1   key: $(Get-EnvironmentValue LITELLM_MASTER_KEY)
  Observability         http://localhost:$(Get-EnvironmentValue LANGFUSE_PORT)   login: $(Get-EnvironmentValue LANGFUSE_ADMIN_EMAIL) / $(Get-EnvironmentValue LANGFUSE_ADMIN_PASSWORD)
  Vector store (Qdrant)  http://localhost:$(Get-EnvironmentValue QDRANT_PORT)/dashboard
  Inference             native Windows Ollama on port $(Get-EnvironmentValue OLLAMA_PORT)

Try: .\deploy.ps1 test
"@
}

Push-Location -LiteralPath $PSScriptRoot
try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw 'Docker Desktop with Linux containers and the Hyper-V backend is required.'
    }
    $version = & docker compose version --short
    if ($LASTEXITCODE -ne 0 -or "$version" -notmatch 'v?(\d+\.\d+\.\d+)' -or [version]$Matches[1] -lt [version]'2.24.4') {
        throw 'Docker Compose 2.24.4 or newer is required.'
    }
    switch ($Command) {
        'up' {
            $osType = & docker info --format '{{.OSType}}'
            if ($LASTEXITCODE -ne 0 -or "$osType".Trim() -ne 'linux') {
                throw 'Start Docker Desktop in Linux container mode with the Hyper-V backend.'
            }
            Initialize-Environment
            Wait-ForService "http://localhost:$(Get-EnvironmentValue OLLAMA_PORT)/api/tags" 'native Ollama (start Ollama on Windows first)'
            Invoke-Compose up -d
            Wait-ForService "http://localhost:$(Get-EnvironmentValue GATEWAY_PORT)/health/liveliness" 'gateway'
            $url = "http://host.docker.internal:$(Get-EnvironmentValue OLLAMA_PORT)/api/tags"
            try {
                Invoke-Compose exec -T litellm python -c 'import sys, urllib.request; urllib.request.urlopen(sys.argv[1], timeout=10).read()' $url
            } catch {
                throw 'LiteLLM cannot reach native Ollama. Set OLLAMA_HOST=0.0.0.0:11434 (or your OLLAMA_PORT), restart Ollama, and allow only the Docker Desktop network through Windows Firewall. See README.md.'
            }
            Receive-Models
            Wait-ForService "http://localhost:$(Get-EnvironmentValue QDRANT_PORT)/readyz" 'qdrant'
            Wait-ForService "http://localhost:$(Get-EnvironmentValue WEBUI_PORT)" 'open-webui'
            Show-Summary
        }
        'down' { Invoke-Compose down }
        'status' { Initialize-Environment; Invoke-Compose ps }
        'logs' { Invoke-Compose logs -f --tail=100 }
        'test' {
            Initialize-Environment
            $headers = @{ Authorization = ('Bearer' + ' ' + (Get-EnvironmentValue LITELLM_MASTER_KEY)) }
            $body = @{
                model = 'chat'
                messages = @(@{ role = 'user'; content = 'Say hello in five words.' })
            } | ConvertTo-Json -Depth 5
            Invoke-RestMethod -Uri "http://localhost:$(Get-EnvironmentValue GATEWAY_PORT)/v1/chat/completions" `
                -Method Post -Headers $headers -ContentType 'application/json' -Body $body -TimeoutSec 300 |
                ConvertTo-Json -Depth 20
        }
        'reset' {
            $answer = Read-Host "This deletes platform databases, vectors and chat data, but NOT native Ollama models. Type 'yes'"
            if ($answer -ceq 'yes') { Invoke-Compose down -v }
        }
    }
} catch {
    Write-Error $_ -ErrorAction Continue
    exit 1
} finally {
    Pop-Location
}
