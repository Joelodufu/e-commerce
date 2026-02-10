$ErrorActionPreference = "Stop"
try {
    Write-Host "Logging in..."
    $loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/auth/login" -ContentType "application/json" -Body '{"email": "test@example.com", "password": "StronkP@ssw0rd!"}'
    $token = $loginResponse.data.accessToken
    
    if (-not $token) {
        Write-Error "Failed to get access token"
        exit 1
    }
    Write-Host "Login successful. Token received."

    Write-Host "Accessing protected endpoint /api/cart..."
    try {
        $cartResponse = Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/cart" -Headers @{Authorization = "Bearer $token"}
        Write-Host "Protected endpoint accessed successfully!"
        $cartResponse | ConvertTo-Json -Depth 5
    } catch {
        Write-Error "Failed to access protected endpoint: $_"
        exit 1
    }
} catch {
    Write-Error "An error occurred: $_"
    exit 1
}
