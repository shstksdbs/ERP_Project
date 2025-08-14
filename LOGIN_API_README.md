# ERP 시스템 로그인 API

## 개요
ERP 시스템의 사용자 인증을 위한 로그인 API가 구현되었습니다.

## 구현된 기능

### 1. 백엔드 API
- **POST /api/auth/login** - 사용자 로그인
- **POST /api/auth/validate** - JWT 토큰 검증
- **GET /api/branches** - 전체 지점 목록 조회
- **GET /api/branches/active** - 활성 지점 목록 조회
- **GET /api/branches/{branchId}** - 특정 지점 정보 조회

### 2. 데이터베이스
- `users` 테이블 생성
- 임시 사용자 데이터 추가 (5개 지점, 각 지점별 4명의 사용자)
- 역할 기반 권한 시스템 (ADMIN, MANAGER, STAFF)

### 3. 프론트엔드
- 로그인 폼 구현
- 실제 API 연동
- 에러 처리 및 로딩 상태 관리
- 지점 선택 드롭다운 (branches API 연동)

## 사용자 계정 정보

### 테스트용 계정 (간단한 로그인용)
| 사용자명 | 비밀번호 | 지점 ID | 역할 |
|---------|---------|---------|------|
| test1 | test123 | 1 | STAFF |
| test2 | test123 | 2 | STAFF |
| test3 | test123 | 3 | STAFF |

### 실제 지점별 계정
각 지점별로 다음과 같은 계정이 생성되어 있습니다:

#### 지점 1 (강남점)
- `admin_gangnam` / `admin123` - 관리자
- `manager_gangnam` / `manager123` - 지점장
- `staff_gangnam1` / `staff123` - 직원1
- `staff_gangnam2` / `staff123` - 직원2

#### 지점 2 (홍대점)
- `admin_hongdae` / `admin123` - 관리자
- `manager_hongdae` / `manager123` - 지점장
- `staff_hongdae1` / `staff123` - 직원1
- `staff_hongdae2` / `staff123` - 직원2

#### 지점 3 (신촌점)
- `admin_sinchon` / `admin123` - 관리자
- `manager_sinchon` / `manager123` - 지점장
- `staff_sinchon1` / `staff123` - 직원1
- `staff_sinchon2` / `staff123` - 직원2

#### 지점 4 (잠실점)
- `admin_jamsil` / `admin123` - 관리자
- `manager_jamsil` / `manager123` - 지점장
- `staff_jamsil1` / `staff123` - 직원1
- `staff_jamsil2` / `staff123` - 직원2

#### 지점 5 (송파점)
- `admin_songpa` / `admin123` - 관리자
- `manager_songpa` / `manager123` - 지점장
- `staff_songpa1` / `staff123` - 직원1
- `staff_songpa2` / `staff123` - 직원2

## API 사용법

### 로그인 요청
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "test1",
  "password": "test123",
  "branchId": 1
}
```

### 로그인 응답
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "username": "test1",
  "realName": "테스트사용자1",
  "branchId": 1,
  "role": "STAFF",
  "loginTime": "2024-01-15T10:30:00"
}
```

### 토큰 검증
```http
POST /api/auth/validate
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

## 보안 주의사항

⚠️ **중요**: 현재 구현된 비밀번호는 평문으로 저장되어 있습니다. 실제 운영환경에서는 반드시 다음 사항을 적용해야 합니다:

1. **비밀번호 암호화**: BCrypt 등으로 비밀번호 해시화
2. **HTTPS 사용**: 모든 통신을 HTTPS로 암호화
3. **토큰 만료 시간**: JWT 토큰의 적절한 만료 시간 설정
4. **입력값 검증**: XSS, SQL Injection 등 공격 방지
5. **로그인 시도 제한**: Brute Force 공격 방지

## 개발 환경 설정

### 1. 데이터베이스 실행
```bash
# MySQL 실행
mysql -u root -p
```

### 2. 스프링 부트 애플리케이션 실행
```bash
# 프로젝트 루트 디렉토리에서
./mvnw spring-boot:run
```

### 3. 프론트엔드 실행
```bash
# frontend/frontend-branch/erp_branch 디렉토리에서
npm start
```

## 문제 해결

### 로그인 실패 시
1. 데이터베이스 연결 확인
2. 사용자 계정 정보 확인
3. 지점 ID가 올바른지 확인
4. 브라우저 개발자 도구에서 네트워크 오류 확인

### CORS 오류 시
백엔드의 `@CrossOrigin(origins = "*")` 설정 확인

### 데이터베이스 오류 시
`10_users_data.sql` 파일이 올바르게 실행되었는지 확인
