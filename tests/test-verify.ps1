# paste the orderId you got from test-payment.ps1
$orderId = "404314d5-c06c-4b3f-95d4-80bfdc956df8"

$payload = @{
    orderId = $orderId
    gatewayPaymentId = "dummy-pay-001"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:8081/api/v1/payments/verify" `
    -Method POST `
    -ContentType "application/json" `
    -Body $payload

$response | Format-List
