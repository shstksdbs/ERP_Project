@echo off
echo 🚀 Redis 캐싱 테스트 시작!
echo ================================

echo 1️⃣ 캐시 상태 확인...
curl -s http://localhost:8080/api/cache/status

echo.
echo 2️⃣ 메뉴 조회 테스트 (첫 번째 - DB에서 조회)...
curl -s http://localhost:8080/api/menus > nul
echo    첫 번째 조회 완료

echo.
echo 3️⃣ 메뉴 조회 테스트 (두 번째 - 캐시에서 조회)...
curl -s http://localhost:8080/api/menus > nul
echo    두 번째 조회 완료

echo.
echo 4️⃣ Redis 키 확인...
docker exec redis-server redis-cli keys "*"

echo.
echo 5️⃣ 메뉴 캐시 클리어...
curl -s -X POST http://localhost:8080/api/cache/clear-menu

echo.
echo 6️⃣ 클리어 후 Redis 키 확인...
docker exec redis-server redis-cli keys "*"

echo.
echo 🎉 테스트 완료!
pause
