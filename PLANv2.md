Backrooms 컨셉 게임 — 신규 추가

 Context

 기존 미로 게임은 메커닉 위주의 오락 게임인데, 사용자가 "기묘함/언이지"에 더 흥미를 느낌. 백룸
 컨셉의 분위기 게임을 새 게임 슬롯으로 추가한다 (미로 게임은 그대로 둠 — 사이드바에 두 파일
 보이게).

 플레이어가 사이드바에서 백룸 파일을 클릭하면 약 30초간 정상 코드에디터 → 점진적 광기 → 화이트아웃
 → 터미널 탈출 프롬프트 순서로 진행. 메커닉이 아니라 연출이 핵심.

 진행 타임라인 (게임 진입 후 경과초)

 ┌───────┬───────┬──────────────────────────────────────────────────────────────────────────────┐
 │ Phase │ t (s) │                                     연출                 │
 ├───────┼───────┼──────────────────────────────────────────────────────────────────────────────┤
 │ 0     │ 0–5   │ 평범한 다크 에디터. 한두 줄 정상 코드가 타이핑됨.                 │
 ├───────┼───────┼──────────────────────────────────────────────────────────────────────────────┤
 │       │       │ 라이트 모드로 6초간 전환 (CSS 토큰 보간). 코드가 점점 기괴해짐(깨진 문법,    │
 │ 1     │ 5–12  │ 이상한 식별자). 색깔은 어두운 빨강/swampy green/머스타드 브라운으로 시프트.  │
 │       │       │ 사이드바에 팬텀 파일이 한두 개 슬쩍 나타났다 사라짐. 상태바텍스트가 "no     │
 │       │       │ clip" / "ERR_BOM_LOST" 등으로 변형.                 │
 ├───────┼───────┼──────────────────────────────────────────────────────────────────────────────┤
 │       │       │ 글자별 폰트 사이즈 랜덤화. 메뉴바/탭 글자 흔들림 (per-char span + CSS        │
 │ 2     │ 12–22 │ animation). 마우스 잔상 trail 시작. 라이트 모드 클래스가 가끔 토글되어       │
 │       │       │ 형광등 깜빡임.                 │
 ├───────┼───────┼──────────────────────────────────────────────────────────────────────────────┤
 │ 3     │ 22–28 │ 글자 우수수 떨어짐. 에디터/사이드바/메뉴/상태바 텍스트가 분리되어 body       │
 │       │       │ 레벨에서 중력 받으며 떨어짐. 화면 전체 범위.                 │
 ├───────┼───────┼──────────────────────────────────────────────────────────────────────────────┤
 │ 4     │ 28–30 │ 하얀 오버레이가 빠르게 페이드인 → 완전히 새하얘짐.                 │
 ├───────┼───────┼──────────────────────────────────────────────────────────────────────────────┤
 │       │       │ 터미널 로그 클리어 후 PS C:\dev\backrooms>  프롬프트만 표시. placeholder는   │
 │ 5     │ 30+   │ exit. 아무 명령어 + Enter → 게임 상태 전부 리셋 + 사이드바메인으로          │
 │       │       │ 복귀(navigate /).                 │
 └───────┴───────┴──────────────────────────────────────────────────────────────────────────────┘

 신규 파일

 src/games/backrooms/
   index.tsx                       — 셸 통합, 페이즈 effect, 화이트오버레이
   store/backroomsStore.ts         — phase, elapsed, escaped, tick(), reset(),escape()
   hooks/useBackroomsClock.ts      — rAF 기반 elapsed 누적, phase 파생
   components/CodeEditor.tsx       — phase 따라 타이핑 진행되는 가짜 에디터
   components/FallingLetters.tsx   — body 포털, 글자 DOM에 중력 적용
   content/cursedCode.ts           — phase별 타이핑할 코드 라인 배열
   styles.css                      — backrooms 전용 스타일 (글자 흔들림 @keyframes 등)

 src/shared/components/
   MouseTrail.tsx                  — body 포털, mousemove 추적 + 페이드 잔상
   ShakyText.tsx                   — 문자열을 per-char span으로 split + 흔들림클래스

 수정 파일

 - src/games/registry.ts — backrooms 엔트리 추가 (fileName: backrooms.tsx, folderName: backrooms).
 - src/shared/store/shellStore.ts — 추가 필드:
   - glitchLevel: number (0–1, 백룸이 phase에 따라 셋팅)
   - phantomFiles: string[] (Sidebar가 렌더)
   - statusGlitch: boolean (StatusBar가 메시지 변형)
   - lightMode: boolean (Shell 루트에 .backrooms-lit 클래스 토글)
 - src/shared/components/Shell.tsx — lightMode 읽어서 루트 div에 backrooms-lit클래스 토글.
 <MouseTrail /> 마운트.
 - src/shared/components/Sidebar.tsx — gameRegistry.map 다음에 phantomFiles.map으로 클릭 불가 노드
 렌더 (isDecoy 시 숨김).
 - src/shared/components/MenuBar.tsx — MENU_ITEMS 각 항목과 .menubar__title 텍스트를 <ShakyText
 level={glitchLevel} text=...> 로 감싸기. isDecoy 시 level=0.
 - src/shared/components/Tabs.tsx — 활성 탭 <span>{game.fileName}</span>을 <ShakyText>로 교체.
 - src/shared/components/StatusBar.tsx — 게임별 status 분기 정리. useMatch('/games/:gameId')로
 분기해 각 게임 스토어를 직접 import하던 패턴 유지하되, statusGlitch true 시 일부 항목 텍스트 치환
 (예: ⎇ main → ⎇ no clip, UTF-8 → ERR_BOM_LOST, Ln 4, Col 9 → Ln ∞, Col ?). isDecoy 시 글리치 항목
 모두 정상.
 - src/shared/components/Terminal.tsx — backrooms 경로 분기 추가. escaped 상태에서 BOOT_LINES
 숨기고 새 프롬프트만 표시. Enter 시 backroomsStore.escape() + navigate('/').
 - src/shared/styles/vscode-tokens.css — :root.backrooms-lit { ... } 블록 추가. swampy palette:
   - --vsc-bg-editor: #f4ecc8
   - --vsc-bg-sidebar: #d8c89a
   - --vsc-bg-tabs: #c4b07a
   - --vsc-bg-statusbar: #6b4818
   - --vsc-fg: #3a2a0a
   - --vsc-fg-muted: #6b4818
   - --vsc-accent-red: #5a1a1a (어두운 빨강)
   - --vsc-accent-teal: #4a6b2a (swampy green)
   - --vsc-accent-yellow: #6b5818 (머스타드 브라운)
   - --vsc-border: #8a6a3a
 - src/shared/styles/shell.css — .shell, .editor, .sidebar, .tabs 등에 transition: background 6s
 ease, color 6s ease 추가해 라이트 모드 전환을 부드럽게.

 글자 떨어지기 구현 (Phase 3)

 FallingLetters.tsx는 createPortal(<div>, document.body)로 body 직속 컨테이너 (position: fixed;
 inset: 0; pointer-events: none; z-index: 9999).

 Phase 3 진입 시:
 1. document.querySelectorAll('.editor *, .sidebar *, .menubar *, .tabs *, .statusbar *') 순회
 2. 각 텍스트 노드의 getBoundingClientRect()로 글자 좌표 측정 (per-character는비싸므로 단어/항목
 단위 + 일부 글자만 샘플링)
 3. 일정 확률로 글자를 <span>으로 추출해 포털에 추가, 원본 위치(fixed left/top)에서 시작, RAF로 vy
 증가 + 회전. 1.5초 후 제거.
 4. 6초간 스폰 지속, 모든 텍스트가 점차 비워지는 느낌.

 ShakyText 구현

 function ShakyText({ text, level }: { text: string, level: number }) {
   if (level < 0.1) return <>{text}</>
   return <>{[...text].map((ch, i) => (
     <span key={i} className="shaky" style={{
       animationDelay: `${i * 0.07}s`,
       animationDuration: `${0.3 + Math.random() * 0.4}s`,
       fontSize: level > 0.5 ? `${0.85 + Math.random() * 0.3}em` : undefined,
     }}>{maybeCorrupt(ch, level)}</span>
   ))}</>
 }

 maybeCorrupt는 level > 0.6일 때 일정 확률로 글자를 유사문자(a → à, o → ô, i →ï)로 치환.

 CSS @keyframes shake { 0%,100% { transform: translate(0,0) } 25% { translate:-1px 1px } 50% {
 translate: 1px -1px } 75% { translate: -1px -1px } }. level에 따라 amplitude조절(--shake-amp CSS
 변수).

 MouseTrail 구현

 useEffect로 window mousemove 구독, 최근 12개 좌표를 ref에 보관. portal 안에 12개 <span>을
 절대좌표로 렌더 (각각 opacity = 1 - i/12). glitchLevel > 0.3 일 때만 작동. isDecoy면 자동 비활성.

 형광등 깜빡임

 Phase 2 이상에서 setInterval로 0.5~2초 간격, 50~150ms 동안 lightMode false 강제 → 다시 true.
 시각적으로 라이트모드 클래스가 떨어졌다 붙는 깜빡임.

 팬텀 파일 (Sidebar)

 shellStore.phantomFiles 후보 풀:
 ['level_0.txt', 'noclip.tsx', 'almond_water.json', 'exit.???', 'REDACTED', 'you_are_here', '∞.ts',
  '████████.ts']

 Phase 1 진입 시부터 1~3초 간격으로 무작위로 1~3개 표시, 다시 0~2개로 줄였다 늘렸다. 클릭 핸들러
 없음 (cursor: default). isDecoy 시 전부 숨김.

 상태바 글리치 메시지

 statusGlitch true일 때 (phase ≥ 1) 각 항목을 일정 확률로 변형:
 - ⎇ main → ⎇ no clip
 - ↑ 0 ↓ 0 → ↑ ? ↓ ?
 - ⊘ 0  ⚠ 0 → ⊘ ∞  ⚠ ∞
 - Ln 4, Col 9 → Ln ∞, Col ?
 - UTF-8 → ERR_BOM_LOST
 - LF → ??
 - {} TypeScript → {} ████████
 - ⚡ Prettier → ⚡ entity_seen

 각 항목별 useMemo로 페이즈 진입 시 한 번 결정해서 깜빡거리지 않게.

 탈출 시퀀스 (Phase 5)

 Terminal.tsx에 useMatch('/games/:gameId') === 'backrooms' 분기 추가:
 - backroomsStore.phase >= 5 → BOOT_LINES 숨기고 단 한 줄 프롬프트만:
   - PS C:\dev\backrooms>  + input (placeholder: exit)
 - Enter 시 → useShellStore.reset() 식으로 glitch/phantom/lightMode 모두 0/false로,
 backroomsStore.reset(), navigate('/').

 Decoy(Esc 보스키) 처리

 PLAN.md §4 원칙: 보스키는 백그라운드, 게임 일시정지 아님. backrooms 타이머는계속 흐름. 단 시각
 효과는 전부 isDecoy 시 비활성화:
 - ShakyText: level = isDecoy ? 0 : storeLevel
 - MouseTrail: if (isDecoy) return null
 - FallingLetters: 동일
 - Sidebar phantom files: isDecoy 시 안 렌더
 - StatusBar 글리치 메시지: isDecoy 시 원본 텍스트
 - backrooms-lit 클래스: isDecoy 시 root에서 제거

 → Esc 누르면 깔끔한 빌드 진행 화면(DecoyEditor). 다시 Esc 하면 백룸이 진행된만큼 무너져있음.
 사용자가 Esc로 도망쳐도 시간은 멈추지 않는 백룸스러운 디자인.

 컨텐츠: cursedCode.ts

 export const PHASE_0_LINES = [
   "import { useEffect } from 'react'",
   "function isWorking() { return true }",
 ]
 export const PHASE_1_LINES = [
   "// 잠깐... 이 함수 누가 만들었지?",
   "function notMyCode() {",
   "  return undefined.undefined.undefined",
   "}",
 ]
 export const PHASE_2_LINES = [
   "while (true) { /* 누군가 보고 있다 */ }",
   "const exit = null",
   "type Reality = never",
   "function leaveMeAlone(): never { return leaveMeAlone() }",
   "//          ████████████████",
 ]
 // Phase 3+ 는 타이핑 안 함 (글자 떨어짐)

 타이핑은 50~120ms/char 정도, phase가 올라갈수록 가속.

 Critical files

 신규:
 - src/games/backrooms/{index.tsx, store/backroomsStore.ts, hooks/useBackroomsClock.ts,
 components/CodeEditor.tsx, components/FallingLetters.tsx, content/cursedCode.ts, styles.css}
 - src/shared/components/{MouseTrail.tsx, ShakyText.tsx}

 수정:
 - src/games/registry.ts
 - src/shared/store/shellStore.ts
 - src/shared/components/{Shell.tsx, Sidebar.tsx, MenuBar.tsx, Tabs.tsx, StatusBar.tsx,
 Terminal.tsx}
 - src/shared/styles/{vscode-tokens.css, shell.css}

 기존 미로 게임은 건드리지 않음.

 Verification

 1. pnpm tsc --noEmit — 타입 통과
 2. pnpm dev → 사이드바에 backrooms.tsx, oauth.service.ts 두 파일 확인
 3. backrooms.tsx 클릭 → 0~5초 정상 코드 타이핑
 4. 5초 후 → 라이트모드 6초 페이드, 코드 기괴해짐, 팬텀 파일/상태바 변형 확인
 5. 12초 후 → 메뉴/탭 글자 흔들림, 마우스 trail, 형광등 깜빡임 확인
 6. 22초 후 → 글자가 에디터 밖(사이드바/메뉴/상태바)까지 떨어지는지 확인
 7. 28~30초 → 하얀 화면
 8. 30초+ → 터미널 비워지고 프롬프트만. exit Enter → 라이트모드 해제, 모든 글리치 사라짐, 사이드바
 메인으로 복귀
 9. 진행 중 아무 때나 Esc → DecoyEditor 정상, 셸 글리치 모두 사라짐. 다시 Esc → 백룸이 그동안
 진행된 상태로 복귀
 10. 미로 게임(oauth.service.ts) 클릭 → 백룸 효과 영향 없이 정상 동작
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 팬텀 파일 (Sidebar)

 shellStore.phantomFiles 후보 풀:
 ['level_0.txt', 'noclip.tsx', 'almond_water.json', 'exit.???', 'REDACTED',
 'you_are_here', '∞.ts', '████████.ts']

 Phase 1 진입 시부터 1~3초 간격으로 무작위로 1~3개 표시, 다시 0~2개로 줄였다
 늘렸다. 클릭 핸들러 없음 (cursor: default). isDecoy 시 전부 숨김.

 상태바 글리치 메시지

 statusGlitch true일 때 (phase ≥ 1) 각 항목을 일정 확률로 변형:
 - ⎇ main → ⎇ no clip
 - ↑ 0 ↓ 0 → ↑ ? ↓ ?
 - ⊘ 0  ⚠ 0 → ⊘ ∞  ⚠ ∞
 - Ln 4, Col 9 → Ln ∞, Col ?
 - UTF-8 → ERR_BOM_LOST
 - LF → ??
 - {} TypeScript → {} ████████
 - ⚡ Prettier → ⚡ entity_seen

 각 항목별 useMemo로 페이즈 진입 시 한 번 결정해서 깜빡거리지 않게.

 탈출 시퀀스 (Phase 5)

 Terminal.tsx에 useMatch('/games/:gameId') === 'backrooms' 분기 추가:
 - backroomsStore.phase >= 5 → BOOT_LINES 숨기고 단 한 줄 프롬프트만:
   - PS C:\dev\backrooms>  + input (placeholder: exit)
 - Enter 시 → useShellStore.reset() 식으로 glitch/phantom/lightMode 모두
 0/false로, backroomsStore.reset(), navigate('/').

 Decoy(Esc 보스키) 처리

 PLAN.md §4 원칙: 보스키는 백그라운드, 게임 일시정지 아님. backrooms 타이머는
 계속 흐름. 단 시각 효과는 전부 isDecoy 시 비활성화:
 - ShakyText: level = isDecoy ? 0 : storeLevel
 - MouseTrail: if (isDecoy) return null
 - FallingLetters: 동일
 - Sidebar phantom files: isDecoy 시 안 렌더
 - StatusBar 글리치 메시지: isDecoy 시 원본 텍스트
 - backrooms-lit 클래스: isDecoy 시 root에서 제거

 → Esc 누르면 깔끔한 빌드 진행 화면(DecoyEditor). 다시 Esc 하면 백룸이 진행된
 만큼 무너져있음. 사용자가 Esc로 도망쳐도 시간은 멈추지 않는 백룸스러운
 디자인.

 컨텐츠: cursedCode.ts

 export const PHASE_0_LINES = [
   "import { useEffect } from 'react'",
   "function isWorking() { return true }",
 ]
 export const PHASE_1_LINES = [
   "// 잠깐... 이 함수 누가 만들었지?",
   "function notMyCode() {",
   "  return undefined.undefined.undefined",
   "}",
 ]
 export const PHASE_2_LINES = [
   "while (true) { /* 누군가 보고 있다 */ }",
   "const exit = null",
   "type Reality = never",
   "function leaveMeAlone(): never { return leaveMeAlone() }",
   "//          ████████████████",
 ]
 // Phase 3+ 는 타이핑 안 함 (글자 떨어짐)

 타이핑은 50~120ms/char 정도, phase가 올라갈수록 가속.

 Critical files

 신규:
 - src/games/backrooms/{index.tsx, store/backroomsStore.ts,
 hooks/useBackroomsClock.ts, components/CodeEditor.tsx,
 components/FallingLetters.tsx, content/cursedCode.ts, styles.css}
 - src/shared/components/{MouseTrail.tsx, ShakyText.tsx}

 수정:
 - src/games/registry.ts
 - src/shared/store/shellStore.ts
 - src/shared/components/{Shell.tsx, Sidebar.tsx, MenuBar.tsx, Tabs.tsx,
 StatusBar.tsx, Terminal.tsx}
 - src/shared/styles/{vscode-tokens.css, shell.css}

 기존 미로 게임은 건드리지 않음.

 Verification

 1. pnpm tsc --noEmit — 타입 통과
 2. pnpm dev → 사이드바에 backrooms.tsx, oauth.service.ts 두 파일 확인
 3. backrooms.tsx 클릭 → 0~5초 정상 코드 타이핑
 4. 5초 후 → 라이트모드 6초 페이드, 코드 기괴해짐, 팬텀 파일/상태바 변형 확인
 5. 12초 후 → 메뉴/탭 글자 흔들림, 마우스 trail, 형광등 깜빡임 확인
 6. 22초 후 → 글자가 에디터 밖(사이드바/메뉴/상태바)까지 떨어지는지 확인
 7. 28~30초 → 하얀 화면
 8. 30초+ → 터미널 비워지고 프롬프트만. exit Enter → 라이트모드 해제, 모든
 글리치 사라짐, 사이드바 메인으로 복귀
 9. 진행 중 아무 때나 Esc → DecoyEditor 정상, 셸 글리치 모두 사라짐. 다시 Esc
 → 백룸이 그동안 진행된 상태로 복귀

● Updated plan
  ⎿  /plan to preview

● User approved Claude's plan
  ⎿  Plan saved to: ~\.claude\plans\reflective-greeting-locket.md · /plan to 
     edit
     Backrooms 컨셉 게임 — 신규 추가

     Context

     기존 미로 게임은 메커닉 위주의 오락 게임인데, 사용자가 "기묘함/언이지"에
     더 흥미를 느낌. 백룸 컨셉의 분위기 게임을 새 게임 슬롯으로 추가한다 (미로
     게임은 그대로 둠 — 사이드바에 두 파일 보이게).

     플레이어가 사이드바에서 백룸 파일을 클릭하면 약 30초간 정상 코드에디터 →
     점진적 광기 → 화이트아웃 → 터미널 탈출 프롬프트 순서로 진행. 메커닉이
     아니라 연출이 핵심.

     진행 타임라인 (게임 진입 후 경과초)

     Phase: 0
     t (s): 0–5
     연출: 평범한 다크 에디터. 한두 줄 정상 코드가 타이핑됨.
     ────────────────────────────────────────
     Phase: 1
     t (s): 5–12
     연출: 라이트 모드로 6초간 전환 (CSS 토큰 보간). 코드가 점점 기괴해짐(깨진
       문법, 이상한 식별자). 색깔은 어두운 빨강/swampy green/머스타드
     브라운으로
       시프트. 사이드바에 팬텀 파일이 한두 개 슬쩍 나타났다 사라짐. 상태바
     텍스트가
        "no clip" / "ERR_BOM_LOST" 등으로 변형.
     ────────────────────────────────────────
     Phase: 2
     t (s): 12–22
     연출: 글자별 폰트 사이즈 랜덤화. 메뉴바/탭 글자 흔들림 (per-char span +
     CSS
       animation). 마우스 잔상 trail 시작. 라이트 모드 클래스가 가끔 토글되어
       형광등 깜빡임.
     ────────────────────────────────────────
     Phase: 3
     t (s): 22–28
     연출: 글자 우수수 떨어짐. 에디터/사이드바/메뉴/상태바 텍스트가 분리되어
     body
       레벨에서 중력 받으며 떨어짐. 화면 전체 범위.
     ────────────────────────────────────────
     Phase: 4
     t (s): 28–30
     연출: 하얀 오버레이가 빠르게 페이드인 → 완전히 새하얘짐.
     ────────────────────────────────────────
     Phase: 5
     t (s): 30+
     연출: 터미널 로그 클리어 후 PS C:\dev\backrooms>  프롬프트만 표시.
       placeholder는 exit. 아무 명령어 + Enter → 게임 상태 전부 리셋 + 사이드바

       메인으로 복귀(navigate /).

     신규 파일

     src/games/backrooms/
       index.tsx                       — 셸 통합, 페이즈 effect, 화이트오버레이
       store/backroomsStore.ts         — phase, elapsed, escaped, tick(),
     reset(), escape()
       hooks/useBackroomsClock.ts      — rAF 기반 elapsed 누적, phase 파생
       components/CodeEditor.tsx       — phase 따라 타이핑 진행되는 가짜 에디터
       components/FallingLetters.tsx   — body 포털, 글자 DOM에 중력 적용
       content/cursedCode.ts           — phase별 타이핑할 코드 라인 배열
       styles.css                      — backrooms 전용 스타일 (글자 흔들림
     @keyframes 등)

     src/shared/components/
       MouseTrail.tsx                  — body 포털, mousemove 추적 + 페이드
     잔상
       ShakyText.tsx                   — 문자열을 per-char span으로 split +
     흔들림 클래스

     수정 파일

     - src/games/registry.ts — backrooms 엔트리 추가 (fileName: backrooms.tsx,
     folderName: backrooms).
     - src/shared/store/shellStore.ts — 추가 필드:
       - glitchLevel: number (0–1, 백룸이 phase에 따라 셋팅)
       - phantomFiles: string[] (Sidebar가 렌더)
       - statusGlitch: boolean (StatusBar가 메시지 변형)
       - lightMode: boolean (Shell 루트에 .backrooms-lit 클래스 토글)
     - src/shared/components/Shell.tsx — lightMode 읽어서 루트 div에
     backrooms-lit 클래스 토글. <MouseTrail /> 마운트.
     - src/shared/components/Sidebar.tsx — gameRegistry.map 다음에
     phantomFiles.map으로 클릭 불가 노드 렌더 (isDecoy 시 숨김).
     - src/shared/components/MenuBar.tsx — MENU_ITEMS 각 항목과 .menubar__title
      텍스트를 <ShakyText level={glitchLevel} text=...> 로 감싸기. isDecoy 시
     level=0.
     - src/shared/components/Tabs.tsx — 활성 탭 <span>{game.fileName}</span>을
     <ShakyText>로 교체.
     - src/shared/components/StatusBar.tsx — 게임별 status 분기 정리.
     useMatch('/games/:gameId')로 분기해 각 게임 스토어를 직접 import하던 패턴
     유지하되, statusGlitch true 시 일부 항목 텍스트 치환 (예: ⎇ main → ⎇ no
     clip, UTF-8 → ERR_BOM_LOST, Ln 4, Col 9 → Ln ∞, Col ?). isDecoy 시 글리치
     항목 모두 정상.
     - src/shared/components/Terminal.tsx — backrooms 경로 분기 추가. escaped
     상태에서 BOOT_LINES 숨기고 새 프롬프트만 표시. Enter 시
     backroomsStore.escape() + navigate('/').
     - src/shared/styles/vscode-tokens.css — :root.backrooms-lit { ... } 블록
     추가. swampy palette:
       - --vsc-bg-editor: #f4ecc8
       - --vsc-bg-sidebar: #d8c89a
       - --vsc-bg-tabs: #c4b07a
       - --vsc-bg-statusbar: #6b4818
       - --vsc-fg: #3a2a0a
       - --vsc-fg-muted: #6b4818
       - --vsc-accent-red: #5a1a1a (어두운 빨강)
       - --vsc-accent-teal: #4a6b2a (swampy green)
       - --vsc-accent-yellow: #6b5818 (머스타드 브라운)
       - --vsc-border: #8a6a3a
     - src/shared/styles/shell.css — .shell, .editor, .sidebar, .tabs 등에
     transition: background 6s ease, color 6s ease 추가해 라이트 모드 전환을
     부드럽게.

     글자 떨어지기 구현 (Phase 3)

     FallingLetters.tsx는 createPortal(<div>, document.body)로 body 직속
     컨테이너 (position: fixed; inset: 0; pointer-events: none; z-index: 9999).

     Phase 3 진입 시:
     1. document.querySelectorAll('.editor *, .sidebar *, .menubar *, .tabs *,
     .statusbar *') 순회
     2. 각 텍스트 노드의 getBoundingClientRect()로 글자 좌표 측정
     (per-character는 비싸므로 단어/항목 단위 + 일부 글자만 샘플링)
     3. 일정 확률로 글자를 <span>으로 추출해 포털에 추가, 원본 위치(fixed
     left/top)에서 시작, RAF로 vy 증가 + 회전. 1.5초 후 제거.
     4. 6초간 스폰 지속, 모든 텍스트가 점차 비워지는 느낌.

     ShakyText 구현

     function ShakyText({ text, level }: { text: string, level: number }) {
       if (level < 0.1) return <>{text}</>
       return <>{[...text].map((ch, i) => (
         <span key={i} className="shaky" style={{
           animationDelay: `${i * 0.07}s`,
           animationDuration: `${0.3 + Math.random() * 0.4}s`,
           fontSize: level > 0.5 ? `${0.85 + Math.random() * 0.3}em` :
     undefined,
         }}>{maybeCorrupt(ch, level)}</span>
       ))}</>
     }

     maybeCorrupt는 level > 0.6일 때 일정 확률로 글자를 유사문자(a → à, o → ô,
     i → ï)로 치환.

     CSS @keyframes shake { 0%,100% { transform: translate(0,0) } 25% {
     translate: -1px 1px } 50% { translate: 1px -1px } 75% { translate: -1px
     -1px } }. level에 따라 amplitude 조절(--shake-amp CSS 변수).

     MouseTrail 구현

     useEffect로 window mousemove 구독, 최근 12개 좌표를 ref에 보관. portal
     안에 12개 <span>을 절대좌표로 렌더 (각각 opacity = 1 - i/12). glitchLevel
     > 0.3 일 때만 작동. isDecoy면 자동 비활성.

     형광등 깜빡임

     Phase 2 이상에서 setInterval로 0.5~2초 간격, 50~150ms 동안 lightMode false
      강제 → 다시 true. 시각적으로 라이트모드 클래스가 떨어졌다 붙는 깜빡임.

     팬텀 파일 (Sidebar)

     shellStore.phantomFiles 후보 풀:
     ['level_0.txt', 'noclip.tsx', 'almond_water.json', 'exit.???', 'REDACTED',
      'you_are_here', '∞.ts', '████████.ts']

     Phase 1 진입 시부터 1~3초 간격으로 무작위로 1~3개 표시, 다시 0~2개로
     줄였다 늘렸다. 클릭 핸들러 없음 (cursor: default). isDecoy 시 전부 숨김.

     상태바 글리치 메시지

     statusGlitch true일 때 (phase ≥ 1) 각 항목을 일정 확률로 변형:
     - ⎇ main → ⎇ no clip
     - ↑ 0 ↓ 0 → ↑ ? ↓ ?
     - ⊘ 0  ⚠ 0 → ⊘ ∞  ⚠ ∞
     - Ln 4, Col 9 → Ln ∞, Col ?
     - UTF-8 → ERR_BOM_LOST
     - LF → ??
     - {} TypeScript → {} ████████
     - ⚡ Prettier → ⚡ entity_seen

     각 항목별 useMemo로 페이즈 진입 시 한 번 결정해서 깜빡거리지 않게.

     탈출 시퀀스 (Phase 5)

     Terminal.tsx에 useMatch('/games/:gameId') === 'backrooms' 분기 추가:
     - backroomsStore.phase >= 5 → BOOT_LINES 숨기고 단 한 줄 프롬프트만:
       - PS C:\dev\backrooms>  + input (placeholder: exit)
     - Enter 시 → useShellStore.reset() 식으로 glitch/phantom/lightMode 모두
     0/false로, backroomsStore.reset(), navigate('/').

     Decoy(Esc 보스키) 처리

     PLAN.md §4 원칙: 보스키는 백그라운드, 게임 일시정지 아님. backrooms
     타이머는 계속 흐름. 단 시각 효과는 전부 isDecoy 시 비활성화:
     - ShakyText: level = isDecoy ? 0 : storeLevel
     - MouseTrail: if (isDecoy) return null
     - FallingLetters: 동일
     - Sidebar phantom files: isDecoy 시 안 렌더
     - StatusBar 글리치 메시지: isDecoy 시 원본 텍스트
     - backrooms-lit 클래스: isDecoy 시 root에서 제거

     → Esc 누르면 깔끔한 빌드 진행 화면(DecoyEditor). 다시 Esc 하면 백룸이
     진행된 만큼 무너져있음. 사용자가 Esc로 도망쳐도 시간은 멈추지 않는
     백룸스러운 디자인.

     컨텐츠: cursedCode.ts

     export const PHASE_0_LINES = [
       "import { useEffect } from 'react'",
       "function isWorking() { return true }",
     ]
     export const PHASE_1_LINES = [
       "// 잠깐... 이 함수 누가 만들었지?",
       "function notMyCode() {",
       "  return undefined.undefined.undefined",
       "}",
     ]
     export const PHASE_2_LINES = [
       "while (true) { /* 누군가 보고 있다 */ }",
       "const exit = null",
       "type Reality = never",
       "function leaveMeAlone(): never { return leaveMeAlone() }",
       "//          ████████████████",
     ]
     // Phase 3+ 는 타이핑 안 함 (글자 떨어짐)

     타이핑은 50~120ms/char 정도, phase가 올라갈수록 가속.

     Critical files

     신규:
     - src/games/backrooms/{index.tsx, store/backroomsStore.ts,
     hooks/useBackroomsClock.ts, components/CodeEditor.tsx,
     components/FallingLetters.tsx, content/cursedCode.ts, styles.css}
     - src/shared/components/{MouseTrail.tsx, ShakyText.tsx}

     수정:
     - src/games/registry.ts
     - src/shared/store/shellStore.ts
     - src/shared/components/{Shell.tsx, Sidebar.tsx, MenuBar.tsx, Tabs.tsx,
     StatusBar.tsx, Terminal.tsx}
     - src/shared/styles/{vscode-tokens.css, shell.css}

     기존 미로 게임은 건드리지 않음.

     Verification

     1. pnpm tsc --noEmit — 타입 통과
     2. pnpm dev → 사이드바에 backrooms.tsx, oauth.service.ts 두 파일 확인
     3. backrooms.tsx 클릭 → 0~5초 정상 코드 타이핑
     4. 5초 후 → 라이트모드 6초 페이드, 코드 기괴해짐, 팬텀 파일/상태바 변형
     확인
     5. 12초 후 → 메뉴/탭 글자 흔들림, 마우스 trail, 형광등 깜빡임 확인
     6. 22초 후 → 글자가 에디터 밖(사이드바/메뉴/상태바)까지 떨어지는지 확인
     7. 28~30초 → 하얀 화면
     8. 30초+ → 터미널 비워지고 프롬프트만. exit Enter → 라이트모드 해제, 모든
     글리치 사라짐, 사이드바 메인으로 복귀
     9. 진행 중 아무 때나 Esc → DecoyEditor 정상, 셸 글리치 모두 사라짐. 다시
     Esc → 백룸이 그동안 진행된 상태로 복귀
     10. 미로 게임(oauth.service.ts) 클릭 → 백룸 효과 영향 없이 정상 동작