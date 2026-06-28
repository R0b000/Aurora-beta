# PowerShell script to execute SSMS setup
# Run from project root: N/server/.env contains DB credentials

$env:DB_HOST = "db51809.databaseasp.net"
$env:DB_PORT = "1433"
$env:DB_USER = "db51809"
$env:DB_PASSWORD = "db51809"
$env:DB_NAME = "db51809"

$server = "db51809.databaseasp.net,1433"
$database = "db51809"
$username = "db51809"
$password = "db51809"

$sqlFile = "N\database\ssms\schema\00-complete-setup.sql"

try {
    Invoke-Sqlcmd -ServerInstance $server -Username $username -Password $password -Database $database -InputFile $sqlFile -QueryTimeout 300
    Write-Host "Setup completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}