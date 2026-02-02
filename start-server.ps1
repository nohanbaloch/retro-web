# Retro Web - Quick Start Server
# Simple Python HTTP server to test the OS

Write-Host "🖥️  Starting Retro Web OS Server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Serving from: $PWD" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Open your browser and navigate to:" -ForegroundColor Green
Write-Host "   http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Check if Python is available
if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server 8000
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    python3 -m http.server 8000
} else {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Open index.html directly in your browser" -ForegroundColor Yellow
    Write-Host "(Note: Some browsers may have CORS restrictions with file:// protocol)" -ForegroundColor Gray
    pause
}
