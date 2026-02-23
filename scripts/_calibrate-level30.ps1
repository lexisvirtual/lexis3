$files = @(
    'src\pages\Imersao.jsx',
    'src\pages\Maestria.jsx',
    'src\pages\TheWay.jsx',
    'src\pages\blog\BlogIndex.jsx',
    'src\pages\blog\BlogPost.jsx'
)

foreach ($f in $files) {
    $c = Get-Content $f -Raw
    $c = $c.Replace('from { filter: blur(6px); opacity: 0; }', 'from { filter: blur(2px); opacity: 0; }')
    $c = $c.Replace('transform: translateY(8px)', 'transform: translateY(4px)')
    $c = $c.Replace('opacity: 0.012', 'opacity: 0.004')
    Set-Content $f $c
    Write-Host "OK: $f"
}
Write-Host "Calibragem para Nivel 30 concluida."
