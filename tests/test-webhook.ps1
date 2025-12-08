$uri = "http://localhost:8081/api/v1/payments/webhook"   # matches @RequestMapping + @PostMapping

$headers = @{
    "Content-Type" = "application/json"
    "X-Gateway"    = "DUMMY"              # WebhookService reads X-Gateway
    "X-Event-Type" = "payment.captured"   # and X-Event-Type
}

$bodyObject = @{
    event    = "payment.captured"
    orderId  = "bea023fa-3afa-45db-ad7e-557290ff64e8"   # must match payment_orders.gateway_order_id (or whatever you use)
    amount   = 50000
    currency = "INR"
}

$bodyJson = $bodyObject | ConvertTo-Json -Depth 5

Write-Host "Sending webhook payload to $uri"
Write-Host $bodyJson
Write-Host ""

try {
    $response = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $bodyJson
    Write-Host "Response from server:"
    Write-Host $response
} catch {
    Write-Host "Request failed:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response -ne $null) {
        Write-Host "Status code:" $_.Exception.Response.StatusCode.value__
    }
}
