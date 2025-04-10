# prup

로컬 마크다운 파일로 Github PR을 만드는 간단한 프로그램입니다.

> [!NOTE]
> 개인용으로 설계된 프로그램으로, 바로 사용하기는 어려우니 필요 시 코드를 읽고 변경해야 합니다.  
> 개선 계획은 없으며, 자세한 내용은 하단 [배경 및 구조 설명](#배경-및-구조-설명)을 참고하시기 바랍니다.

## Environment
다음과 같은 환경에서 테스트되었습니다.
- Ubuntu 24.04.1 LTS
- Node.js v22.12.0
- Github CLI 2.69.0

## Prerequisite

### Github CLI
https://github.com/cli/cli/blob/trunk/docs/install_linux.md

### Node.js
https://nodejs.org/ko/download

## Setup
```bash
# puppeteer 설치
npm i
```

## Getting Started
```bash
./prup.sh -r 레포 -b 베이스브랜치 -h 헤드브랜치 -t PR제목 -f 마크다운파일주소
```

## 배경 및 구조 설명
https://sehwan-park.notion.site/PR-1cdc89eb183c80f2b607e977a5c1ab6c