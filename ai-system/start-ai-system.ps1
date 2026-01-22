# AI System Launcher for Windows
# Run this with: .\start-ai-system.ps1

param(
    [string]$HF_TOKEN = "",
    [string]$TELNYX_KEY = ""
)

Write-Host "🚀 Starting Local AI System..." -ForegroundColor Cyan

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    
    if ($HF_TOKEN -eq "" -or $TELNYX_KEY -eq "") {
        Write-Host "❌ Error: Please provide HF_TOKEN and TELNYX_KEY" -ForegroundColor Red
        Write-Host "Usage: .\start-ai-system.ps1 -HF_TOKEN 'your_token' -TELNYX_KEY 'your_key'" -ForegroundColor Yellow
        exit 1
    }
    
    @"
HF_TOKEN=$HF_TOKEN
TELNYX_API_KEY=$TELNYX_KEY
TELNYX_PUBLIC_URL=http://localhost:8000
DEVICE=cuda
"@ | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✅ Created .env file" -ForegroundColor Green
}

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if running with Docker or local Python
$useDocker = Read-Host "Run with Docker? (y/n)"

if ($useDocker -eq "y") {
    Write-Host "🐳 Building and starting with Docker..." -ForegroundColor Cyan
    docker compose up --build
} else {
    Write-Host "🐍 Starting with local Python..." -ForegroundColor Cyan
    
    # Check Python
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Python not found. Please install Python 3.10+" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Found $pythonVersion" -ForegroundColor Green
    
    # Install dependencies if needed
    if (!(Test-Path "venv")) {
        Write-Host "📦 Creating virtual environment..." -ForegroundColor Cyan
        python -m venv venv
        .\venv\Scripts\Activate.ps1
        pip install -r requirements.txt
    } else {
        .\venv\Scripts\Activate.ps1
    }
    
    # Download models if needed
    Write-Host "📥 Checking models..." -ForegroundColor Cyan
    python scripts/download_models.py
    
    # Start server
    Write-Host "🚀 Starting FastAPI server..." -ForegroundColor Cyan
    cd api
    python main.py
}
