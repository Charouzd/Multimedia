# Nastavení cest
$basePath = ".\media\img"
$padsPath = "$basePath\pads"
$ballsPath = "$basePath\ball" 
$vystup = "manifest.json"

# Funkce pro získání seznamu souborů z dané složky
function Get-FileList($path) {
    if (Test-Path $path) {
        # Získá jen jména souborů
        $files = Get-ChildItem -Path $path -File | Select-Object -ExpandProperty Name
        # Pokud je složka prázdná, vrátí prázdné pole, jinak vrátí seznam souborů
        if ($files) { return $files } else { return @() }
    } else {
        Write-Host "Varování: Složka '$path' neexistuje." -ForegroundColor Yellow
        return @() 
    }
}

# Získání seznamů
$padsList = Get-FileList $padsPath
$ballsList = Get-FileList $ballsPath

# Vytvoření objektu pro JSON
$data = @{
    "pads" = $padsList
    "balls" = $ballsList
}

# Převod na JSON
$jsonData = $data | ConvertTo-Json -Depth 10

# --- OPRAVENÁ ČÁST PRO WINDOWS POWERSHELL ---
# Používáme klasické UTF8, které funguje všude
$jsonData | Out-File -FilePath $vystup -Encoding UTF8

Write-Host "--------------------------------------------------"
Write-Host "Hotovo!" -ForegroundColor Green
Write-Host "Manifest byl uložen do souboru: $vystup"
Write-Host "Nalezeno pálek: $(($padsList | Measure-Object).Count)"
Write-Host "Nalezeno míčků: $(($ballsList | Measure-Object).Count)"
Write-Host "--------------------------------------------------"