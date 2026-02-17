@echo off
rem Run Aider with Qwen3-coder model

aider
if %errorlevel% neq 0 (
  echo Aider exited with error %errorlevel%
)

pause
