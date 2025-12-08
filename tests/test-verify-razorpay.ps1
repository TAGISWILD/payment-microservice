param(
    [string]$BaseUrl = "http://localhost:8081",
    [string]$RazorpaySecret = "tZmzu3jEBaKSRafWZLwJBhjY"
)

$uri = "$BaseUrl/api/v1/payments/verify"

Write-Host "Loading last-order.json..."
$lastOrderPath = Join-Path $PSScriptRoot "last-order.json"

if (-not (Test-Path $lastOrderPath)) {
    Write-Host "last-order.json not found. Run test-payment.ps1 first."
    exit 1
}

$jsonText = Get-Content $lastOrderPath -Raw
$data = $jsonText | ConvertFrom-Json

$orderId         = $data.orderId
$razorpayOrderId = $data.gatewayOrderId

if (-not $razorpayOrderId) {
    Write-Host "gatewayOrderId is empty in last-order.json. Check initiatePayment response."
    exit 1
}

# Fake a Razorpay payment id
$razorpayPaymentId = "pay_" + ([guid]::NewGuid().ToString("N")).Substring(0,14)

# ----- Generate signature like Razorpay: HMAC_SHA256(orderId|paymentId, secret) -----
$payload = "$razorpayOrderId|$razorpayPaymentId"
Write-Host "Payload for signature: $payload"

$encoding     = [System.Text.Encoding]::UTF8
$secretBytes  = $encoding.GetBytes($RazorpaySecret)
$payloadBytes = $encoding.GetBytes($payload)

# IMPORTANT: create HMAC with *one* argument
$hmac = [System.Security.Cryptography.HMACSHA256]::new($secretBytes)
$hashBytes = $hmac.ComputeHash($payloadBytes)
$signature = ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""

Write-Host "Generated signature: $signature"

Write-Host "Generated signature: $signature"

# ----- Build verify request body -----
$bodyObj = @{
    orderId           = $orderId
    razorpayOrderId   = $razorpayOrderId
    razorpayPaymentId = $razorpayPaymentId
    razorpaySignature = $signature
}

$bodyJson = $bodyObj | ConvertTo-Json -Depth 3
Write-Host "Sending verify request to $uri"
Write-Host $bodyJson

try {
    $resp = Invoke-RestMethod -Method Post -Uri $uri `
        -ContentType "application/json" `
        -Body $bodyJson

    Write-Host ""
    Write-Host "Response from server:"
    $resp
}
catch {
    Write-Host "Verify call failed!"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response -ne $null) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:"
        Write-Host $responseBody
    }
}
