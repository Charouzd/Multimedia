# Nastavení cesty (tečka znamená "aktuální složka")
$cesta = ".\media\img"
$vystup = "sources.txt"

# Zkontroluje, zda složka existuje
if (Test-Path $cesta) {
    # 1. Získá soubory (-File), 
    # 2. Vezme jen jejich jména,
    # 3. Každé jméno obalí uvozovkami,
    # 4. Spojí je čárkou
    $seznam = (Get-ChildItem -Path $cesta -File).Name | ForEach-Object { '"' + $_ + '"' } 
    $vysledek = $seznam -join ','

    # Uloží do souboru (UTF8, aby se nepokazila čeština, kdyby tam byla)
    $vysledek | Set-Content -Path $vystup -Encoding UTF8

    Write-Host "Hotovo! Seznam je v souboru $vystup" -ForegroundColor Green
} else {
    Write-Host "Chyba: Složka '$cesta' neexistuje." -ForegroundColor Red
}