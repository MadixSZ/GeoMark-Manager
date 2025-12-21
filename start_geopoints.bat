@echo off
echo ============================================
echo 🚀 INICIANDO GEOPOINTS MANAGER - NERDMONSTER
echo ============================================
echo.

echo PASSO 1: Verificando estrutura de pastas...
if not exist "data" mkdir data
if not exist "api\venv" (
    echo ❌ Ambiente virtual nao encontrado!
    echo Criando ambiente virtual...
    cd api
    python -m venv venv
    cd ..
)

echo PASSO 2: Ativando ambiente virtual e instalando dependencias...
cd api
call venv\Scripts\activate
echo ✅ Ambiente virtual ativado!

echo Instalando dependencias Python...
pip install Flask==2.3.3 Flask-CORS==4.0.0 Flask-SQLAlchemy==3.0.5 > nul 2>&1
echo ✅ Dependencias Python instaladas!

echo PASSO 3: Iniciando API Flask (porta 5000)...
start cmd /k "cd api && call venv\Scripts\activate && python app.py"

echo Aguardando API iniciar...
timeout /t 5 /nobreak >nul

echo PASSO 4: Iniciando Frontend React (porta 3000)...
cd ..\web
echo Instalando dependencias Node.js...
call npm install --silent > nul 2>&1
echo ✅ Dependencias Node.js instaladas!
start cmd /k "cd web && npm start"

echo Aguardando Frontend iniciar...
timeout /t 10 /nobreak >nul

echo PASSO 5: Abrindo navegador...
start http://localhost:3000
start http://localhost:5000/api/health

echo.
echo ============================================
echo ✅ SISTEMA INICIADO COM SUCESSO!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 📊 Health Check: http://localhost:5000/api/health
echo ============================================
echo.
echo 📝 COMANDOS MANUAIS:
echo - API: cd api && venv\Scripts\activate && python app.py
echo - Frontend: cd web && npm start
echo.
pause