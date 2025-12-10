# Nastavení cest
$rootFolder = "media\sound\hit"
$outputFile = "sounds.json"

# Inicializace prázdného objektu (hash table)
$soundManifest = @{}

# Kontrola, zda složka existuje
if (Test-Path $rootFolder) {
    # Získání všech podsložek ve složce "hit" (např. Chicken, Metal...)
    $subFolders = Get-ChildItem -Path $rootFolder -Directory

    foreach ($folder in $subFolders) {
        # Získání jména složky (to bude klíč v JSONu, např. "Chicken")
        $categoryName = $folder.Name
        
        # Získání všech zvukových souborů v dané složce
        # Hledáme .mp3, .wav, .ogg
        $files = Get-ChildItem -Path $folder.FullName -Include *.mp3, *.wav, *.ogg, *.m4a -Recurse
        
        # Pokud složka obsahuje soubory, přidáme je do manifestu
        if ($files.Count -gt 0) {
            # Uložíme pouze názvy souborů (ne celé cesty, ty si složíme v JS)
            $soundManifest[$categoryName] = $files.Name
        }
    }

    # Převod na JSON a uložení do souboru
    # -Depth 10 zajišťuje, že se správně zanoří pole
    # -Compress odstraní zbytečné mezery (volitelné, pro čitelnost jsem vynechal)
    $jsonOutput = $soundManifest | ConvertTo-Json -Depth 10
    
    # Uložení s kódováním UTF8 (důležité pro web)
    $jsonOutput | Set-Content -Path $outputFile -Encoding UTF8
    
    Write-Host "Soubor $outputFile byl úspěšně vygenerován." -ForegroundColor Green
    Write-Host "Nalezené kategorie: $($soundManifest.Keys -join ', ')"
} else {
    Write-Error "Cesta '$rootFolder' neexistuje! Spouštíš skript ze správné složky?"
}