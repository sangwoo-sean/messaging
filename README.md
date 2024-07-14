# Messaging Server

## Roles
### 1. 메세지 전송
- 데이터 검증
  - 파일 파싱 및 token 값 검증
- 메세지 전송을 queue service (dispatcher) 에게 요청
- 데이터 베이스에 받은 요청과 처리 상태값 저장

#### 1.1. Input

#### 1.1.1. Body
> body로 title, description, tokens 를 받아 대상 token 들에게 발송요청

#### 1.1.2. File
> body로 title, description 를 받고, 대상을 파일로 받아 대상 token 들에게 발송요청

#### 1.1.3. Multiple files
> body로 title, description 를 받고, 대상을 여러개의 파일로 받아 대상 token 들에게 발송요청.

#### 1.2. Output
- request ID 
- status (failed/queued)

#### 1.3. Error handling
- 요청 실패
  - 유효하지 않은 body / file
- 여러 파일로 요청하는 경우, 모든 파일의 파싱이 완료되어야 성공처리

### 2. 처리 결과 조회
성공적인 요청에 한해, 각 메세지 전송건들에 대한 결과를 조회할 수 있다.

#### 2.1. Input
- request ID

#### 2.2. Output
- title
- description
- target tokens count
- target tokens
  - token
  - status (queued, completed, failed)
  - error message (optional)
  - sent time
- requested time
