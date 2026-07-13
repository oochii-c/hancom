# 🪄 Micro-Interaction Crafter

> 브라우저 기반 온디바이스 웹 애니메이션 디자인 샌드박스

본 프로젝트는 프론트엔드 개발자와 디자이너를 위한 마이크로 인터랙션 제작 도구입니다. 복잡한 영상 편집 툴이나 모바일 네이티브 환경(Swift 등)의 애니메이션 도구와 달리, 철저하게 웹 표준 환경(DOM)에서 구동됩니다.

사용자는 캔버스 위에서 UI 컴포넌트의 움직임을 시각적으로 조각(Craft)하고, 완성된 애니메이션을 즉각적인 프론트엔드 코드(CSS/JS)로 추출하여 자신의 프로젝트에 도입할 수 있습니다.

## ✨ Core Features

- **Live Animation Canvas (실시간 렌더링 캔버스)**
  - 조작 즉시 브라우저 메인 스레드에서 렌더링되는 단일 오브젝트 샌드박스
  - 서버 통신(업로드/다운로드) 없이 100% 클라이언트 사이드에서 구동되는 무지연(Zero-latency) 피드백
- **Timeline & Curve Editor (시각적 타이밍 제어)**
  - 마우스 드래그 앤 드롭으로 제어하는 Cubic-bezier 곡선 그래프 UI
  - `ease-in`, `ease-out`, `elastic` 등 애니메이션의 가속도와 탄성을 직관적으로 디자인
- **Property Sandbox (속성 제어 패널)**
  - 감상적인 디자인 요소를 배제한 미니멀하고 건조한 형태의 슬라이더 UI
  - `scale`, `rotate`, `opacity`, `translate` 등 CSS Transform의 핵심 속성을 밀리초(ms) 단위로 정밀 타겟팅
- **Real-time Code Export (실시간 코드 직렬화)**
  - 시각적으로 완성된 상태(State)를 즉시 프론트엔드 코드로 변환
  - CSS Keyframes 텍스트 및 JS Web Animations API 코드 블록을 실시간으로 화면 우측에 출력 및 복사 지원

## 🛠 Tech Stack

- **Core:** React, Vanilla JavaScript
- **Animation:** CSS3 Transitions/Keyframes, Web Animations API
- **UI/UX:** HTML DOM API (Drag & Drop, Canvas Event)

## 🚀 Getting Started

외부 서버나 DB 구축이 필요 없는 100% 프론트엔드 온디바이스 애플리케이션입니다.

### Installation

```bash
# 1. 저장소를 클론합니다.
git clone https://github.com/your-username/micro-interaction-crafter.git

# 2. 프로젝트 폴더로 이동하여 패키지를 설치합니다.
cd micro-interaction-crafter
npm install

# 3. 로컬 개발 서버를 실행합니다.
npm start
```

## 🗓 Roadmap (Milestones)

- [x] **Phase 1: Canvas & Property State**
  - 중앙 렌더링 캔버스 및 조작 대상(Target Object) 컴포넌트 마크업
  - `scale`, `opacity` 등을 제어하는 슬라이더 UI와 React 상태(State) 동기화
- [x] **Phase 2: The Curve Editor**
  - 마우스 드래그 이벤트에 반응하는 베지에 곡선(Cubic-bezier) 제어 UI 구현
  - 시각적 곡선 데이터를 애니메이션 `timing-function` 값으로 실시간 변환
- [x] **Phase 3: Serialization & Export**
  - React 내부의 애니메이션 상태 값들을 CSS Keyframes 문자열로 직렬화(Serialization)
  - JS Web Animations API 형태의 코드 블록 출력 및 클립보드 복사 기능 탑재
- [ ] **Phase 4: Local File Integration**
  - 브라우저 File API를 활용하여, 사용자의 로컬 이미지를 캔버스로 불러와 테스트하는 기능 추가
