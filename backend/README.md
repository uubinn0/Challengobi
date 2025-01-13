# 웹 디자인 Backend

## 소개
웹 디자인 프로젝트의 Backend 코드

## 기술스택 및 라이브러리

| Project | Version | Description |
| ------- | ------- | ----------- |
| Python | 3.12 | Programming Language |
| Django | 3.2.9+ | Web Framework |
| Django REST Framework | 3.12.4+ | REST API Framework |
| MySQL | 8.0+ | Database |
| django-cors-headers | - | CORS 처리 |
| drf-yasg | - | Swagger/OpenAPI 문서 생성 |
| Simple JWT | 5.3.1+ | JWT Authentication |
| mysqlclient | - | MySQL Python Connector |

## 개발 환경 구성

1. 프로젝트 다운로드
    ```bash
    git clone <repo URL> <folder-name>
    ```

2. backend 폴더로 이동
    ```bash
    cd <folder-name>/backend
    ```

3. 가상환경 생성 및 활성화
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    ```

4. 패키지 설치
    ```bash
    pip install -r backend/requirements.txt
    ```

5. 데이터베이스 설정
   - MySQL 서버 설치  
    MySQL 공식 사이트 (https://dev.mysql.com/downloads/installer/) 접속  
    "MySQL Installer for Windows" 다운로드  
    "Windows (x86, 32-bit), MSI Installer" 또는 "Windows (x86, 64-bit), MSI Installer" 선택
   - 데이터베이스 생성  
   MySQL Command Line Client 실행 후
   ```sql
   CREATE DATABASE `ssafy-sns` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'ssafy'@'localhost' IDENTIFIED BY 'ssafy1234!';
   GRANT ALL PRIVILEGES ON `ssafy-sns`.* TO 'ssafy'@'localhost';
   FLUSH PRIVILEGES;
   ```

6. 마이그레이션
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

7. 서버 실행
    ```bash
    python manage.py runserver
    ```

## API 문서
- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

## 기본 API 엔드포인트

- 사용자 인증
  - `POST /api/token/`: JWT 토큰 발급
  - `POST /api/token/refresh/`: JWT 토큰 갱신
  - `POST /api/token/verify/`: JWT 토큰 검증

- 계정 관리
  - `POST /account/signup`: 회원가입
  - `GET /account`: 사용자 목록
  - `GET /account/<int:pk>`: 사용자 상세 정보

## 필요 소프트웨어

- Python 3.12
- MySQL 8.0+
- Visual Studio Build Tools (Windows 환경의 경우)

## 환경 변수 설정

데이터베이스 설정 (settings.py):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'ssafy-sns',
        'USER': 'ssafy',
        'PASSWORD': 'ssafy1234!',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}
```

## 개발 시 주의사항

1. Windows 환경에서 mysqlclient 설치 시 Visual Studio Build Tools가 필요합니다.
2. CORS 설정이 필요한 경우 settings.py의 CORS_ALLOWED_ORIGINS를 확인하세요.
3. JWT 토큰 설정은 settings.py의 SIMPLE_JWT 설정을 참고하세요.