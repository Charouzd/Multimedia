@echo off
:: Nastavení kódování pro češtinu
chcp 65001 >nul
:: Nastavení správné složky
cd /d "%~dp0"

echo ================================================
echo        SPOUSTIM HERNI PROJEKT
echo ================================================
echo.

:: 1. SPUŠTĚNÍ PS1 SKRIPTŮ
echo [1/4] Generuji seznamy souboru...
if exist "generate_list.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "generate_list.ps1"
)
if exist "generate_list_sounds.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "generate_list_sounds.ps1"
)
echo.

:: 2. KONTROLA PYTHONU (Bezpečnější metoda)
echo [2/4] Kontrola instalace Pythonu...

:: Zkusíme spustit příkaz python --version. Pokud selže, skočíme na chybu.
python --version >nul 2>&1
if %errorlevel% neq 0 goto :CHYBA_PYTHON

:: Pokud jsme tady, Python funguje
echo       Python nalezen. OK.
echo.

:: 3. SPUŠTĚNÍ PROJEKTU
goto :START_SERVER

:CHYBA_PYTHON
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo CHYBA: Python neni nainstalovan (nebo neni v PATH)!
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo.
echo Pro spusteni serveru je potreba Python.
echo Oteviram stahovani...
start https://www.python.org/downloads/
echo.
echo DULEZITE: Pri instalaci zaskrtni dole "Add Python to PATH"!
echo Potom spust tento soubor znovu.
echo.
pause
exit

:START_SERVER
echo [3/4] Oteviram prohlizec...
start http://localhost:8000

echo [4/4] Spoustim server...
echo.
echo Hra bezi! 
echo Pro ukonceni zavri toto okno.
echo.
python -m http.server 8000

:: Pokud server spadne, skript se nezavře hned, abys viděl chybu
pause