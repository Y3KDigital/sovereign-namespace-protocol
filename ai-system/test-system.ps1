# Quick Test Script for AI System
# Tests all endpoints after the system starts

Write-Host "`n🧪 Testing AI System Endpoints...`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8000"

# Test 1: Health Check
Write-Host "1️⃣  Testing /health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "   ✅ Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Image Generation
Write-Host "`n2️⃣  Testing /generate/image..." -ForegroundColor Yellow
try {
    $body = @{
        prompt = "a futuristic city at sunset, cyberpunk style"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/generate/image" -Method POST -Body $body -ContentType "application/json" -OutFile "test_image.png"
    Write-Host "   ✅ Image saved to test_image.png" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Image generation failed (this is normal if GPU memory is low): $_" -ForegroundColor Yellow
}

# Test 3: Voice Chat (LLM only, no TTS)
Write-Host "`n3️⃣  Testing /voice/chat..." -ForegroundColor Yellow
try {
    $body = @{
        text = "Hello, who are you?"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/voice/chat" -Method POST -Body $body -ContentType "application/json"
    Write-Host "   ✅ AI Response: $($response.response)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Voice chat failed: $_" -ForegroundColor Red
}

Write-Host "`n🎉 Testing complete!`n" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "- For Telnyx: Expose port 8000 with 'cloudflared tunnel --url http://localhost:8000'" -ForegroundColor Gray
Write-Host "- Set webhook to: https://your-tunnel-url.com/telnyx/webhook" -ForegroundColor Gray
