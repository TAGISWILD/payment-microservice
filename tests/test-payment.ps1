$payload = @{
    amount = 50000
    currency = "INR"
    externalReferenceId = "TEST-ORDER-001"
    description = "Test payment"
    customer = @{
        name = "Atharva"
        email = "mrtag08@gmail.com"
        contact = "9999999999"
    }
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod `
    -Uri "http://localhost:8081/api/v1/payments/init" `
    -Method POST `
    -ContentType "application/json" `
    -Body $payload

$response | Format-List
