$publicId = "bea023fa-3afa-45db-ad7e-557290ff64e8"

$response = Invoke-RestMethod `
    -Uri "http://localhost:8081/api/v1/payments/status/$publicId" `
    -Method GET `
    -Headers @{ "Content-Type" = "application/json" }

Write-Host "------ Payment Status ------"
Write-Host "Order ID:      $($response.orderId)"
Write-Host "Status:        $($response.status)"
Write-Host "Amount:        $($response.amount)"
Write-Host "Currency:      $($response.currency)"
Write-Host "Description:   $($response.description)"
