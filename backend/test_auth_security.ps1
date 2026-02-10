$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param($Uri, $Headers, $ExpectedStatus)
    try {
        $response = Invoke-RestMethod -Method Get -Uri $Uri -Headers $Headers
        # If we get here, status is 200 (or success)
        if ($ExpectedStatus -eq 200) {
            Write-Host "SUCCESS: $Uri returned 200 OK as expected."
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
    # 1. Login to get token
    Write-Host "Logging in..."
    $loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/auth/login" -ContentType "application/json" -Body '{"email": "test@example.com", "password": "StronkP@ssw0rd!"}'
    $token = $loginResponse.data.accessToken
    Write-Host "Token received."

    # 2. Test Protected Endpoint WITHOUT Token -> Expect 403 Forbidden (Spring Security default for missing auth in authenticated chain usually 403 or 401)
    # Actually Spring Security returns 401 if authentication is missing, or 403 if authenticated but not authorized.
    # But for JWT filter, if no header, it passes to next filter?
    # SecurityConfig says .anyRequest().authenticated().
    # Using specific handling.
    # Let's expect 403.
    Test-Endpoint -Uri "http://localhost:8080/api/non-existent-protected" -Headers @{} -ExpectedStatus 403

    # 3. Test Protected Endpoint WITH Token -> Expect 404 Not Found (Authenticated, but resource missing)
    Test-Endpoint -Uri "http://localhost:8080/api/non-existent-protected" -Headers @{Authorization = "Bearer $token" } -ExpectedStatus 404

}
catch {
    Write-Error "Script failed: $_"
    exit 1
}
