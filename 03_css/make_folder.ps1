$folders = Get-ChildItem -Directory | Where-Object { $_.Name -match '^\d+$' } | ForEach-Object { [int]$_.Name }
$next = (($folders | Measure-Object -Maximum).Maximum + 1).ToString()

New-Item -ItemType Directory -Path $next | Out-Null
New-Item -ItemType Directory -Path "$next\styles" | Out-Null

Set-Content -Path "$next\index.html" -Encoding utf8 -Value @"
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./styles/main.css">
    <title>$next</title>
</head>
<body>
    <h4>$next</h4>
</body>
</html>
"@

New-Item -ItemType File -Path "$next\styles\main.css" | Out-Null

Write-Host "Created folder $next with index.html and styles/main.css"
