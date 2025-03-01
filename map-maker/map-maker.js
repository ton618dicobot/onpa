const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const tileSize = 40; // 블록 크기
canvas.width = 40 * 26;
canvas.height = 40 * 14;

// 🟢 블록 종류 정보
const blocksInfo = [
  { type: "normal", color: "black" },
  { type: "obstacle", color: "red" },
  { type: "spike", color: "blue" },
  { type: "flatSpike", color: "purple" },
];

let currentBlockIndex = 0; // 🔥 현재 선택된 블록 타입 인덱스
let mouseX = 0,
  mouseY = 0; // 마우스 위치

// 🟢 맵 데이터 구조
let map = {
  name: "Custom Map",
  blocks: [],
};

// 🔵 현재 선택된 블록 타입 표시
function updateBlockTypeDisplay() {
  document.getElementById(
    "blockType"
  ).innerText = `현재 블록: ${blocksInfo[currentBlockIndex].type}`;
}

// 🟢 블록 타입 변경 (←, → 방향키)
window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    currentBlockIndex = (currentBlockIndex + 1) % blocksInfo.length; // 다음 블록 타입
  } else if (event.key === "ArrowLeft") {
    currentBlockIndex =
      (currentBlockIndex - 1 + blocksInfo.length) % blocksInfo.length; // 이전 블록 타입
  }
  updateBlockTypeDisplay();
});

// 🟢 마우스 이동 시 블록 미리보기 업데이트
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = Math.floor((event.clientX - rect.left) / tileSize) * tileSize;
  mouseY = Math.floor((event.clientY - rect.top) / tileSize) * tileSize;
  drawMap();
});

// 🔵 마우스 클릭 → 블록 추가
canvas.addEventListener("mousedown", () => {
  addBlock = setInterval(() => {
    if (!map.blocks.some((b) => b.x === mouseX && b.y === mouseY)) {
      map.blocks.push({
        x: mouseX,
        y: mouseY,
        size: tileSize,
        type: blocksInfo[currentBlockIndex].type,
      });
      drawMap();
    }
  }, 10)
});

// 마우스 떼기 -> 블록 추가 중지
canvas.addEventListener('mouseup', () => {
  clearInterval(addBlock)
})

// 🔥 맵 그리기
function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 기존 블록 그리기
  map.blocks.forEach((block) => {
    const blockData = blocksInfo.find((b) => b.type === block.type);
    ctx.fillStyle = blockData ? blockData.color : "gray";

    if (block.type === "spike") {
      // 🔺 위쪽 방향 가시 (삼각형)
      ctx.beginPath();
      ctx.moveTo(block.x, block.y + block.size); // 왼쪽 아래
      ctx.lineTo(block.x + block.size / 2, block.y); // 위쪽 꼭짓점
      ctx.lineTo(block.x + block.size, block.y + block.size); // 오른쪽 아래
      ctx.closePath();
      ctx.fill();
    } else if (block.type === "flatSpike") {
      // 🔻 아래쪽 방향 가시 (삼각형)
      ctx.beginPath();
      ctx.moveTo(block.x, block.y); // 왼쪽 위
      ctx.lineTo(block.x + block.size / 2, block.y + block.size); // 아래쪽 꼭짓점
      ctx.lineTo(block.x + block.size, block.y); // 오른쪽 위
      ctx.closePath();
      ctx.fill();
    } else {
      // 🟩 일반 블록 (사각형)
      ctx.fillRect(block.x, block.y, block.size, block.size);
    }
  });

  // 미리보기 블록 (반투명)
  ctx.fillStyle = blocksInfo[currentBlockIndex].color;
  ctx.globalAlpha = 0.5;

  if (blocksInfo[currentBlockIndex].type === "spike") {
    ctx.beginPath();
    ctx.moveTo(mouseX, mouseY + tileSize);
    ctx.lineTo(mouseX + tileSize / 2, mouseY);
    ctx.lineTo(mouseX + tileSize, mouseY + tileSize);
    ctx.closePath();
    ctx.fill();
  } else if (blocksInfo[currentBlockIndex].type === "flatSpike") {
    ctx.beginPath();
    ctx.moveTo(mouseX, mouseY);
    ctx.lineTo(mouseX + tileSize / 2, mouseY + tileSize);
    ctx.lineTo(mouseX + tileSize, mouseY);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(mouseX, mouseY, tileSize, tileSize);
  }

  ctx.globalAlpha = 1.0; // 투명도 원래대로 복원
}

// 맵 다운로드
function saveMap() {
  map.name = document.querySelector('.nameInpt').value
  download = document.createElement('a')
  download.href = URL.createObjectURL(new Blob([JSON.stringify(map, null, 2)], { type: 'application.json' }))
  download.download = map.name + '.json'
  download.click()
  download.remove()
}

// 초기 화면 설정
updateBlockTypeDisplay();
drawMap();
