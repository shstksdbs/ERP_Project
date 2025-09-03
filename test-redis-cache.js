// Redis 캐싱 테스트 스크립트
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// 색상 코드
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// API 호출 함수
async function apiCall(method, url, data = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return response.data;
    } catch (error) {
        log(`❌ API 호출 실패: ${url}`, 'red');
        log(`   오류: ${error.message}`, 'red');
        return null;
    }
}

// 캐시 상태 확인
async function checkCacheStatus() {
    log('\n🔍 캐시 상태 확인 중...', 'blue');
    const result = await apiCall('GET', '/api/cache/status');
    if (result) {
        log(`✅ ${result.message}`, 'green');
        log(`   시간: ${result.timestamp}`, 'blue');
    }
}

// 메뉴 조회 테스트 (캐싱 테스트)
async function testMenuCaching() {
    log('\n🍔 메뉴 캐싱 테스트 시작...', 'blue');
    
    // 첫 번째 호출 (DB에서 조회)
    log('1️⃣ 첫 번째 메뉴 조회 (DB에서 조회)...', 'yellow');
    const start1 = Date.now();
    const menus1 = await apiCall('GET', '/api/menus');
    const time1 = Date.now() - start1;
    
    if (menus1) {
        log(`   조회 시간: ${time1}ms`, 'blue');
        log(`   메뉴 개수: ${menus1.length}`, 'blue');
    }
    
    // 두 번째 호출 (캐시에서 조회)
    log('2️⃣ 두 번째 메뉴 조회 (캐시에서 조회)...', 'yellow');
    const start2 = Date.now();
    const menus2 = await apiCall('GET', '/api/menus');
    const time2 = Date.now() - start2;
    
    if (menus2) {
        log(`   조회 시간: ${time2}ms`, 'blue');
        log(`   메뉴 개수: ${menus2.length}`, 'blue');
        
        // 성능 비교
        if (time2 < time1) {
            log(`   🚀 캐시 효과: ${time1 - time2}ms 빨라짐!`, 'green');
        } else {
            log(`   ⚠️ 캐시 효과가 미미함 (${time2 - time1}ms 느려짐)`, 'yellow');
        }
    }
}

// 대시보드 캐싱 테스트
async function testDashboardCaching() {
    log('\n📊 대시보드 캐싱 테스트 시작...', 'blue');
    
    const branchId = 1; // 테스트용 지점 ID
    
    // 첫 번째 호출
    log(`1️⃣ 지점 ${branchId} 대시보드 KPI 조회 (첫 번째)...`, 'yellow');
    const start1 = Date.now();
    const kpis1 = await apiCall('GET', `/api/dashboard/kpis/${branchId}`);
    const time1 = Date.now() - start1;
    
    if (kpis1) {
        log(`   조회 시간: ${time1}ms`, 'blue');
    }
    
    // 두 번째 호출
    log(`2️⃣ 지점 ${branchId} 대시보드 KPI 조회 (두 번째)...`, 'yellow');
    const start2 = Date.now();
    const kpis2 = await apiCall('GET', `/api/dashboard/kpis/${branchId}`);
    const time2 = Date.now() - start2;
    
    if (kpis2) {
        log(`   조회 시간: ${time2}ms`, 'blue');
        
        if (time2 < time1) {
            log(`   🚀 캐시 효과: ${time1 - time2}ms 빨라짐!`, 'green');
        }
    }
}

// 캐시 클리어 테스트
async function testCacheClearing() {
    log('\n🧹 캐시 클리어 테스트...', 'blue');
    
    // 메뉴 캐시 클리어
    log('1️⃣ 메뉴 캐시 클리어...', 'yellow');
    const result1 = await apiCall('POST', '/api/cache/clear-menu');
    if (result1) {
        log(`   ${result1.message}`, 'green');
    }
    
    // 대시보드 캐시 클리어
    log('2️⃣ 대시보드 캐시 클리어...', 'yellow');
    const result2 = await apiCall('POST', '/api/cache/clear-dashboard');
    if (result2) {
        log(`   ${result2.message}`, 'green');
    }
    
    // 모든 캐시 클리어
    log('3️⃣ 모든 캐시 클리어...', 'yellow');
    const result3 = await apiCall('POST', '/api/cache/clear-all');
    if (result3) {
        log(`   ${result3.message}`, 'green');
    }
}

// Redis 키 확인
async function checkRedisKeys() {
    log('\n🔑 Redis 키 확인...', 'blue');
    
    // Docker를 통해 Redis 키 확인
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
        exec('docker exec redis-server redis-cli keys "*"', (error, stdout, stderr) => {
            if (error) {
                log(`❌ Redis 키 조회 실패: ${error.message}`, 'red');
                resolve();
                return;
            }
            
            const keys = stdout.trim().split('\n').filter(key => key.length > 0);
            if (keys.length > 0) {
                log(`   발견된 키 개수: ${keys.length}`, 'blue');
                keys.forEach(key => {
                    log(`   - ${key}`, 'blue');
                });
            } else {
                log('   캐시된 키가 없습니다.', 'yellow');
            }
            resolve();
        });
    });
}

// 메인 테스트 함수
async function runTests() {
    log('🚀 Redis 캐싱 테스트 시작!', 'green');
    log('=' * 50, 'blue');
    
    try {
        // 1. 캐시 상태 확인
        await checkCacheStatus();
        
        // 2. 메뉴 캐싱 테스트
        await testMenuCaching();
        
        // 3. 대시보드 캐싱 테스트
        await testDashboardCaching();
        
        // 4. Redis 키 확인
        await checkRedisKeys();
        
        // 5. 캐시 클리어 테스트
        await testCacheClearing();
        
        // 6. 최종 Redis 키 확인
        await checkRedisKeys();
        
        log('\n🎉 모든 테스트가 완료되었습니다!', 'green');
        
    } catch (error) {
        log(`❌ 테스트 중 오류 발생: ${error.message}`, 'red');
    }
}

// 테스트 실행
runTests();
