@echo off
echo ========================================
echo AgriFairConnect Database Setup
echo ========================================
echo.

echo This script will help you set up the PostgreSQL database for AgriFairConnect.
echo.

echo Prerequisites:
echo 1. PostgreSQL must be installed and running
echo 2. PostgreSQL service must be accessible on port 5432
echo 3. You must know your PostgreSQL superuser password
echo.

set /p PG_PASSWORD="Enter your PostgreSQL superuser password (usually 'postgres'): "

echo.
echo Creating database 'AgriFairConnect'...
echo.

psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE \"AgriFairConnect\";" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo Database created successfully!
    echo.
    echo You can now run the application with: dotnet run
    echo The application will automatically create all tables and seed data.
) else (
    echo.
    echo Database creation failed. This might mean:
    echo - The database already exists
    echo - PostgreSQL is not running
    echo - Wrong password or connection details
    echo.
    echo Please check your PostgreSQL installation and try again.
    echo.
    echo You can also manually create the database using:
    echo psql -U postgres -h localhost -p 5432
    echo Then run: CREATE DATABASE "AgriFairConnect";
)

echo.
echo Press any key to exit...
pause >nul
