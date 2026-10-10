@echo off
setlocal
title Teste local - Sabor do Alemao
cd /d "%~dp0"
echo.
echo ===============================================
echo   SABOR DO ALEMAO - PREVIA DO NOVO SITE
echo ===============================================
echo.
echo Abrindo o site local no navegador...
echo Mantenha esta janela aberta enquanto estiver testando.
echo Para parar, pressione CTRL+C.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor-local.ps1"
if errorlevel 1 (
  echo.
  echo Nao foi possivel iniciar o servidor.
  echo Confirme se a porta 8765 esta livre e execute novamente.
  pause
)
endlocal
