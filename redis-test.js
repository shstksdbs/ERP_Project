// Redis 연결 테스트 스크립트
const redis = require('redis');

// Redis 클라이언트 생성
const client = redis.createClient({
    host: 'localhost',
    port: 6379
});

// 연결 이벤트 처리
client.on('connect', () => {
    console.log('✅ Redis 서버에 연결되었습니다.');
});

client.on('error', (err) => {
    console.error('❌ Redis 연결 오류:', err);
});

// 연결
client.connect();

// 테스트 함수
async function testRedis() {
    try {
        // 1. 기본 연결 테스트
        const pong = await client.ping();
        console.log('🏓 PING 응답:', pong);
        
        // 2. 데이터 저장 테스트
        await client.set('test:key', 'Hello Redis!');
        console.log('💾 데이터 저장 완료');
        
        // 3. 데이터 조회 테스트
        const value = await client.get('test:key');
        console.log('📖 저장된 데이터:', value);
        
        // 4. TTL 설정 테스트
        await client.setEx('test:ttl', 10, 'TTL 테스트 데이터');
        console.log('⏰ TTL 설정 완료 (10초)');
        
        // 5. 키 목록 조회
        const keys = await client.keys('test:*');
        console.log('🔑 테스트 키 목록:', keys);
        
        // 6. 데이터 삭제
        await client.del('test:key');
        console.log('🗑️ 데이터 삭제 완료');
        
        console.log('\n🎉 Redis 테스트가 성공적으로 완료되었습니다!');
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
    } finally {
        // 연결 종료
        await client.quit();
        console.log('👋 Redis 연결이 종료되었습니다.');
    }
}

// 테스트 실행
testRedis();
