# AgriFairConnect Database Setup Script
# Run this script in PowerShell with appropriate execution policy

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AgriFairConnect Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you set up the PostgreSQL database for AgriFairConnect." -ForegroundColor Yellow
Write-Host ""

Write-Host "Prerequisites:" -ForegroundColor Green
Write-Host "1. PostgreSQL must be installed and running" -ForegroundColor White
Write-Host "2. PostgreSQL service must be accessible on port 5432" -ForegroundColor White
Write-Host "3. You must know your PostgreSQL superuser password" -ForegroundColor White
Write-Host ""

$pgPassword = Read-Host "Enter your PostgreSQL superuser password (usually 'postgres')" -AsSecureString
$pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))

Write-Host ""
Write-Host "Creating database 'AgriFairConnect'..." -ForegroundColor Yellow
Write-Host ""

try {
    # Test connection first
    $env:PGPASSWORD = $pgPasswordPlain
    $result = psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE \"AgriFairConnect\";" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now run the application with: dotnet run" -ForegroundColor Green
        Write-Host "The application will automatically create all tables and seed data." -ForegroundColor Green
    } else {
        Write-Host "Database creation failed. This might mean:" -ForegroundColor Red
        Write-Host "- The database already exists" -ForegroundColor White
        Write-Host "- PostgreSQL is not running" -ForegroundColor White
        Write-Host "- Wrong password or connection details" -ForegroundColor White
        Write-Host ""
        Write-Host "Error details: $result" -ForegroundColor Red
        Write-Host ""
        Write-Host "You can also manually create the database using:" -ForegroundColor Yellow
        Write-Host "psql -U postgres -h localhost -p 5432" -ForegroundColor White
        Write-Host "Then run: CREATE DATABASE \"AgriFairConnect\";" -ForegroundColor White
    }
} catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
} finally {
    # Clear the password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
