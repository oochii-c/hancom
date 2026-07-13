"use strict";
/* =====================================================================
   DOTPRINT — 순수 프론트엔드 도트 그래픽 변환기
   알고리즘(§3): 다운스케일(평균) → median cut 양자화(무디더) → nearest 업스케일

   [이 파일을 처음 보는 사람을 위한 큰 그림]
   1) 사진을 아주 작게 줄인다(다운스케일). → 픽셀 수가 확 줄어 "칸(격자)"이 생김.
   2) 색 개수를 몇 개로 확 줄인다(양자화). → 도트/8비트 느낌의 납작한 색 블록.
   3) 다시 원래 크기로 "계단식(nearest)"으로 키운다. → 각 칸이 선명한 사각 도트로.
   슬라이더 하나(강도)로 1번의 "칸 크기"와 2번의 "색 개수"를 동시에 조절한다.
   ===================================================================== */

/* ---- 설정 상수 (§4·§7): 나중에 값 조정은 여기 한 곳에서만 하면 된다 ------ */
const CONFIG = {
  // 격자(긴 변 픽셀 수): 값이 클수록 촘촘해서 원본에 가깝고, 작을수록 굵은 도트.
  GRID_MAX:   512,   // 강도 0%   → 격자(긴 변) px  (가장 촘촘)
  GRID_MIN:   55,    // 강도 100% → 격자(긴 변) px  (가장 굵음 / 하한선)
  // 팔레트 색 개수: 값이 클수록 색이 풍부, 작을수록 납작한 8비트 느낌.
  COLORS_MAX: 32,    // 강도 0%   → 색 개수
  COLORS_MIN: 8,     // 강도 100% → 색 개수 (하한선)
  DEFAULT_STRENGTH: 51,   // 페이지 로드 시 슬라이더 시작 위치(%) → 격자 ≈278px
  BOX_W: 680,             // 미리보기 박스 최대 표시 폭 px  (이보다 큰 이미지는 여기까지만 축소 표시)
  BOX_H: 520,             // 미리보기 박스 최대 표시 높이 px
  EXPORT_MAX_LONG: 3000,  // 내보낼 때 긴 변 상한 px (너무 큰 이미지의 메모리 폭주 방지, §7)
  BG: "#ffffff",          // 투명 PNG를 올렸을 때 깔아줄 배경색 (§7: 흰색 권장)
};

/* 강도 s(0.0~1.0)를 넣으면 격자/색 개수를 계산해 주는 함수.
   s가 0→1로 갈수록 MAX에서 MIN으로 "직선으로" 줄어든다(선형 보간).
   Math.round 는 소수점을 반올림해 정수 픽셀/색 개수로 만든다. */
const gridFor   = s => Math.round(CONFIG.GRID_MAX   - (CONFIG.GRID_MAX   - CONFIG.GRID_MIN)   * s);
const colorsFor = s => Math.round(CONFIG.COLORS_MAX - (CONFIG.COLORS_MAX - CONFIG.COLORS_MIN) * s);

/* ---- DOM: HTML 요소들을 한 번만 찾아 변수에 담아 둔다(매번 찾으면 느리니까) ---- */
const stage      = document.getElementById("stage");     // 캔버스가 놓이는 영역(드롭존)
const preview    = document.getElementById("preview");   // 결과(도트 이미지)를 그리는 캔버스
const pctEl      = document.getElementById("pct");        // "51%" 숫자 표시
const rGridEl    = document.getElementById("rGrid");      // "격자 279px" 숫자 표시
const rColorsEl  = document.getElementById("rColors");    // "색 20개" 숫자 표시
const strengthEl = document.getElementById("strength");   // 강도 슬라이더(range)
const fileEl     = document.getElementById("file");       // 숨겨진 <input type=file>
const openBtn    = document.getElementById("openBtn");    // "사진 열기" 버튼
const exportBtn  = document.getElementById("exportBtn");  // "PNG 내보내기" 버튼
const crtCanvas  = document.getElementById("crt");        // 업로드 시 정전기(CRT) 오버레이 캔버스

/* ---- 상태: 값은 JS 변수(메모리)에만 둔다. localStorage 등 저장소 미사용(§2) ---- */
let sourceCanvas = null;   // 현재 원본 이미지를 담아 둔 오프스크린 캔버스(배경 합성 완료 상태)
let rafPending   = false;  // 미리보기 렌더가 이미 예약돼 있는지 표시(중복 렌더 방지용 깃발)

/* =====================================================================
   Median cut 색 양자화 — "수많은 색"을 "대표 색 k개"로 줄이는 핵심 알고리즘.
   Canvas엔 색 줄이는 기능이 없어서 직접 구현한다(§3).
   입력 pixels: 캔버스 픽셀 배열(RGBA가 4개씩 반복), k: 원하는 색 개수
   반환: 팔레트 [[r,g,b], ...]  (실제 고유색이 k보다 적으면 그만큼만, §7)

   [아이디어] 모든 색을 하나의 "상자(3D 색 공간의 박스)"에 넣고 →
   가장 넓고 픽셀 많은 상자를 골라 반으로 쪼개기를 k개가 될 때까지 반복 →
   각 상자의 평균색을 대표색으로 쓴다.
   ===================================================================== */
function medianCutPalette(pixels, k){
  // 1) 픽셀 배열(RGBA)에서 RGB만 뽑아 [r,g,b] 점들의 목록으로 만든다.
  //    i += 4 인 이유: 한 픽셀이 R,G,B,A 4칸을 차지하므로 4칸씩 건너뛴다.
  const pts = [];
  for (let i = 0; i < pixels.length; i += 4){
    pts.push([pixels[i], pixels[i+1], pixels[i+2]]);
  }
  if (pts.length === 0) return [[0,0,0]];   // 안전장치: 픽셀이 없으면 검정 하나 반환

  // 2) "상자" 하나를 만드는 도우미 함수.
  //    한 무리의 색점(arr)을 받아, 그 색들이 R/G/B 각 축에서 얼마나 퍼졌는지 계산해
  //    가장 많이 퍼진 축(ch)과 그 폭(span)을 함께 담아 반환한다.
  const makeBox = arr => {
    let mn = [255,255,255], mx = [0,0,0];       // 각 채널의 최소/최대값 추적(min/max)
    for (const p of arr){
      for (let c = 0; c < 3; c++){               // c=0:R, 1:G, 2:B 세 채널을 각각 검사
        if (p[c] < mn[c]) mn[c] = p[c];
        if (p[c] > mx[c]) mx[c] = p[c];
      }
    }
    const r = [mx[0]-mn[0], mx[1]-mn[1], mx[2]-mn[2]];   // 채널별 퍼짐 폭(범위)
    // 가장 퍼진 채널 번호를 고른다(그 축으로 쪼개야 상자가 잘 나뉜다).
    const ch = r[0] >= r[1] && r[0] >= r[2] ? 0 : (r[1] >= r[2] ? 1 : 2);
    return { pts: arr, ch, span: r[ch] };       // span = 가장 퍼진 축의 폭
  };

  let boxes = [makeBox(pts)];   // 처음엔 모든 색이 든 상자 하나로 시작

  // 3) 상자 개수가 목표 k개가 될 때까지 계속 쪼갠다.
  while (boxes.length < k){
    // (개선판) 쪼갤 상자 고르기: "폭(span) × 픽셀 수"가 가장 큰 상자를 우선.
    //  → 넓게 퍼졌고 픽셀도 많은(=화면에서 눈에 띄는) 영역에 색을 더 배분 → 더 정확한 팔레트.
    let target = -1, bestScore = -1;
    for (let b = 0; b < boxes.length; b++){
      const bx = boxes[b];
      if (bx.pts.length < 2 || bx.span === 0) continue;  // 더 못 쪼개는 상자는 건너뜀
      const score = bx.span * bx.pts.length;
      if (score > bestScore){ bestScore = score; target = b; }
    }
    if (target < 0) break; // 쪼갤 상자가 없음(고유색이 k보다 적은 경우, §7)

    // 고른 상자를 "가장 퍼진 축(ch) 기준"으로 정렬한 뒤 정확히 절반에서 두 개로 나눈다.
    const bx = boxes[target];
    bx.pts.sort((a,b) => a[bx.ch] - b[bx.ch]);
    const mid = bx.pts.length >> 1;    // >> 1 은 2로 나눈 몫(정수). 중앙 지점.
    // splice(target,1, 새상자1, 새상자2): target 자리의 상자 1개를 빼고 새 상자 2개를 끼워 넣음.
    boxes.splice(target, 1, makeBox(bx.pts.slice(0, mid)), makeBox(bx.pts.slice(mid)));
  }

  // 4) 각 상자의 "평균색"을 대표색으로 삼아 팔레트를 만든다.
  //    (상자마다 픽셀 수가 다르므로 평균이 곧 인구 가중 평균이 된다 → 자연스러운 대표색)
  return boxes.map(bx => {
    let r=0,g=0,b=0;
    for (const p of bx.pts){ r+=p[0]; g+=p[1]; b+=p[2]; }
    const n = bx.pts.length;
    return [Math.round(r/n), Math.round(g/n), Math.round(b/n)];
  });
}

/* =====================================================================
   applyPalette — 각 픽셀을 팔레트에서 "가장 비슷한 색"으로 바꿔치기(디더링 없음 §3).
   덕분에 색이 몇 개로 딱 떨어지는 납작한 도트 블록이 된다.
   (개선판) 색 거리 계산에 redmean 근사 사용: 사람 눈은 초록>빨강>파랑 순으로 민감해서,
   단순 RGB 거리보다 이 방식이 "저 픽셀만 색 튀는" 오매핑을 줄여 준다.
   ===================================================================== */
function applyPalette(imgData, palette){
  const d = imgData.data;                 // 캔버스 픽셀 배열(RGBA 4개씩). 여기를 직접 덮어쓴다.
  const cache = new Map();                 // 같은 색이 또 나오면 계산을 재사용(속도 최적화)
  for (let i = 0; i < d.length; i += 4){
    const R = d[i], G = d[i+1], B = d[i+2];
    const key = (R << 16) | (G << 8) | B;  // (r,g,b)를 하나의 정수 키로 합쳐 캐시 조회에 사용
    let hit = cache.get(key);
    if (hit === undefined){                 // 처음 보는 색이면 팔레트를 전부 훑어 최근접 색 탐색
      let best = 0, bestDist = Infinity;
      for (let p = 0; p < palette.length; p++){
        const pr = palette[p];
        const rmean = (pr[0] + R) * 0.5;    // 두 빨강값의 평균(redmean 가중에 사용)
        const dr = pr[0]-R, dg = pr[1]-G, db = pr[2]-B;   // 채널별 차이
        // 가중 거리: 초록(4)에 큰 가중, 빨강/파랑은 rmean에 따라 가변 가중.
        const dist = (2 + rmean/256)*dr*dr + 4*dg*dg + (2 + (255-rmean)/256)*db*db;
        if (dist < bestDist){ bestDist = dist; best = p; }
      }
      hit = palette[best];
      cache.set(key, hit);                  // 다음에 같은 색이 오면 이 결과를 바로 씀
    }
    d[i] = hit[0]; d[i+1] = hit[1]; d[i+2] = hit[2];   // 픽셀을 대표색으로 덮어씀(알파는 유지)
  }
}

/* =====================================================================
   dotify — 실제 변환 파이프라인. source 캔버스를 강도 s로 변환해 destCanvas에 그린다.
   (§3의 2→3→4단계가 여기서 순서대로 일어난다)
   ===================================================================== */
function dotify(source, s, destCanvas){
  const g = gridFor(s), k = colorsFor(s);           // 이번 강도의 격자 크기 g, 색 개수 k
  const w = source.width, h = source.height;
  const scale = g / Math.max(w, h);                 // 긴 변이 g가 되도록 하는 축소 비율
  const dw = Math.max(1, Math.round(w * scale));    // 줄인 폭(최소 1px 보장)
  const dh = Math.max(1, Math.round(h * scale));    // 줄인 높이(최소 1px 보장)

  // 2) 다운스케일: 임시(오프스크린) 캔버스에 "부드럽게(평균 샘플링)" 작게 그린다.
  const small = document.createElement("canvas");
  small.width = dw; small.height = dh;
  const sctx = small.getContext("2d");
  sctx.imageSmoothingEnabled = true;                // 축소는 부드럽게(여러 픽셀을 평균) → 색이 곱게
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(source, 0, 0, dw, dh);

  // 3) 색 양자화: 작아진 픽셀들에서 팔레트를 뽑고, 각 픽셀을 팔레트 색으로 바꾼다(무디더).
  const imgData = sctx.getImageData(0, 0, dw, dh);
  const palette = medianCutPalette(imgData.data, k);
  applyPalette(imgData, palette);
  sctx.putImageData(imgData, 0, 0);                 // 바뀐 픽셀을 작은 캔버스에 다시 써넣음

  // 4) 업스케일: 작은 캔버스를 목표 크기로 "계단식(nearest)"으로 키운다 → 선명한 사각 도트.
  const dctx = destCanvas.getContext("2d");
  dctx.imageSmoothingEnabled = false;               // 확대는 뭉개지 말고 그대로(각 칸이 사각형으로)
  dctx.clearRect(0, 0, destCanvas.width, destCanvas.height);
  dctx.drawImage(small, 0, 0, dw, dh, 0, 0, destCanvas.width, destCanvas.height);
}

/* ---- 미리보기 렌더 예약: 슬라이더를 빠르게 움직여도 프레임당 한 번만 그리게 한다(§5) ----
   requestAnimationFrame = "다음 화면 갱신 직전에 이 함수를 실행해줘"라는 예약.
   rafPending 깃발로 이미 예약돼 있으면 또 예약하지 않아 불필요한 렌더를 막는다(디바운스). */
function scheduleRender(){
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    renderPreview();
  });
}

/* 실제로 미리보기 캔버스에 도트 이미지를 그리는 함수 */
function renderPreview(){
  if (!sourceCanvas) return;                 // 아직 이미지가 없으면 아무것도 안 함
  const s = strengthEl.value / 100;          // 슬라이더 0~100 → 0.0~1.0 강도로 변환
  // 미리보기 캔버스의 "내부 해상도"를 원본과 똑같이 맞춘다(경계에서 반 픽셀 잘림 방지 §7).
  preview.width  = sourceCanvas.width;
  preview.height = sourceCanvas.height;
  dotify(sourceCanvas, s, preview);          // 변환해서 이 캔버스에 그림
  fitDisplay();                              // 화면에 보이는 크기(CSS)를 알맞게 조절
}

/* 화면 표시 크기 계산: 박스(BOX_W×BOX_H) 안에 맞추되 원본보다 크게 확대하진 않는다(scale≤1).
   → 박스보다 작은 이미지는 원본 크기 그대로 나오고, 박스(.frame)가 거기에 맞춰 줄어든다. */
function fitDisplay(){
  if (!sourceCanvas) return;
  const w = sourceCanvas.width, h = sourceCanvas.height;
  const availW = Math.min(CONFIG.BOX_W, stage.clientWidth || CONFIG.BOX_W);  // 쓸 수 있는 가로
  const availH = Math.min(CONFIG.BOX_H, window.innerHeight * 0.72);          // 쓸 수 있는 세로
  const scale = Math.min(1, availW / w, availH / h);   // 셋 중 가장 작은 배율(1 넘으면 확대 안 함)
  preview.style.width  = Math.round(w * scale) + "px"; // 내부 해상도는 그대로, CSS 표시 크기만 조절
  preview.style.height = Math.round(h * scale) + "px";
}

/* 창 크기가 바뀌면 표시 크기만 다시 계산(무거운 재변환은 하지 않음).
   resize는 아주 자주 발생하므로 rAF로 프레임당 한 번만 처리한다. */
let resizeRaf = false;
window.addEventListener("resize", () => {
  if (resizeRaf) return;
  resizeRaf = true;
  requestAnimationFrame(() => { resizeRaf = false; fitDisplay(); });
});

/* =====================================================================
   CRT 인트로 (업로드 시 연출): 옛날 브라운관 TV 켤 때처럼
   "치직" 화이트노이즈(정전기) → 전원 ON(세로로 확 펴짐).
   순전히 화면 연출이라 변환 결과/내보내기와는 전혀 상관없다.
   'prefers-reduced-motion'(모션 최소화 설정)이면 통째로 건너뛴다(접근성 §6).
   ===================================================================== */
// 사용자가 OS에서 "움직임 줄이기"를 켰는지 검사(켰으면 애니메이션 생략)
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function playCrtIntro(){
  if (!crtCanvas || reduceMotion()) return;   // 오버레이가 없거나 모션 최소화면 그냥 이미지 표시
  const frameEl = preview.parentElement;       // 오버레이는 박스(.frame) 전체를 덮는다
  const rect = frameEl.getBoundingClientRect();
  crtCanvas.width  = Math.max(1, Math.round(rect.width));    // 오버레이 캔버스 해상도를 박스 크기에 맞춤
  crtCanvas.height = Math.max(1, Math.round(rect.height));
  crtCanvas.classList.add("on");               // CSS에서 .crt.on 이면 display:block → 화면에 보임
  const cx = crtCanvas.getContext("2d");
  cx.imageSmoothingEnabled = false;            // 노이즈는 뭉개지 말고 굵은 도트 느낌으로
  cx.clearRect(0, 0, crtCanvas.width, crtCanvas.height);  // 지난 업로드 때 남은 정전기 잔상 지우기

  // 성능을 위해 노이즈는 작은 캔버스(1/4 크기)에 그린 뒤 nearest로 확대 → 굵은 정전기 알갱이.
  const nw = Math.max(2, Math.round(crtCanvas.width  / 4));
  const nh = Math.max(2, Math.round(crtCanvas.height / 4));
  const noise = document.createElement("canvas"); noise.width = nw; noise.height = nh;
  const nctx = noise.getContext("2d");
  const nImg = nctx.createImageData(nw, nh);    // 노이즈를 채워 넣을 픽셀 버퍼(매 프레임 재사용)

  const DUR = 340, start = performance.now();   // 정전기 지속 시간(ms)과 시작 시각
  function frame(now){
    const t = now - start;                      // 시작 후 흐른 시간(ms)
    const d = nImg.data;
    // 각 픽셀을 무작위 회색으로 채운다 → TV 정전기(스노우) 화면.
    for (let i = 0; i < d.length; i += 4){
      const v = (Math.random() * 255) | 0;      // 0~255 난수(| 0 은 소수 버리고 정수화)
      d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255; // R=G=B=v(회색), 알파=255(불투명)
    }
    nctx.putImageData(nImg, 0, 0);
    cx.clearRect(0, 0, crtCanvas.width, crtCanvas.height);
    cx.drawImage(noise, 0, 0, nw, nh, 0, 0, crtCanvas.width, crtCanvas.height);  // 작은 노이즈를 크게 확대
    // 위→아래로 훑고 지나가는 밝은 수평선(지지직 스윕) 한 줄 추가.
    const ly = (t * 1.6) % crtCanvas.height;
    cx.fillStyle = "rgba(255,255,255,0.18)";
    cx.fillRect(0, ly, crtCanvas.width, 3);
    if (t < DUR){ requestAnimationFrame(frame); }         // 아직 시간 남았으면 다음 프레임도 그림
    else { crtCanvas.classList.remove("on"); powerOnPreview(); }  // 끝나면 오버레이 끄고 전원 ON 연출
  }
  requestAnimationFrame(frame);                 // 첫 프레임 시작
}

/* 전원 ON 연출: preview 캔버스에 .powerOn 클래스를 붙여 CSS 애니메이션(세로로 펴짐)을 실행 */
function powerOnPreview(){
  preview.classList.remove("powerOn");
  void preview.offsetWidth;                 // 레이아웃을 강제로 한 번 읽어 애니메이션을 처음부터 재시작시킴
  preview.classList.add("powerOn");
  // 애니메이션이 끝나면 클래스를 떼어 원상복구(다음번에 또 깨끗이 재생되도록). once:true = 1회만 듣기.
  preview.addEventListener("animationend",
    () => preview.classList.remove("powerOn"), { once: true });
}

/* ---- 슬라이더 옆 숫자(강도%/격자/색) 표시를 현재 값에 맞게 갱신 ---- */
function updateReadout(){
  const pct = +strengthEl.value;            // 앞의 + 는 문자열 "51" → 숫자 51 로 변환
  const s = pct / 100;
  pctEl.textContent = pct;
  rGridEl.textContent = gridFor(s);
  rColorsEl.textContent = colorsFor(s);
  strengthEl.setAttribute("aria-valuetext", pct + " 퍼센트");  // 스크린리더용 읽어주는 값(접근성)
}

// 슬라이더를 움직일 때마다: 숫자 갱신 + 미리보기 다시 그리기(예약).
strengthEl.addEventListener("input", () => { updateReadout(); scheduleRender(); });

/* =====================================================================
   이미지 불러오기: <img> 요소를 받아 흰 배경을 깐 원본 캔버스(sourceCanvas)로 만든다.
   흰 배경을 까는 이유: 투명 PNG를 올렸을 때 뒤가 비치지 않게(§7).
   ===================================================================== */
function loadImageElement(img){
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;    // 이미지의 실제 픽셀 크기로 캔버스 생성
  c.height = img.naturalHeight || img.height;
  const ctx = c.getContext("2d");
  ctx.fillStyle = CONFIG.BG;                  // 먼저 흰색으로 칠하고
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0);                   // 그 위에 이미지를 그림(투명 부분은 흰색이 비침)
  sourceCanvas = c;                           // 이걸 앞으로의 "원본"으로 저장
  renderPreview();                            // 바로 도트 변환해서 미리보기에 표시
  playCrtIntro();                             // 업로드 순간 CRT 인트로(치직 → 전원 ON) 재생
}

/* 사용자가 고른 파일 하나를 받아 <img>로 디코딩한 뒤 위 loadImageElement로 넘긴다 */
function handleFile(file){
  if (!file || !file.type.startsWith("image/")) return;  // 이미지가 아니면 조용히 무시(§7)
  const url = URL.createObjectURL(file);      // 파일을 가리키는 임시 URL 생성
  const img = new Image();
  img.onload = () => { loadImageElement(img); URL.revokeObjectURL(url); };  // 다 읽으면 처리 후 URL 해제
  img.onerror = () => { URL.revokeObjectURL(url); };                        // 실패해도 URL은 반드시 해제
  img.src = url;                              // 여기서 실제 로딩 시작
}

/* ---- "사진 열기" 버튼 → 숨겨진 파일 입력창을 대신 클릭 ---- */
openBtn.addEventListener("click", () => fileEl.click());
// 파일 선택이 바뀌면 첫 번째 파일을 처리
fileEl.addEventListener("change", e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

/* ---- 드래그 앤 드롭 (§5): 캔버스 영역에 사진을 끌어다 놓으면 업로드 ----
   dragenter/dragover 때 preventDefault를 해야 브라우저 기본동작(파일 열기)을 막고 드롭이 가능해진다. */
["dragenter","dragover"].forEach(ev =>
  stage.addEventListener(ev, e => { e.preventDefault(); stage.classList.add("drag"); }));  // 테두리 강조 켜기
["dragleave","drop"].forEach(ev =>
  stage.addEventListener(ev, e => {
    e.preventDefault();
    // 자식 요소 위로 지나가며 생기는 가짜 dragleave는 무시(진짜로 영역을 벗어날 때만 해제)
    if (ev === "dragleave" && stage.contains(e.relatedTarget)) return;
    stage.classList.remove("drag");   // 테두리 강조 끄기
  }));
stage.addEventListener("drop", e => {
  const f = e.dataTransfer.files && e.dataTransfer.files[0];   // 떨어뜨린 파일 중 첫 번째
  if (f) handleFile(f);
});

/* =====================================================================
   PNG 내보내기 (§5): 화면 표시 크기가 아니라 "원본 해상도"로 다시 변환해 저장한다.
   (단, 너무 크면 EXPORT_MAX_LONG로 상한을 둔다)
   ===================================================================== */
exportBtn.addEventListener("click", () => {
  if (!sourceCanvas) return;
  const orig = exportBtn.textContent;         // 원래 버튼 글자를 기억해 뒀다가 끝나면 되돌림
  exportBtn.disabled = true;
  exportBtn.textContent = "렌더링 중…";        // 큰 이미지는 시간이 걸리니 상태를 보여줌

  // 무거운 렌더가 화면을 잠깐 멈추므로, 버튼 글자 갱신이 먼저 그려지도록 다음 프레임으로 미룬다.
  requestAnimationFrame(() => setTimeout(() => {
    try {
      // 내보낼 크기 = 원본 크기. 단 긴 변이 상한을 넘으면 비율 유지하며 줄인다(§7).
      let ow = sourceCanvas.width, oh = sourceCanvas.height;
      const long = Math.max(ow, oh);
      if (long > CONFIG.EXPORT_MAX_LONG){
        const r = CONFIG.EXPORT_MAX_LONG / long;
        ow = Math.round(ow * r); oh = Math.round(oh * r);
      }
      const out = document.createElement("canvas");   // 저장 전용 오프스크린 캔버스
      out.width = ow; out.height = oh;
      dotify(sourceCanvas, strengthEl.value / 100, out);  // 원본 해상도로 다시 변환(캔버스 재출력이라 EXIF 자동 제거 §1)

      // 캔버스를 PNG 이진데이터(blob)로 만들고, 임시 <a> 링크를 만들어 자동 클릭 → 다운로드.
      out.toBlob(blob => {
        const a = document.createElement("a");
        const ts = new Date().toISOString().replace(/[-:T]/g,"").slice(0,14); // 파일명용 시간 도장 YYYYMMDDHHMMSS
        a.href = URL.createObjectURL(blob);
        a.download = `dotprint_${ts}.png`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);  // 잠시 뒤 임시 URL 정리(메모리 회수)
        exportBtn.disabled = false; exportBtn.textContent = orig;  // 버튼 원상복구
      }, "image/png");
    } catch (err){
      console.error(err);                       // 문제가 생기면 콘솔에 남기고
      exportBtn.disabled = false; exportBtn.textContent = orig;  // 버튼은 반드시 되돌림
    }
  }, 0));
});

/* =====================================================================
   내장 샘플 이미지 (§5): 아직 업로드하기 전에도 도트 효과를 바로 보여주려고
   코드로 직접 그리는 간단한 풍경(노을·해·산·언덕·나무). 외부 이미지 파일 없이 자립.
   ===================================================================== */
function buildSample(){
  const W = 640, H = 420;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");

  // 하늘: 위(남색)→중간(주황)→아래(노랑)로 이어지는 세로 그라디언트
  const sky = x.createLinearGradient(0,0,0,H);
  sky.addColorStop(0, "#2b3a67");
  sky.addColorStop(.55, "#e97b5a");
  sky.addColorStop(1, "#f4c15d");
  x.fillStyle = sky; x.fillRect(0,0,W,H);

  // 해: 밝은 원 + 그 둘레의 옅은 후광(반투명 큰 원)
  x.fillStyle = "#ffe08a";
  x.beginPath(); x.arc(W*0.72, H*0.34, 46, 0, Math.PI*2); x.fill();
  x.fillStyle = "rgba(255,224,138,0.35)";
  x.beginPath(); x.arc(W*0.72, H*0.34, 72, 0, Math.PI*2); x.fill();

  // 먼 산: 꺾은선(moveTo→lineTo)으로 삐죽삐죽한 능선을 그려 채움
  x.fillStyle = "#7a4a63";
  x.beginPath();
  x.moveTo(0, H*0.72);
  x.lineTo(W*0.22, H*0.48); x.lineTo(W*0.40, H*0.70);
  x.lineTo(W*0.62, H*0.44); x.lineTo(W*0.85, H*0.72);
  x.lineTo(W, H*0.55); x.lineTo(W, H); x.lineTo(0, H);
  x.closePath(); x.fill();

  // 앞 언덕: 곡선(quadraticCurveTo)으로 부드러운 능선
  x.fillStyle = "#3b5c3a";
  x.beginPath();
  x.moveTo(0, H*0.82);
  x.quadraticCurveTo(W*0.3, H*0.72, W*0.55, H*0.86);
  x.quadraticCurveTo(W*0.8, H*0.98, W, H*0.84);
  x.lineTo(W, H); x.lineTo(0, H); x.closePath(); x.fill();

  // 나무 한 그루를 그리는 작은 함수(위치 tx,ty와 크기 s를 받아 재사용)
  const tree = (tx, ty, s) => {
    x.fillStyle = "#5b3a22";                                   // 기둥(사각형)
    x.fillRect(tx - 3*s, ty, 6*s, 22*s);
    x.fillStyle = "#2f7d44";                                   // 잎(원 3개 겹치기)
    x.beginPath(); x.arc(tx, ty, 16*s, 0, Math.PI*2); x.fill();
    x.beginPath(); x.arc(tx-11*s, ty+6*s, 11*s, 0, Math.PI*2); x.fill();
    x.beginPath(); x.arc(tx+11*s, ty+6*s, 11*s, 0, Math.PI*2); x.fill();
  };
  tree(W*0.16, H*0.80, 1.1);    // 크기를 달리해 나무 세 그루 배치
  tree(W*0.40, H*0.86, 0.85);
  tree(W*0.72, H*0.88, 1.0);

  sourceCanvas = c;    // 이 샘플을 원본으로 삼고
  renderPreview();     // 도트로 변환해 첫 화면에 표시
}

/* =====================================================================
   초기 화면 이미지: 업로드 전 첫 화면을 실제 사진으로 채운다.
   사진은 외부 파일이 아니라 scripts/img-init.js 안에 base64(data URI)로 박아 두었다.
   → 경로 의존이 없어 폴더째 옮기거나 file:// 로 더블클릭해도 그대로 뜨고, 캔버스 taint도 없다.
   이미지가 없거나 로드 실패하면 위 buildSample 절차적 풍경으로 자동 폴백.
   ===================================================================== */
function loadInitialImage(){
  // img-init.js 가 없으면(예: 삭제) 곧장 절차적 샘플로.
  if (!window.INIT_IMAGE){ buildSample(); return; }
  const img = new Image();
  img.onload = () => {
    try {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.fillStyle = CONFIG.BG; ctx.fillRect(0, 0, c.width, c.height);  // 흰 배경 깔고
      ctx.drawImage(img, 0, 0);                                          // 그 위에 사진을 올림
      sourceCanvas = c;
      renderPreview();       // 도트로 변환해 첫 화면 표시(업로드가 아니므로 CRT 인트로는 생략)
    } catch (e){
      buildSample();         // 혹시 모를 실패 시 절차적 샘플로 대체
    }
  };
  img.onerror = () => buildSample();   // 로드 실패 → 절차적 샘플로 대체
  img.src = window.INIT_IMAGE;         // base64 data URI (경로 의존 없음)
}

/* ---- 초기화: 페이지가 열리면 이 순서대로 딱 한 번 실행된다 ---- */
strengthEl.value = CONFIG.DEFAULT_STRENGTH;  // 슬라이더를 기본값으로 강제(브라우저 자동복원에 흔들리지 않게 §4)
updateReadout();                             // 옆 숫자들(강도/격자/색)을 기본값에 맞춰 표시
loadInitialImage();                          // 첫 화면을 실제 사진으로 채움(실패 시 buildSample 폴백)
