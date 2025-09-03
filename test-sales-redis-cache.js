// 매출 데이터 Redis 캐싱 테스트 스크립트
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

// 색상 코드
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
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

// 매출 통계 캐싱 테스트
async function testSalesStatisticsCaching() {
    log('\n📊 매출 통계 캐싱 테스트 시작...', 'cyan');
    
    const branchId = 1;
    const startDate = '2024-09-01';
    const endDate = '2024-09-30';
    
    // 1. 일별 매출 조회 (첫 번째 - DB에서 조회)
    log('1️⃣ 일별 매출 조회 (첫 번째 - DB에서 조회)...', 'yellow');
    const start1 = Date.now();
    const dailySales1 = await apiCall('GET', `/api/sales-statistics/daily/${branchId}?startDate=${startDate}&endDate=${endDate}`);
    const time1 = Date.now() - start1;
    
    if (dailySales1) {
        log(`   조회 시간: ${time1}ms`, 'blue');
        log(`   데이터 개수: ${dailySales1.length}`, 'blue');
    }
    
    // 2. 일별 매출 조회 (두 번째 - 캐시에서 조회)
    log('2️⃣ 일별 매출 조회 (두 번째 - 캐시에서 조회)...', 'yellow');
    const start2 = Date.now();
    const dailySales2 = await apiCall('GET', `/api/sales-statistics/daily/${branchId}?startDate=${startDate}&endDate=${endDate}`);
    const time2 = Date.now() - start2;
    
    if (dailySales2) {
        log(`   조회 시간: ${time2}ms`, 'blue');
        log(`   데이터 개수: ${dailySales2.length}`, 'blue');
        
        if (time2 < time1) {
            log(`   🚀 캐시 효과: ${time1 - time2}ms 빨라짐!`, 'green');
        } else {
            log(`   ⚠️ 캐시 효과가 미미함 (${time2 - time1}ms 느려짐)`, 'yellow');
        }
    }
    
    // 3. 시간대별 매출 분석
    log('3️⃣ 시간대별 매출 분석 (첫 번째)...', 'yellow');
    const start3 = Date.now();
    const hourlySales1 = await apiCall('GET', `/api/sales-statistics/hourly?startDate=${startDate}&endDate=${endDate}`);
    const time3 = Date.now() - start3;
    
    if (hourlySales1) {
        log(`   조회 시간: ${time3}ms`, 'blue');
    }
    
    // 4. 시간대별 매출 분석 (두 번째)
    log('4️⃣ 시간대별 매출 분석 (두 번째)...', 'yellow');
    const start4 = Date.now();
    const hourlySales2 = await apiCall('GET', `/api/sales-statistics/hourly?startDate=${startDate}&endDate=${endDate}`);
    const time4 = Date.now() - start4;
    
    if (hourlySales2) {
        log(`   조회 시간: ${time4}ms`, 'blue');
        
        if (time4 < time3) {
            log(`   🚀 캐시 효과: ${time3 - time4}ms 빨라짐!`, 'green');
        }
    }
}

// 매출 개요 캐싱 테스트
async function testSalesOverviewCaching() {
    log('\n📈 매출 개요 캐싱 테스트 시작...', 'cyan');
    
    const year = 2024;
    const month = 9;
    
    // 1. 매출 개요 조회 (첫 번째)
    log('1️⃣ 매출 개요 조회 (첫 번째)...', 'yellow');
    const start1 = Date.now();
    const overview1 = await apiCall('GET', `/api/sales-overview?year=${year}&month=${month}`);
    const time1 = Date.now() - start1;
    
    if (overview1) {
        log(`   조회 시간: ${time1}ms`, 'blue');
        log(`   가맹점 수: ${overview1.franchises?.length || 0}`, 'blue');
    }
    
    // 2. 매출 개요 조회 (두 번째)
    log('2️⃣ 매출 개요 조회 (두 번째)...', 'yellow');
    const start2 = Date.now();
    const overview2 = await apiCall('GET', `/api/sales-overview?year=${year}&month=${month}`);
    const time2 = Date.now() - start2;
    
    if (overview2) {
        log(`   조회 시간: ${time2}ms`, 'blue');
        
        if (time2 < time1) {
            log(`   🚀 캐시 효과: ${time1 - time2}ms 빨라짐!`, 'green');
        }
    }
    
    // 3. 일별 매출 추이 조회
    log('3️⃣ 일별 매출 추이 조회 (첫 번째)...', 'yellow');
    const start3 = Date.now();
    const trend1 = await apiCall('GET', `/api/sales-overview/daily-trend?year=${year}&month=${month}`);
    const time3 = Date.now() - start3;
    
    if (trend1) {
        log(`   조회 시간: ${time3}ms`, 'blue');
        log(`   날짜 수: ${trend1.dates?.length || 0}`, 'blue');
    }
    
    // 4. 일별 매출 추이 조회 (두 번째)
    log('4️⃣ 일별 매출 추이 조회 (두 번째)...', 'yellow');
    const start4 = Date.now();
    const trend2 = await apiCall('GET', `/api/sales-overview/daily-trend?year=${year}&month=${month}`);
    const time4 = Date.now() - start4;
    
    if (trend2) {
        log(`   조회 시간: ${time4}ms`, 'blue');
        
        if (time4 < time3) {
            log(`   🚀 캐시 효과: ${time3 - time4}ms 빨라짐!`, 'green');
        }
    }
}

// 상품 매출 캐싱 테스트
async function testProductSalesCaching() {
    log('\n🛍️ 상품 매출 캐싱 테스트 시작...', 'cyan');
    
    const year = 2024;
    const month = 9;
    
    // 1. 상품별 매출 데이터 조회 (첫 번째)
    log('1️⃣ 상품별 매출 데이터 조회 (첫 번째)...', 'yellow');
    const start1 = Date.now();
    const productSales1 = await apiCall('GET', `/api/product-sales?year=${year}&month=${month}`);
    const time1 = Date.now() - start1;
    
    if (productSales1) {
        log(`   조회 시간: ${time1}ms`, 'blue');
        log(`   상품 수: ${productSales1.productSales?.length || 0}`, 'blue');
        log(`   총 매출: ${productSales1.totalSales || 0}원`, 'blue');
    }
    
    // 2. 상품별 매출 데이터 조회 (두 번째)
    log('2️⃣ 상품별 매출 데이터 조회 (두 번째)...', 'yellow');
    const start2 = Date.now();
    const productSales2 = await apiCall('GET', `/api/product-sales?year=${year}&month=${month}`);
    const time2 = Date.now() - start2;
    
    if (productSales2) {
        log(`   조회 시간: ${time2}ms`, 'blue');
        
        if (time2 < time1) {
            log(`   🚀 캐시 효과: ${time1 - time2}ms 빨라짐!`, 'green');
        }
    }
    
    // 3. 가맹점별 매출 분석 데이터 조회
    log('3️⃣ 가맹점별 매출 분석 데이터 조회 (첫 번째)...', 'yellow');
    const start3 = Date.now();
    const franchiseSales1 = await apiCall('GET', `/api/product-sales/franchise?year=${year}&month=${month}`);
    const time3 = Date.now() - start3;
    
    if (franchiseSales1) {
        log(`   조회 시간: ${time3}ms`, 'blue');
        log(`   가맹점별 상품 매출 수: ${franchiseSales1.franchiseProductSales?.length || 0}`, 'blue');
    }
    
    // 4. 가맹점별 매출 분석 데이터 조회 (두 번째)
    log('4️⃣ 가맹점별 매출 분석 데이터 조회 (두 번째)...', 'yellow');
    const start4 = Date.now();
    const franchiseSales2 = await apiCall('GET', `/api/product-sales/franchise?year=${year}&month=${month}`);
    const time4 = Date.now() - start4;
    
    if (franchiseSales2) {
        log(`   조회 시간: ${time4}ms`, 'blue');
        
        if (time4 < time3) {
            log(`   🚀 캐시 효과: ${time3 - time4}ms 빨라짐!`, 'green');
        }
    }
}

// 캐시 클리어 테스트
async function testCacheClearing() {
    log('\n🧹 매출 캐시 클리어 테스트...', 'cyan');
    
    // 매출 통계 캐시 클리어
    log('1️⃣ 매출 통계 캐시 클리어...', 'yellow');
    const result1 = await apiCall('POST', '/api/cache/clear-sales-statistics');
    if (result1) {
        log(`   ${result1.message}`, 'green');
    }
    
    // 매출 개요 캐시 클리어
    log('2️⃣ 매출 개요 캐시 클리어...', 'yellow');
    const result2 = await apiCall('POST', '/api/cache/clear-sales-overview');
    if (result2) {
        log(`   ${result2.message}`, 'green');
    }
    
    // 상품 매출 캐시 클리어
    log('3️⃣ 상품 매출 캐시 클리어...', 'yellow');
    const result3 = await apiCall('POST', '/api/cache/clear-product-sales');
    if (result3) {
        log(`   ${result3.message}`, 'green');
    }
    
    // 모든 매출 캐시 클리어
    log('4️⃣ 모든 매출 캐시 클리어...', 'yellow');
    const result4 = await apiCall('POST', '/api/cache/clear-all-sales');
    if (result4) {
        log(`   ${result4.message}`, 'green');
    }
}

// Redis 키 확인
async function checkRedisKeys() {
    log('\n🔑 Redis 키 확인...', 'cyan');
    
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
                
                // 매출 관련 키만 필터링
                const salesKeys = keys.filter(key => 
                    key.includes('sales') || 
                    key.includes('Sales') ||
                    key.includes('statistics') ||
                    key.includes('overview')
                );
                
                if (salesKeys.length > 0) {
                    log(`   매출 관련 키: ${salesKeys.length}개`, 'magenta');
                    salesKeys.forEach(key => {
                        log(`   - ${key}`, 'magenta');
                    });
                } else {
                    log('   매출 관련 캐시된 키가 없습니다.', 'yellow');
                }
            } else {
                log('   캐시된 키가 없습니다.', 'yellow');
            }
            resolve();
        });
    });
}

// 메인 테스트 함수
async function runTests() {
    log('🚀 매출 데이터 Redis 캐싱 테스트 시작!', 'green');
    log('=' * 60, 'blue');
    
    try {
        // 1. 캐시 상태 확인
        log('\n🔍 캐시 상태 확인 중...', 'blue');
        const status = await apiCall('GET', '/api/cache/status');
        if (status) {
            log(`✅ ${status.message}`, 'green');
        }
        
        // 2. 매출 통계 캐싱 테스트
        await testSalesStatisticsCaching();
        
        // 3. 매출 개요 캐싱 테스트
        await testSalesOverviewCaching();
        
        // 4. 상품 매출 캐싱 테스트
        await testProductSalesCaching();
        
        // 5. Redis 키 확인
        await checkRedisKeys();
        
        // 6. 캐시 클리어 테스트
        await testCacheClearing();
        
        // 7. 최종 Redis 키 확인
        await checkRedisKeys();
        
        log('\n🎉 모든 매출 데이터 Redis 캐싱 테스트가 완료되었습니다!', 'green');
        
    } catch (error) {
        log(`❌ 테스트 중 오류 발생: ${error.message}`, 'red');
    }
}

// 테스트 실행
runTests();
