$body = @{ email = 'verify-flow-' + [DateTime]::UtcNow.ToString('yyyyMMddHHmmss') + '@example.com'; password = 'secret123'; firstName = 'Test'; lastName = 'User'; phone = '123' } | ConvertTo-Json
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$response = Invoke-WebRequest -Uri 'http://localhost:8180/api/session/register' -Method Post -Body $body -ContentType 'application/json' -WebSession $session -MaximumRedirection 0 -SkipHttpErrorCheck
Write-Host ('register_status=' + $response.StatusCode)
Write-Host $response.Content
$me = Invoke-WebRequest -Uri 'http://localhost:8180/api/session/me' -Method Get -WebSession $session -MaximumRedirection 0 -SkipHttpErrorCheck
Write-Host ('me_status=' + $me.StatusCode)
Write-Host $me.Content
