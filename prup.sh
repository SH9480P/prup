#!/bin/bash

set -e

#########################################################
# PR 등록을 위한 변수; 필요 시 하드코딩하여 사용 요망
# head 브랜치가 forked 레포지토리 or 내가 주인이 아닌 레포지토리에 있으면 HEAD_BRANCH는 "USERNAME:BRANCHNAME" 형식이 되어야 함

REPO="SH9480P/bookish-octo-fortnight"

BASE_BRANCH="main"
HEAD_BRANCH="hi"

TITLE=""
FILEPATH=""

########################################################

# 옵션 저장
# --head가 생략되면 본 스크립트를 실행하는 위치의 브랜치가 head 브랜치로 간주됨
while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --repo|-r)
            REPO="$2"
            shift 2
            ;;
        --base|-b)
            BASE_BRANCH="$2"
            shift 2
            ;;
        --head|-h)
            HEAD_BRANCH="$2"
            shift 2
            ;;
        --title|-t)
            TITLE="$2"
            shift 2
            ;;
        --file|-f)
            FILEPATH="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# 필수 옵션 검사

if [ -z "$REPO" ]; then
    echo "Repository is not provided..."
    exit 1
fi

if [ -z "$BASE_BRANCH" ]; then
    echo "Base branch is not provided..."
    exit 1
fi

if [ ! -r $FILEPATH ]; then
    echo "\"${FILEPATH}\" is not exist or not readable..."
    exit 1
fi

#########################################################
# Github CLI 로그인
# pass로 저장한 PAT를 넘겨줌; --with-token 지우면 interactive하게 인증 가능

pass mygit | gh auth login -h github.com --with-token

#########################################################

# 마크다운 파일에 링크된 이미지 업로드하고 파일 업데이트하기
node js/index.js $FILEPATH


# title이 없으면 interactive하게 입력받기
if [ -z $TITLE ]; then
    write_title() {
        echo "What is your PR title?"
        read -e -p ": " TITLE

        if [ -z $TITLE ]; then
            echo "No PR title is provided..."
            exit 1
        fi
    }
    while true; do
        write_title
        
        echo -e "\nPR Title: \"${TITLE}\""
        
        read -e -p "Re-enter PR title? [y/n]: " input
        input=$(echo "$input" | tr '[:upper:]' '[:lower:]')
        
        case $input in
            y|yes)
                ;;
            n|no|"")
                break
                ;;
            *)
                echo "Please enter 'y' to re-enter, 'n' to continue, or just press Enter to skip."
                ;;
        esac
    done
    echo ""
fi

# gh pr create 옵션 생성
GH_PR_CREATE_OPTIONS_STRING="--body-file \"${FILEPATH}\" --title \"${TITLE}\" -R \"${REPO}\" --base \"${BASE_BRANCH}\""
if [ ! -z $HEAD_BRANCH ]; then
    GH_PR_CREATE_OPTIONS_STRING+=" --head \"${HEAD_BRANCH}\""
fi

# gh pr create 실행
echo $GH_PR_CREATE_OPTIONS_STRING | xargs gh pr create

gh auth logout

exit 0