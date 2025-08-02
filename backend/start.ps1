try{
    Write-Host "`nStarting Docker containers" -ForegroundColor Green
    docker compose up -d 
    if ($LASTEXITCODE -ne 0) {
        throw "Docker compose failed with exit code $LASTEXITCODE"
    }

    Write-Host "`nStarting npm app" -ForegroundColor Green
    npm run start 
    if ($LASTEXITCODE -ne 0) {
        throw "npm start failed with exit code $LASTEXITCODE"
    }
}catch {
    Write-Host "`nProcess can't complete due to Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTry npm i or check if Docker Desktop is running" -ForegroundColor Red
}finally{
    Write-Host "`nClosing the process" -ForegroundColor Yellow
    docker compose down
}
