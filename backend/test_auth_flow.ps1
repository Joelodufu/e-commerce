$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param($Uri, $Method, $Headers, $Body, $ExpectedStatus)
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -ContentType "application/json" -Body $Body
        }
        else {
            $response = Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers
        }
        
        # If we get here, status is 200 (or success)
        if ($ExpectedStatus -eq 200) {
            Write-Host "SUCCESS: $Uri returned 200 OK as expected."
            return $response
        }
        else {
            Write-Error "FAILURE: $Uri returned 200 OK, expected $ExpectedStatus"
        }
    }
    catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq $ExpectedStatus) {
            Write-Host "SUCCESS: $Uri returned $status as expected."
        }
        else {
            Write-Error "FAILURE: $Uri returned $status, expected $ExpectedStatus. Exception: $_"
        }
    }
}

try {
    # 1. Register User (might fail if already exists, handle gracefully)
    Write-Host "Registering..."
    try {
        $registerResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/auth/register" -ContentType "application/json" -Body '{"email": "test_script@example.com", "password": "StronkP@ssw0rd!"}'
        Write-Host "Registration successful."
    }
    catch {
        Write-Host "Registration skipped (likely already exists)."
    }

    # 2. Login to get token
    Write-Host "Logging in..."
    $loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/auth/login" -ContentType "application/json" -Body '{"email": "test_script@example.com", "password": "StronkP@ssw0rd!"}'
    $accessToken = $loginResponse.data.accessToken
    $refreshToken = $loginResponse.data.refreshToken
    
    if (-not $accessToken) {
        Write-Error "Failed to get access token"
        exit 1
    }
    Write-Host "Login successful. Tokens received."

    # 3. Test Protected Endpoint (Refresh Token) WITHOUT Token -> Expect 403 Forbidden
    # Note: /api/auth/refresh is actually public in many implementations, but let's check SecurityConfig.
    # SecurityConfig says: /api/auth/** is public.
    # We need a protected endpoint.
    # SecurityConfig says: ALL other endpoints require authentication.
    # Let's use a non-existent endpoint under /api/protected to test the filter chain.
    # OR we can try to access a protected method if we have one.
    # We don't have many implemented features yet.
    # Let's try /api/users/me (common pattern) or just check /error which is usually protected?
    # Actually, let's use the explicit check for non-existent endpoint which SHOULD return 403 if unauthenticated, and 404 if authenticated.
    
    # Test Unauthenticated Access to Protected URL -> Expect 403
    Test-Endpoint -Uri "http://localhost:8080/api/cart" -Method Get -Headers @{} -ExpectedStatus 403

    # Test Authenticated Access to Protected URL -> Expect 404 (since cart not implemented yet but passed auth)
    # If auth works, it should pass filter and hit DispatcherServlet, which returns 404.
    Test-Endpoint -Uri "http://localhost:8080/api/cart" -Method Get -Headers @{Authorization = "Bearer $accessToken" } -ExpectedStatus 404

    Write-Host "Authentication flow verification complete."
}
catch {
    Write-Error "Script failed: $_"
    exit 1
}
