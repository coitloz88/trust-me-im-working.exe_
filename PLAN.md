# trust-me-im-working.exe_

> 회사에서 일하는 척하면서 즐기는 위장형 미니게임 모음.
> 첫 번째 게임: **vscode맞습니다 믿어주세요**

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 메타 레포명 | **`trust-me-im-working.exe_`** |
| 첫 게임 한글명 | vscode맞습니다 믿어주세요 |
| 첫 게임 폴더명 | `trust-me-its-vscode` |
| 한 줄 소개 | VSCode 셸 위에서 돌아가는 위장형 미니게임 모음. 첫 작품은 코드 사이의 버그를 잡는 클리커. |
| 플랫폼 | 웹 (데스크탑 우선) |
| 배포 | GitHub Pages |
| 1차 목표 | 게임 하나 (vscode맞습니다 믿어주세요) + 다른 게임을 추가하기 쉬운 셸 구조 |

### 네이밍 컨셉

메타 레포는 "일하고 있습니다 믿어주세요"라는 거짓말 자체. 각 게임은 그 거짓말의 구체적 변주.

- `trust-me-im-working.exe_` ← 우산 거짓말 ("나 일하고 있어")
  - `trust-me-its-vscode` ← 구체적 거짓말 1 ("이거 VSCode야")
  - `trust-me-im-saving` ← 구체적 거짓말 2 ("저장 중이야")
  - `trust-me-its-still-vscode` ← 구체적 거짓말 3 ("아직도 VSCode야 진짜로")

`.exe_` 접미사는 Windows에서 실행파일이 위장하느라 이상하게 끝나는 그 느낌의 농담. URL로 봤을 때도 수상함.

### 왜 처음부터 메타 레포인가
- 같은 위장 컨셉의 게임을 여러 개 만들 가능성이 있고,
- VSCode 사이드바에 "파일이 늘어나면 콘텐츠가 추가되는" 메타포가 컨셉과 정확히 맞아떨어지며,
- 셸(사이드바, 상태바, 보스키)을 한 번만 만들고 모든 게임이 공유하면 개발 비용이 줄기 때문.

당장은 게임이 하나뿐이라 사이드바엔 파일 하나만 보이지만, 추가될 때마다 자연스럽게 늘어난다.

---

## 2. 핵심 컨셉

이 프로젝트의 모든 디자인 결정은 단 하나의 질문으로 수렴한다:

> **"옆자리 동료가 0.5초 흘끗 봤을 때, 이게 게임이라는 걸 들킬까?"**

들키지 않는 것이 곧 재미다. 게임 화면 자체가 진짜 VSCode와 픽셀 단위로 비슷해야 하고, 게임 요소(점수, 버그, 콤보)는 IDE 안에 자연스럽게 녹아 있어야 한다. 점수판이 따로 떠 있으면 즉시 망한다.

### 톤
- **병맛 ≠ 대충**: 농담은 가볍지만, UI 완성도는 진지하게.
- VSCode Dark+ 테마를 정확히 재현한다. 폰트(Cascadia Code/D2Coding), 색상 토큰, 사이드바 아이콘까지.
- 한국 IT 직장인 정서를 슬쩍 끼얹는다. 다만 너무 특정 회사 같지는 않게.

---

## 3. 게임플레이 — vscode맞습니다 믿어주세요

### 3.1. 메인 루프

1. 게임을 켜면 VSCode가 열려 있다. 워크스페이스에 파일이 몇 개 열려 있고, 에디터 영역에 가짜 TypeScript 코드가 한 줄씩 자동 타이핑된다.
2. 자동 타이핑되는 코드 사이사이로 **버그(🐛)**, **경고(⚠️)**, **에러(❌)** 가 슬쩍 끼어든다.
3. 플레이어는 마우스로 클릭하거나 키보드 단축키로 처리한다.
4. 처리할 때마다 하단 터미널에 가짜 로그가 찍히고, 상태바의 카운터가 올라간다.
5. 시간이 지날수록 등장 속도가 빨라지고, 더 까다로운 변형이 섞여 나온다.

### 3.2. 적(?) 종류

| 아이콘 | 이름 | 동작 |
|---|---|---|
| 🐛 | 버그 | 클릭하면 +10점. 터미널에 `✓ fixed bug in <파일명>:<랜덤 라인>` 출력 |
| ⚠️ | 경고 | 5초 안에 클릭 안 하면 에디터 줄 전체가 노란 밑줄 표시되고 -20점 |
| ❌ | 에러 | 같은 줄에 있는 다른 버그/경고와 함께 터짐. 잘 보고 클릭해야 보너스 +50점 |
| 💀 | 머지 컨플릭트 | 클릭하면 작은 모달: `HEAD` vs `incoming` 중 선택. 정답 시 +30점, 오답 시 패널티 |
| 🔥 | 프로덕션 버그 | 빨갛게 깜빡거림. 3초 안에 처리하면 +100점, 아니면 화면 전체가 빨개지면서 -100점 |

### 3.3. 콤보 시스템

연속해서 같은 종류를 처리하면 콤보가 쌓이고, 화면 우상단 상태바에 IDE스럽게 표시된다:

```
Combo: x12  |  Streak: bug-fixing  |  ▲ 2,340 LOC today
```

콤보 5단계마다 가짜 알림이 뜬다:
- 5x: `Linter: looking good`
- 10x: `Copilot: nice work, keep going`
- 20x: `git: ready to commit`
- 50x: `국쨩이 자리에서 일어났습니다` ← 농담 톤 전환

---

## 4. 보스키 시스템 (이 게임의 핵심)

### 4.1. 작동

- 단축키: **`Esc`** (게이머라면 익숙한, 직장인이라면 도망의 키)
- 누른 순간 0.1초 이내에 화면이 "진짜 일하고 있는 VSCode"로 전환된다.
- 한 번 더 누르면 게임 모드 복귀. 게임은 백그라운드에서 계속 진행 중 (점수도, 시간도, 버그도 그대로 흐름).

### 4.2. 위장 모드의 디테일

위장 모드일 때 보여줄 화면을 진짜처럼 만드는 게 이 프로젝트의 절반이다.

- **에디터**: 진지해 보이는 코드 (실제 오픈소스 일부를 변형해서 사용하면 더 자연스러움)
- **터미널**: `pnpm build`가 진행 중인 척 로그가 흘러감 (실제로는 미리 녹화된 로그 재생)
- **상태바**: `main`, `0 errors, 0 warnings`, 진지한 파일 인코딩 표시
- **사이드바**: 파일 트리에 그럴듯한 프로젝트 구조
- **탭**: 닫힌 채로 두지 말고, `package.json`, `index.ts`, `README.md` 같은 평범한 파일들

보스키는 게임별 기능이 아니라 **셸 레벨 기능**이다. 어떤 게임을 플레이 중이어도 Esc를 누르면 똑같이 위장된다. 새 게임이 추가되어도 자동으로 보스키가 작동한다.

### 4.3. 들킬 뻔한 횟수 통계

게임이 끝나면 통계 화면에 다음이 표시된다:
- 총 처리한 버그 수
- 최고 콤보
- **보스키 누른 횟수** ("오늘 47번 위기 모면")
- **가장 오래 위장 모드로 있었던 시간** ("3분 21초 동안 진짜로 일하는 척")

---

## 5. 디테일 / 유머 요소

게임의 분위기는 디테일에서 나온다. 아래는 곳곳에 배치할 소재들.

### 5.1. 가짜 파일명 (사이드바 / 탭 표시)

진짜 코딩하는 화면처럼 보여야 하므로, 실무에서 흔히 나오는 이름들로 채운다.

```
src/
├── auth/
│   ├── oauth.service.ts
│   ├── jwt.middleware.ts
│   └── session.store.ts
├── users/
│   ├── user.controller.ts
│   ├── user.repository.ts
│   └── user.dto.ts
├── api/
│   ├── client.ts
│   └── interceptors.ts
├── hooks/
│   ├── useDebounce.ts
│   └── useInfiniteScroll.ts
├── components/
│   ├── Modal.tsx
│   ├── Toast.tsx
│   └── DataTable.tsx
├── utils/
│   ├── dateFormatter.ts
│   └── currency.ts
├── db/
│   └── migrations/
│       └── 0042_add_user_index.sql
└── infra/
    ├── k8s/deployment.yaml
    ├── terraform/main.tf
    └── policy/dsl-generator.ts
```

`policy/dsl-generator.ts` 같은 인프라 색채는 본인 백그라운드에서 따온 작은 이스터에그.

### 5.2. 가짜 코드 주석 (에디터에 흘러갈 코드 안에)

대부분은 평범한 영문 주석이지만, 가끔 한국어가 섞인다.

```typescript
// TODO: 부쨩 안 보실 때 리팩토링
// FIXME: 왜 되는지 모르겠지만 일단 둔다
// NOTE: 절대 건드리지 말 것 (전임자 유언)
// 이 함수는 신성하다
// HACK: temporary fix (3년째)
```

### 5.3. 가짜 터미널 로그

```
$ pnpm dev
> trust-me-its-vscode@1.0.0 dev
> vite

  VITE ready in 423 ms
  ➜ Local:   http://localhost:3000/
  
[14:32:01] ✓ fixed bug in oauth.service.ts:42
[14:32:03] ✓ resolved warning in user.repository.ts:18
[14:32:05] ⚠ 부쨩이 다가오고 있습니다 (Esc to hide)
```

마지막 줄은 분위기 환기용 농담. 실제로 부쨩이 다가오는 건 아니다 (혹은 그렇다고 알려져 있다).

### 5.4. 콘텐츠 모듈화

위 모든 텍스트는 `content/*.json`으로 분리해서, 나중에 PR로 콘텐츠만 추가할 수 있도록 한다.

---

## 6. UI/UX 설계

### 6.1. 레이아웃 (VSCode 충실 재현)

```
┌─────────────────────────────────────────────────────────────┐
│ ≡  File  Edit  Selection  View  Go  Run  Terminal  Help    │  ← 메뉴바 (shared)
├──┬──────────┬──────────────────────────────────────────────┤
│📁│ EXPLORER │  ● oauth.service.ts  ×                        │  ← 탭 (shared)
│🔍│ ─ trust- │ ┌──────────────────────────────────────────┐ │
│  │   me-im- │ │ 1  import { ... } from 'jsonwebtoken'    │ │
│⎇│   working│ │ 2                                         │ │
│🐛│   └ src  │ │ 3  // TODO: 부쨩 안 보실 때 리팩토링        │ │  ← 게임 영역
│  │     └ ...│ │ 4  function verifyToken() {  🐛           │ │
│  │          │ │ 5    return jwt.verify(...)  ⚠️           │ │
│  │          │ │ 6  }                                      │ │
│  │          │ └──────────────────────────────────────────┘ │
│  │          │ ─ PROBLEMS ─ OUTPUT ─ TERMINAL ─             │  ← 패널 (shared)
│  │          │ $ ✓ fixed bug in oauth.service.ts:42         │
│  │          │ $ ✓ resolved warning in user.repository.ts   │
├──┴──────────┴──────────────────────────────────────────────┤
│ ⎇ main  ↑0 ↓0  ⓧ0 ⚠12  Combo:x12  ▲2,340 LOC  Ln 4, Col 9 │  ← 상태바 (shared)
└─────────────────────────────────────────────────────────────┘
```

상태바의 `Combo:x12`나 `▲2,340 LOC`는 진짜 VSCode 확장처럼 보이도록 디자인. 처음 보는 사람은 "어 이게 무슨 익스텐션이지?" 정도로 넘긴다.

### 6.2. 사이드바 = 게임 런처

`src/games/registry.ts`에 등록된 게임들이 사이드바에 파일/폴더로 나타난다. 클릭하면 해당 게임이 에디터 영역에서 시작된다.

```
EXPLORER
└─ trust-me-im-working.exe_
   ├─ 📄 oauth.service.ts        ← vscode맞습니다 믿어주세요
   └─ (추후 게임이 추가되면 여기에)
```

탭으로 여러 게임을 동시에 열 수도 있다. (멀티 인스턴스는 v0.4쯤)

### 6.3. 인풋

- **마우스 클릭**: 기본 처리 방식
- **키보드 단축키** (선택): `Ctrl+.` 같은 VSCode quick fix 단축키로 가장 가까운 버그 처리
- **Esc**: 보스키 (가장 중요한 키, shared 레벨)

### 6.4. 사운드

기본은 **무음**. 회사에서 플레이하는 게임이라는 컨셉이니까 당연. 옵션으로 키보드 타이핑 사운드만 매우 작게 (이것조차도 기본은 off).

---

## 7. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **React 18 + TypeScript** | 컴포넌트 분리 깔끔, 타입 안정성 |
| 빌드 | **Vite** | 빠름, 설정 적음 |
| 스타일 | **Tailwind CSS** | VSCode 토큰 매핑 쉬움 |
| 상태 관리 | **Zustand** | Redux는 오버스펙. 셸 상태 + 게임별 상태 분리에 적합 |
| 애니메이션 | **Framer Motion** | 버그가 등장/소멸하는 모션이 게임의 맛 |
| 라우팅 | **React Router** | 게임마다 URL 분리 (북마크 가능) |
| 배포 | **GitHub Pages + GitHub Actions** | 무료, 레포에 푸시하면 자동 배포 |

**의도적으로 안 쓰는 것**: 게임 엔진, 백엔드, 모노레포 도구, 외부 폰트 CDN.

---

## 8. 폴더 구조

```
trust-me-im-working.exe_/
├── README.md                     ← 메타 레포 README (미니멀)
├── PLAN.md                       
├── LICENSE
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── index.html
├── public/
│   └── fonts/                    ← Cascadia Code, D2Coding self-host
├── src/
│   ├── main.tsx
│   ├── App.tsx                   ← 라우터 + 셸 마운트
│   ├── shared/                   ← 모든 게임이 공유하는 IDE 셸
│   │   ├── components/
│   │   │   ├── MenuBar.tsx
│   │   │   ├── Sidebar.tsx       ← registry 참조해서 게임 목록 표시
│   │   │   ├── Tabs.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── Terminal.tsx
│   │   ├── bosskey/
│   │   │   ├── BossKeyProvider.tsx
│   │   │   ├── DecoyEditor.tsx
│   │   │   ├── DecoyTerminal.tsx
│   │   │   └── decoyContent.ts
│   │   ├── hooks/
│   │   │   └── useBossKey.ts
│   │   ├── store/
│   │   │   └── shellStore.ts
│   │   └── styles/
│   │       ├── globals.css
│   │       └── vscode-tokens.css
│   ├── games/
│   │   ├── registry.ts           ← 모든 게임 메타데이터
│   │   └── trust-me-its-vscode/  ← 첫 게임
│   │       ├── README.md
│   │       ├── index.tsx
│   │       ├── components/
│   │       │   ├── GameEditor.tsx
│   │       │   ├── Bug.tsx
│   │       │   ├── Warning.tsx
│   │       │   ├── Error.tsx
│   │       │   ├── MergeConflict.tsx
│   │       │   └── ProductionBug.tsx
│   │       ├── hooks/
│   │       │   ├── useGameLoop.ts
│   │       │   └── useSpawner.ts
│   │       ├── store/
│   │       │   └── gameStore.ts
│   │       └── content/
│   │           ├── filenames.json
│   │           ├── comments.json
│   │           ├── codeSnippets.json
│   │           └── achievements.json
│   └── utils/
│       ├── random.ts
│       └── storage.ts
└── .github/
    └── workflows/
        └── deploy.yml
```

### 새 게임 추가 절차
1. `src/games/<new-game>/` 폴더 생성
2. `index.tsx`에 게임 엔트리 구현
3. `src/games/registry.ts`에 메타데이터 등록
4. 끝. 셸, 보스키, 통계는 자동으로 연동됨.

---

## 9. 개발 로드맵

### v0.1 — 셸 + MVP 게임 (1주차)
- [ ] 셸 정적 레이아웃 (사이드바, 에디터 영역, 터미널, 상태바)
- [ ] `games/registry.ts`로 게임 메타데이터 관리
- [ ] 사이드바가 registry 참조해서 게임 목록 표시
- [ ] Esc 보스키 동작 (셸 레벨)
- [ ] 위장 모드 정적 화면
- [ ] vscode맞습니다 믿어주세요: 🐛 한 종만 등장, +10점
- [ ] 상태바 점수 표시

### v0.2 — 게임답게 (2주차)
- [ ] 모든 적 종류 (⚠️ ❌ 💀 🔥)
- [ ] 콤보 시스템 + 콤보 알림
- [ ] 난이도 곡선
- [ ] 터미널 실시간 로그
- [ ] 위장 모드 강화 (가짜 빌드 로그)
- [ ] 통계 화면

### v0.3 — 폴리시 (3주차)
- [ ] 콘텐츠 풀 확장
- [ ] 데일리 시드 (오늘의 부쨩 기분 등)
- [ ] localStorage 누적 통계
- [ ] README 정비
- [ ] GitHub Actions 자동 배포

### v0.4 — 커뮤니티 / 확장
- [ ] CONTRIBUTING.md
- [ ] 키보드 전용 모드
- [ ] 다국어 검토
- [ ] 탭 멀티 인스턴스

---

## 10. 향후 추가할 게임

같은 셸 위에 올릴 게임들. 네이밍은 모두 `trust-me-...` 패턴.

### `trust-me-im-saving` (백룸 분위기)
타이핑되는 글이 점점 기묘해지고, 속도가 갑자기 빨라졌다 느려졌다 한다.

**핵심 디테일**: 이 게임이 열리는 순간 **셸 테마가 강제로 라이트 모드로 전환된다.** 다른 게임은 다 Dark+인데 얘만 흰 배경. 사이드바에서 클릭한 순간 화면이 휙 바뀌면서 위화감이 형성되는 게 컨셉의 일부. 게임을 닫으면 다시 다크로 복귀.

블루스크린, 정전, 화면 꺼짐 같은 환경 이벤트가 무작위로 끼어들고, 타이핑되는 글 자체가 점점 이상해진다. **에디터 안에서 뭔가가 잘못 되어가는** 느낌.

### `trust-me-its-still-vscode` (픽셀 플랫포머)
사이드바에서 클릭한 순간, VSCode 화면이 도트로 깨지면서 옛날 마리오/쯔꾸르 풍 플랫포머로 변신한다.

**핵심 디테일**:
- 변신 자체가 게임의 첫 장면. 보통은 0.5초 만에 깨지지만, 변환 중간에 Esc를 누르면 강제로 VSCode 상태로 돌아갈 수 있음 (대신 점수 손해)
- 플레이어 캐릭터는 픽셀 아트로 그린 작은 개발자 아바타
- 적은 8비트화된 🐛/⚠️/❌, 발판은 코드 줄
- **BGM이 강제로 켜짐** — 이 게임은 들키는 게 절반의 재미. 컨셉이 "더 이상 위장이 안 되는" 단계
- 보스키는 여전히 동작하지만, 변신 애니메이션이 0.3초 정도 들어가서 더 늦음

장르가 완전히 다른 게임을 같은 셸 위에 올리는 게 office-arcade 컨셉의 진수. 셸이 단단한 게 아니라 언제든 무너질 수 있는 무대라는 걸 게임플레이로 보여주는 것.

### 더 먼 미래
- 스프레드시트 위장 게임 (셀 안의 숫자가 적인 척)
- 영원히 도착하지 않는 회의 (브라우저 탭 자체가 게임)

---

## 11. Out of Scope

### 절대 안 함
- ❌ 사직 / 이직 / 퇴사 관련 농담
- ❌ 특정 회사 / 부서 / 인물 묘사
- ❌ Slack 등 특정 메신저 브랜드
- ❌ 실제 VSCode 로고, Microsoft 상표 직접 사용 (이름에 "vscode" 언급은 OK, 패러디 명시)
- ❌ 결제, 광고

### 지금은 안 하지만 언젠가는 (Maybe Later)
- 🤔 **멀티플레이**: 같은 게임을 두 명이 동시에, 한쪽 화면에서 보스키 누르면 상대 화면도 바뀐다든가. v1.0 이후 검토.
- 🤔 모바일 지원
- 🤔 다국어

---

## 13. README 톤

[바이러스아닙니다 믿어주세요] 밈 톤. 군더더기 없이 한 줄 농담으로 시작. 최대한 미니멀하게, 사용자가 어떻게 플레이하는지만 알 수 있으면 됨.

### 메타 레포 README

README에 "Not affiliated with Microsoft, this is a parody" 명시. 비상업적 개인 프로젝트 유지.

```markdown
# trust-me-im-working.exe_

일하는 척 게임 모음.

## 게임
- [vscode맞습니다 믿어주세요](./src/games/trust-me-its-vscode) — 코드 사이의 버그를 잡는 클리커
- (추가 예정)

## 플레이
[여기서 바로](https://<username>.github.io/trust-me-im-working.exe_/)

`Esc` 키 하나로 위장 모드.

---
*Not affiliated with Microsoft. This is a parody project.*
```

### 게임 README (trust-me-its-vscode)

```markdown
# vscode맞습니다 믿어주세요

게임입니다. 정말입니다.

[데모 GIF]

- 코드 사이로 떠다니는 버그를 클릭하세요.
- 들키지 않게 `Esc`를 누르면 진짜 일하는 화면으로 위장됩니다.
- 점수는 자동 저장됩니다.
```

---

*마지막 수정: 2026-05-22 (v3)*