# Base path of your project
$base = "D:\AtharvaCodes\Spring\payment-service\src\main\java\in\ethiccode\paymentservice"

# Create proper Spring Boot package structure
New-Item -ItemType Directory -Path "$base\controller" -Force | Out-Null
New-Item -ItemType Directory -Path "$base\service" -Force | Out-Null
New-Item -ItemType Directory -Path "$base\dto" -Force | Out-Null
New-Item -ItemType Directory -Path "$base\entity" -Force | Out-Null
New-Item -ItemType Directory -Path "$base\repository" -Force | Out-Null
New-Item -ItemType Directory -Path "$base\config" -Force | Out-Null

# Old folder containing everything
$old = "$base\controller"

# Move DTOs
Move-Item "$old\PaymentInitRequest.java" "$base\dto" -Force
Move-Item "$old\PaymentInitResponse.java" "$base\dto" -Force

# Move entities
Move-Item "$old\PaymentOrder.java" "$base\entity" -Force
Move-Item "$old\Payments.java" "$base\entity" -Force

# Move repository interfaces
Move-Item "$old\PaymentOrderRepository.java" "$base\repository" -Force

# Move services
Move-Item "$old\PaymentService.java" "$base\service" -Force

# Move controllers
Move-Item "$old\PaymentController.java" "$base\controller" -Force
Move-Item "$old\HealthController.java" "$base\controller" -Force

Write-Host "`n=== Directory refactor complete ==="
Write-Host "Now update package names in JAVA files:"
Write-Host " - entity classes → .entity"
Write-Host " - dto classes → .dto"
Write-Host " - repository interfaces → .repository"
Write-Host " - service classes → .service"
Write-Host " - controllers → .controller"
Write-Host "`nIntelliJ will auto-fix imports when you open the files."
