# Messaging Server

## Roles
### 1. 메세지 전송
- 데이터 검증
  - 파일 파싱 및 token 값 검증
- 메세지 전송을 queue service (dispatcher) 에게 요청
- 데이터 베이스에 받은 요청과 처리 상태값 저장

#### 1.1. Input

#### 1.1.1. Body
- title
- description
- tokens
 
토큰(들) 검증 이후 메세지 큐잉

#### 1.1.2. File
- body
  - title
  - description
- file
  - tokens
 
파일 파싱이 완료되면 메세지 큐잉 시작

#### 1.1.3. Multiple files
- body
  - title
  - description
- file
  - tokens

**모든 파일**의 파싱이 완료된것 확인 후 메세지 큐잉 시작

#### 1.2. Output
- 성공시
  - request ID
- 실패시
  - error message
    - 유효하지 않은 토큰
    - 유효하지 않은 파일
    - 500


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


---

GPT conversation [Link](https://chatgpt.com/share/2f6c9904-7777-4f3b-a920-c694694530f5)

---
## 질문

- 각 요청에 대한 상태와 (request A: success)
- 한 요청 안의 각 전송에 대한 상태 (request A - msg a: success / msg b: success / msg b: fail )

모두 기록해야하는가?