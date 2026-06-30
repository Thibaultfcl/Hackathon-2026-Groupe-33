# Démarre Ollama pour Phi-3.5-Financial sur Windows.
# Accessible aux DEV WEB du groupe (bind 0.0.0.0:11434).
$ErrorActionPreference = "Stop"
$ModelName = if ($env:MODEL_NAME) { $env:MODEL_NAME } else { "phi3-financial" }
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
  Write-Error "ollama introuvable. Installer : https://ollama.com/download"
  exit 1
}

# 0.0.0.0 = accessible LAN. Relancer 'ollama serve' après ce set si le démon tournait déjà.
$env:OLLAMA_HOST = "0.0.0.0:11434"

# Démarre le démon s'il ne répond pas.
try { Invoke-RestMethod "http://127.0.0.1:11434/api/tags" -TimeoutSec 2 | Out-Null }
catch {
  Write-Host "Demarrage du demon ollama (OLLAMA_HOST=$($env:OLLAMA_HOST))..."
  Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
  for ($i=0; $i -lt 30; $i++) {
    try { Invoke-RestMethod "http://127.0.0.1:11434/api/tags" -TimeoutSec 2 | Out-Null; break }
    catch { Start-Sleep 1 }
  }
}

Write-Host "Pull du modele de base (phi3.5)..."
ollama pull phi3.5

Write-Host "Creation du modele '$ModelName'..."
ollama create $ModelName -f "$ScriptDir\Modelfile"

ollama list
Write-Host ""
Write-Host "Serveur pret : http://localhost:11434  (LAN : http://<IP_INFRA>:11434)"
