# paste the orderId you got from test-payment.ps1
$orderId = "2bdb100b-3a4f-4789-860a-ee813f1d1873"

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
