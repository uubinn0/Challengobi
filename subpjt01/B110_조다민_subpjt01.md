# Docker
Notion URL: https://www.notion.so/Docker-17e693e01bc080cf84f4eea5a7b3766f?pvs=4
(notion에 정리한 내용이라 이미지가 깨지는 경우가 있어서 url도 올립니다.
깨진 이미지 내용 -> 직접 docker 실행한 내용용)

## 명령어

1. 기본
    1. 컨테이너
        1. docker container 하위_커맨드 옵션
        
        | 하위 커맨드 | 내용 | 생략 가능여부 | 주요 옵션 |
        | --- | --- | --- | --- |
        | start | 컨테이너 실행 | O | -i |
        | stop | 컨테이너 정지 | O | 거의 사용하지 않음 |
        | create | 도커 이미지로부터 컨테이너 생성 | O | —name -e -p -v |
        | run | 도커 이미지를 내려받고( docker image pull {image name}) 컨테이너를 생성해 실행 | O | —name -e -p -v -d -i -t |
        | rm | 정지 상태의 컨테이너 삭제 | O | -f -v |
        | exec | 실행 중인 컨테이너 속에서 프로그램을 실행 | O | -i -t |
        | ls | 컨테이너 목록 출력 | 생략형은 docker ps | -a |
        | cp | 도커 컨테이너와 도커 호스트 간 파일 복사 | O | 거의 사용하지 않음 |
        | commit | 도커 컨테이너를 이미지로 변환 | O | 거의 사용하지 않음 |
    2. 이미지
        1. docker image 하위_커맨드 옵션
        
        | 하위 커맨드 | 내용 | 생략 가능여부 | 주요 옵션 |
        | --- | --- | --- | --- |
        | pull | 도커 허브 등의 repeository에서 이미지 내려받기 | O | 거의 사용하지 않음 |
        | rm | 도커 이미지 삭제 | 생략형은
        docker rmi | 거의 사용하지 않음 |
        | ls | 내려받은 이미지 목록 | X | 거의 사용하지 않음 |
        | build | 도커 이미지 생성 | O | -t |
    3. 볼륨
        1. docker volume 하위_커맨드 옵션
        2. 볼륨(컨테이너에 마운트 가능한 스토리지)과 관련된 기능 실행
        
        | 하위 커맨드 | 내용 | 생략 가능 여부 | 주요 옵션 |
        | --- | --- | --- | --- |
        | create | 볼륨 생성 | X | —name |
        | inspect | 볼륨의 상세 정보 출력 | X | 거의 사용하지 않음 |
        | ls | 볼륨 목록 | X | -a |
        | prune | 마운트되지 않은 볼륨 모두 삭제 | X | 거의 사용하지 않음 |
        | rm | 지정한 볼륨 삭제 | X | 거의 사용하지 않음 |
    4. 네트워크
        1. docker network 하위_커맨드 옵션
        2. 도커간 통신에 사용하는 네트워크
        
        | 하위 커맨드 | 내용 | 생략 가능 여부 | 주요 옵션 |
        | --- | --- | --- | --- |
        | connect | 컨테이너를 도커 네트워크에 연결 | X | 거의 사용하지 않음 |
        | disconnect | 컨테이너를 도커 네트워크 연결 해제 | X | 거의 사용하지 않음 |
        | create | 도커 네트워크 생성 | X | 거의 사용하지 않음 |
        | inspect | 도커 네트워크 상세 정보 출력 | X | 거의 사용하지 않음 |
        | ls | 도커 네트워크 목록 | X | 거의 사용하지 않음 |
        | prune | 컨테이너가 접속하지 않은 네트워크 삭제 | X | 거의 사용하지 않음 |
        | rm | 지정한 네트워크 삭제 | X | 거의 사용하지 않음 |
    5. 단독
        1. 도커 허브 검색이나 로그인에 사용
        
        | 커맨드 | 내용 | 주요 옵션 |
        | --- | --- | --- |
        | login | 도커 레지스트리에 로그인 | -u -p |
        | logout | 도커 레지스트리에 로그아웃 | 거의 사용하지 않음 |
        | search | 도커 레지스트리를 검색 | 거의 사용하지 않음 |
        | version | 도커 엔진 및 명령행 도구의 버전 출력 | 거의 사용하지 않음 |

### docker run (option) image (인자)

| option | content |
| --- | --- |
| —name | 컨테이너 이름 저장 |
| -p | 포트 번호를 지정 |
| -v | 볼륨을 맘운트 |
| —net=네트워크_이름 | 컨테이너를 네트워크에 연결 |
| -e 환경변수_이름=값 | 환경변수를 설정 |
| -d | 백그라운드로 실행 |
| -i | 컨테이너에 터미널(키보드) 연결 |
| -t | 특수 키를 사용 가능하도록 함 |
| -help | 사용 방법 안내 메시지를 출력 |

### docker ps

| 항목 | 내용 |
| --- | --- |
| CONTAINER ID | 컨테이너 식별자 |
| IMAGE | 컨테이너를 만들 때 사용한 이미지 이름 |
| COMMAND | 컨테이너 실행 시에 실행하도록 설정된 프로그램 이름 |
| CREATE | 컨테이너 생성 후 경과된 시간 |
| STATUS | 컨테이너의 현재 상태. 실행 중이라면 ‘Up’, 종료된 상태라면 ‘Exited’가 출력 |
| PORTS | 컨테이너에 할당된 포트 번호. ‘호스트 포트 번호 → 컨테이너 포트 번호’ 형식으로 출력
포트 번호가 동일할 경우 →의 뒷부분은 출력되지 않음 |
| NAMES | 컨테이너의 이름 |

### 컨테이너 생성, 실행, 상태확인, 종료, 삭제

- 아파치 이미지(httpd)를 이용해 apa000ex1이라는 컨테이너를 생성, 실행

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/b35e695c-0b60-444a-b80d-fe8eec25a884/image.png)

- 컨테이너 종료

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/b6ff65fa-e32d-4355-b4c0-755940da9de4/image.png)

- 컨테이너 존재 확인

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/052cc008-671e-45bf-a833-1ea08f6f786e/image.png)

- 컨테이너 삭제

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/fa176571-8d0e-41cb-986a-acabef605026/image.png)

## 컨테이너 통신

- 포트 설정 방법

-p 호스트_포트_번호:컨테이너_포트_번호

- 웹사이트로 접근

http://localhost:포트번호

*localhost: 현재 사용중인 컴퓨터

### 통신이 가능한 컨테이너 생성

- 컨테이너 생성

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/c7e15371-960c-4a74-ace8-c466ceb9d277/image.png)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/75c00565-2eb8-4dff-8210-6771fee4e98d/image.png)

- 컨테이너 종료

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/365cdbc9-115a-451e-acc1-2ac1a1e147ce/image.png)

- 컨테이너 삭제

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/0bc1444b-7275-4f3d-af34-950a7fdbc774/image.png)

## 컨테이너

- 리눅스 운영체제가 담긴 컨테이너
    
    
    | 이미지 이름 | 컨테이너의 내용 | 컨테이너 실행에 주로 사용되는 옵션 및 인자 |
    | --- | --- | --- |
    | ubuntu | 우분투 | -d 없이 -it옵션만 사용.
    인자로는 /bin/bash 등 셸 명령어를 지정 |
    | centos | centOS | 위와 같음 |
    | debian | 데비안 | 위와 같음 |
    | fedora | 페도라 | 위와 같음 |
    | busybox | BizyBox | 위와 같음 |
    | alpine | 알파인 리눅스 | 위와 같음 |
- 웹 서버/데이터베이스 서버용 컨테이너
    
    
    | 이미지 이름 | 컨테이너 내용 | 컨테이너 실행에 주로 사용되는 옵션 및 인자 |
    | --- | --- | --- |
    | httpd | Apache | -d로 백그라운드로 실행. -p로 포트 번호 지정 |
    | nginx | Nginx | -d로 백그라운드로 실행. -p로 포트 번호 지정 |
    | mysql | MySQL | -d를 사용. 
    실행 시  -e MYSQL_ROOT_PASSWORD와 같이 루트 패스워드를 지정 |
    | postgres | PostgreSQL | -d를 사용. 
    실행 시  -e POSTGRES_ROOT_PASSWORD와 같이 루트 패스워드를 지정 |
    | mariadb | MariaDB | -d를 사용. 
    실행 시  -e MYSQL_ROOT_PASSWORD와 같이 루트 패스워드를 지정 |
- 프로그램 실행을 위한 런타임과 그 외 소프트웨어
    
    
    | 이미지 이름 | 컨테이너의 내용 | 컨테이너 실행에 주로 사용되는 옵션 및 인자 |
    | --- | --- | --- |
    | openjdk | 자바 런타임 | -d를 사용하지 않고, 인자로 java 명령 등을 지정해 도구 형태로 사용 |
    | python | 파이썬 런타임 | -d를 사용하지 않고, 
    인자로 python 명령 등을 지정해 도구 형태로 사용 |
    | php | PHP 런타임 | 웹 서버가 포함된 것과 실행 명령만 포함된 것으로 나뉘어 제공 |
    | ruby | 루비 런타임 | 웹 서버가 포함된 것과 실행 명령만 포함된 것으로 나뉘어 제공 |
    | perl | 펄 런타임 | -d를 사용하지 않고 인자로  perl 명령 등을 지정해 도구 형태로 사용 |
    | gcc | C/C++ 컴파일러 | -d를 사용하지 않고 인자로  gcc 명령 등을 지정해 도구 형태로 사용 |
    | node | node.js | -d를 사용하지 않고 인자로  app 명령 등을 지정해 도구 형태로 사용 |
    | registry | docker registry | -d 옵션을 사용해 백그라운드로 실행하며, -p 옵션으로 포트 번호를 지정 |
    | wordpress | WordPress | -d 옵션을 사용해 백그라운드로 실행하며, -p 옵션으로 포트 번호를 지정
    MySQL 또는 MariaDB가 필요
    접속에 필요한 패스워드는 -e 옵션으로 지정 |
    | nextcloud | NextCloud | -d 옵션을 사용해 백그라운드로 실행
    -p 옵션으로 포트 번호를 지정 |
    | redmine | Redmine | -d 옵션을 사용해 백그라운드로 실행하며, -p 옵션으로 포트 번호를 지정한다. PostgreSQL 또는 MySQL이 필요 |

### *컨테이너를 여러 개 실행할 때 호스트 컴퓨터의 포트 번호가 중복돼서는 안됨
컨테이너 포트는 중복돼도 무방하므로 모두 80번으로 설정*

### 여러개의 컨테이너 실습

- 여러개의 컨테이너 실행하기

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/31da657f-6554-401e-a861-1fa5baa9e70a/image.png)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/9e3d322a-eefc-41ac-90f4-ad9f661897d0/image.png)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/b8ad6a7d-8aad-4aa9-9871-39f480891674/image.png)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/27d04f35-4f1e-4864-b3a7-9c3bbccf2af5/image.png)

- 컨테이너 중단시키기

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/6ff179de-c41e-4e18-bb7c-8faba44ccc0a/image.png)

- 컨테이너 삭제하기

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/f10a19df-417e-4402-8412-f6bac53247b3/image.png)

### nginx

docker run —name nginx000ex6 -d -p 8084:80 nginx

### MySQL

docker run —name mysql000ex7 -dit -e MYSQL_ROOT_PASSWORD=myrootpass mysql

-dit: 백그라운드에서 실행 및 키보드를 통해 컨테이너 내부의 파일 시스템을 조작

-e MYSQL_ROOT_PASSWORD= : MySQL의 루트 패스워드 지정

mysql: MySQL의 이미지 이름. 버전을 지정하지 않아서 최신 버전이 사용

## 이미지

*컨테이너를 삭제해도 이미지는 그대로 남아 쌓임*

docker image rm 이미지_이름1 이미지_이름2 … ⇒ 이미지 여러개 지정해서 삭제 가능

이미지 버전 지정하는 포맷: 이미지_이름:버전_넘버

ex) docker run —name apa000ex2 -d -p 8080:80 httpd:2.2

→아파치 버전 2.2를 지정해 컨테이너를 실행

### 이미지 목록 정보

TAG → 이미지 버전
같은 이미지 종류에 다른 버전일 경우 버전을 지정해서 삭제하지 않으면 삭제되지 않음

## 워드프레스 구축

워드 프레스는 웹 사이트를 만들기 위한 소프트웨어로 서버에 설치해 사용

MySQL, MariaDB 지원

컨테이너를 두 개 만들기만 해서는 두 컨테이너가 연결되지 않으므로 가상 네트워크를 만들고 이 네트워크에 두 개의 컨테이너를 소속시켜 두 컨테이너를 연결해야 함

⇒ docker network create 네트워크_이름 [명령어_리스트](https://www.notion.so/Docker-17e693e01bc080cf84f4eea5a7b3766f?pvs=21)

### MySQL 컨테이너 실행 시 필요한 옵션과 인자

```bash
docker run --name 컨테이너_이름 #mysql 컨테이너 이름
-dit #실행 옵션 
--net=네트워크_이름 #네트워크 이름
-e MYSQL_ROOT_PASSWORD=MySQL_루트_패스워드 #MySQL 루트 패스워드
-e MYSQL_DATABASE=데이터베이스_이름 #MySQL 데이터베이스 이름
-e MYSQL_USER=MySQL_사용자이름 #MySQL 사용자 이름
-e MYSQL_PASSWORD=MySQL_패스워드 #MySQL 패스워드
mysql 
--character-set-server=utf8mb4 # 문자 인코딩으로 UTF8을 사용
--collation-server=utf8mb4_unicode_ci #정렬 순서로 UTF8을 따름
--default-authentication-plugin=mysql_native_password #인증방식을 예전 방식(native)로 변경
```

패스워드는 루트 패스워드랑 일반 사용자 패스워드 두 가지 설정

→보안 측면

### WordPress 컨테이너 실행 시 필요한 옵션과 인자

```bash
docker run --name 컨테이너_이름 #wordpress 컨테이너 이름
-dit #실행옵션
--net=네트워크_이름 #네트워크 이름
-p 8085:80 #포트번호 설정
-e WORDPRESS_DB_HOST=데이터베이스_컨테이너_이름 #데이터베이스 컨테이너 이름
-e WORDPRESS_DB__NAME=데이터베이스_이름 #데이터베이스 이름
-e WORDPRESS_DB_USER=데이터베이스_사용자_이름 #데이터베이스 사용자 이름
-e WORDPRESS_DB_PASSWORD=데이터베이스_패스워드 #데이터베이스 패스워드
wordpress
```

### 실습

- 네트워크 생성 및 mysql 컨테이너 생성 및 실행

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/3a51b27c-5c5d-48b7-b78b-90fc5eb0284c/image.png)

- wordpress 컨테이너 생성 및 실행

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/b7c08ae2-7c9b-4c72-a420-acfe49344db9/image.png)

- 인데 default-authentication-plugin이 오류나서 빼고 다시 mysql 실행

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/d3f71409-1bca-43fc-a972-cb03d005a039/image.png)

MySQL이 8.0으로 넘어오면서 외부 소프트웨어가 MySQL에 접속하는 인증방식을 밖궈서 이 새로운 인증 방식을 지원하지 않는 SW가 많음→default-authentication-plugin 하는 이유

⇒따라서 mysql 8.0을 지원하는지 여부를 확인 후 설정 추가

- 결과

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/3f6aa4e6-f96c-4348-a7cf-1b8ce4760b5f/image.png)

- 컨테이너 중단

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/8d4e4a01-7326-45f7-ab47-79032c8a7d34/image.png)

- 컨테이너 삭제

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/b856d7ea-0d26-446e-b6b1-106e72499593/image.png)

## 파일 복사

호스트→컨테이너

docker cp 호스트_경로 컨테이너_이름:컨테이너_경로

컨테이너→호스트

docker cp 호스트_이름:호스트_경로 컨테이너_경로

### 호스트의 파일을 컨테이너 속으로 복사

- 컨테이너 생성 → 파일 복사

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/2fddd155-6293-4e3f-8eae-33e894937dd1/image.png)

- 결과

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/734f2956-2165-4132-9913-8ecfc8f1db3a/image.png)

### 컨테이너의 파일을 호스트로 복사

- docker cp 컨테이너 이름:복사할 파일이 있는 경로 복사한 파일 놓을 위치

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/14ae7fff-92e6-457f-a85d-40d3eced0588/image.png)

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/396ea2af-7eb2-4f81-9e90-0326b25d63cd/20c2a799-3547-4ea6-9d6d-f66d6c9040fe/image.png)

## 마운트

|  | 볼륨 마운트 | 바인드 마운트 |
| --- | --- | --- |
| 의의 | 도커 엔진이 고간리하는 영역 내에 만들어진 볼륨을 컨테이너에 디스크 형태로 마운트 | 도커 엔진에서 관리하지 않는 영역의 기존 디렉터리를 컨테이너에 마운트 |
| 특징 | - 도커 엔진의 관리 하에 있으므로 사용자가 파일 위치를 신경 쓸 필요 없음

- 운영체제에 따라 명령어가 달라지는 등의 의존성 문제x

⇒ 익숙해지면 손쉽게 사용 가능

- 도커 컨테이너를 경유하지 않고 직접 볼륨에 접근할 방법x

- 억지로 볼륨을 수정하려고 하면 볼륨 자체가 깨질 우려 o → 백업할 때 복잡한 절차 필요 | - 디렉터리가 아닌 파일 단위로도 마운트 가능 → 자주 사용하는 파일을 두는 데 사용

- 도커가 관리하지 않는 영역 어디라도 파일 둘 수 있음

- 기존과 동일한 방식으로 파일 사용 가능 → 다른 sw를 사용해 쉽게 편집 가능

⇒ 파일을 자주 편집해야 하는 경우에는 바인드 마운트 

# 프로젝트 관련 정보
### 금융 키워드

예금 적금 신탁 ISA 펀드 대출 보험 골드/실버 채권 부동산 외환 퇴직연금(IRP) 어음 주식 코인

### 금융 특화 모델

kf-deBERTa-base finetuning한 모델: https://huggingface.co/upskyy/kf-deberta-multitask

### keyword extraction

yake: https://github.com/LIAAD/yake

keyBERT: [https://velog.io/@about2weeks/keybert를-활용한-한글-문장-키워드-추출](https://velog.io/@about2weeks/keybert%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%ED%95%9C%EA%B8%80-%EB%AC%B8%EC%9E%A5-%ED%82%A4%EC%9B%8C%EB%93%9C-%EC%B6%94%EC%B6%9C)

### 결제 기록 조회 api

https://developers.kftc.or.kr/dev/openapi/open-banking/transaction

방법: https://data-make.tistory.com/434

### 잔액 조회 방법

https://data-make.tistory.com/433

### 신한 api

https://openapi.shinhan.com/apis/?tab=0&pageSize=10&organizationId=96&searchType=1&apiName=&apiGroupName=&pageNo=1

### 국민은행 api

https://obizapi.kbstar.com/quics?page=C108082

### OCR 모델 별 성능 비교

https://devocean.sk.com/blog/techBoardDetail.do?ID=165524&boardType=techBlog

### OCR-tesseract fine tuning

https://github.com/guiem/train-tesseract