#!/bin/bash

echo "🚀 Redis 캐싱 테스트 시작!"
echo "================================"

# 1. 캐시 상태 확인
echo "1️⃣ 캐시 상태 확인..."
curl -s http://localhost:8080/api/cache/status | jq .

echo -e "\n2️⃣ 메뉴 조회 테스트 (첫 번째 - DB에서 조회)..."
time curl -s http://localhost:8080/api/menus > /dev/null

echo -e "\n3️⃣ 메뉴 조회 테스트 (두 번째 - 캐시에서 조회)..."
time curl -s http://localhost:8080/api/menus > /dev/null

echo -e "\n4️⃣ 대시보드 KPI 조회 테스트 (첫 번째)..."
time curl -s http://localhost:8080/api/dashboard/kpis/1 > /dev/null

echo -e "\n5️⃣ 대시보드 KPI 조회 테스트 (두 번째)..."
time curl -s http://localhost:8080/api/dashboard/kpis/1 > /dev/null

echo -e "\n6️⃣ Redis 키 확인..."
docker exec redis-server redis-cli keys "*"

echo -e "\n7️⃣ 메뉴 캐시 클리어..."
curl -s -X POST http://localhost:8080/api/cache/clear-menu | jq .

echo -e "\n8️⃣ 클리어 후 Redis 키 확인..."
docker exec redis-server redis-cli keys "*"

echo -e "\n🎉 테스트 완료!"
