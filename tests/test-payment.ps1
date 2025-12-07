# tests\test-payment.ps1
# Hit the init endpoint and persist the response to last-order.json

$baseUrl = "http://localhost:8081"
$uri     = "$baseUrl/api/v1/payments/init"

$headers = @{
    "Content-Type" = "application/json"
}

# Adjust values as you like
$payload = @{
    amount              = 50000
    currency            = "INR"
    externalReferenceId = "TEST-ORDER-001"
    description         = "Test payment from PowerShell"
    customer            = @{
        name    = "Atharva"
        email   = "mrtag08@example.com"
        contact = "9999999999"
    }
} | ConvertTo-Json -Depth 5

Write-Host "Sending init payment request to $uri"
Write-Host $payload
Write-Host ""

try {
    $params = @{
        Method  = "Post"
        Uri     = $uri
        Headers = $headers
        Body    = $payload
    }

    $response = Invoke-RestMethod @params

    Write-Host "Response from server:"
    $response | Format-List | Out-String | Write-Host

    # Save full JSON response for webhook tests
    $response | ConvertTo-Json -Depth 5 | Set-Content -Path ".\last-order.json"
    Write-Host "`nSaved response to last-order.json"
}
catch {
    Write-Host "`nRequest failed!"
    if ($_.Exception.Response -ne $null) {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $statusDesc = $_.Exception.Response.StatusCode
        Write-Host "Status code: $statusCode ($statusDesc)"
    }
    Write-Host $_.Exception.Message
}
