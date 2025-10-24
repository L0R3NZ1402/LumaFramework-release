@echo off
echo Generating RSA private and public keys...

REM Change to the folder where this script is located
cd /d "%~dp0"

REM Generate private key (2048 bits)
"C:\Program Files\OpenSSL-Win64\bin\openssl.exe" genrsa -out private.pem 2048

REM Generate public key from the private key
"C:\Program Files\OpenSSL-Win64\bin\openssl.exe" rsa -in private.pem -outform PEM -pubout -out public.pem

echo.
echo Keys generated successfully!
echo private.pem and public.pem are in this folder.
pause