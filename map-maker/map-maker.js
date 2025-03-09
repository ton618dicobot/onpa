const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const tileSize = 40; // 블록 크기
canvas.width = 40 * 26;
canvas.height = 40 * 14;

// 🟢 블록 종류 정보
const blocksInfo = [
  { type: 'start', color: '#70cbff'},
  { type: 'end', color: '#ff4fd3'},
  { type: "normal", color: "black" },
  { type: 'ice', color: 'aqua'},
  { type: 'jump', color: '#00ff00'},
  { type: "obstacle", color: "red" },
  { type: "spike", color: "red" },
  { type: "flatSpike", color: "red" },
  { type: 'delete', color: '#ff000088'},
];

let currentBlockIndex = 0; // 🔥 현재 선택된 블록 타입 인덱스
let mouseX = 0,
  mouseY = 0; // 마우스 위치

// 🟢 맵 데이터 구조
let map = {
  name: "New Map",
  blocks: [],
  startPos: {},
  endPos: {}
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
  mouseX = Math.round(mouseX / tileSize) * tileSize;
  mouseY = Math.round(mouseY / tileSize) * tileSize;
  if (currentBlockIndex == 0) {
    mouseX += 5
    mouseY -= 7.5
  }
  if (currentBlockIndex == 1) {
    mouseX += 5
    mouseY += 5
  }
  updateBlockTypeDisplay();
  drawMap()
});

// 🟢 마우스 이동 시 블록 미리보기 업데이트
canvas.addEventListener("mousemove", () => {
  const rect = canvas.getBoundingClientRect();
  mouseX = Math.floor((event.clientX - rect.left) / tileSize) * tileSize;
  mouseY = Math.floor((event.clientY - rect.top) / tileSize) * tileSize;
  if (currentBlockIndex == 0) {
    mouseX += 5
    mouseY -= 7.5
  }
  if (currentBlockIndex == 1) {
    mouseX += 5
    mouseY += 5
  }
  drawMap();
});

// 🔵 마우스 클릭 → 블록 추가
canvas.addEventListener("mousedown", () => {
  addBlock = setInterval(() => {
    if (currentBlockIndex == 0) map.startPos = {x: mouseX, y: mouseY}
    else if (currentBlockIndex == 1) map.endPos = {x: mouseX, y: mouseY}
    else if (currentBlockIndex == 8) {
      if (map.startPos.x == mouseX + 5 && map.startPos.y == mouseY - 7.5) map.startPos = {}
      else if (map.endPos.x == mouseX + 5 && map.endPos.y == mouseY + 5) map.endPos = {}
      map.blocks = map.blocks.filter(e => e.x != mouseX || e.y != mouseY)
    }
    else if (!map.blocks.some((b) => b.x === mouseX && b.y === mouseY)) {
      map.blocks.push({
        x: mouseX,
        y: mouseY,
        size: tileSize,
        type: blocksInfo[currentBlockIndex].type,
      });
    }
    drawMap();
  }, 10)
});

// 마우스 떼기 -> 블록 추가 중지
document.addEventListener('mouseup', () => {
  if (!!window.addBlock) clearInterval(addBlock)
})

// 🔥 맵 그리기
function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 기존 블록 그리기
  if (map.startPos != {}) {
    ctx.fillStyle = blocksInfo[0].color
    ctx.fillRect(map.startPos.x, map.startPos.y, 30, 45)
  }
    
  if (map.endPos != {}) {
    ctx.fillStyle = blocksInfo[1].color
    ctx.fillRect(map.endPos.x, map.endPos.y, 30, 30)
  }

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

  if (currentBlockIndex == 0) {
    ctx.fillRect(mouseX, mouseY, 30, 45)
  }
  else if (currentBlockIndex == 1) {
    ctx.fillRect(mouseX, mouseY, 30, 30)
  }
  else if (blocksInfo[currentBlockIndex].type === "spike") {
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

// 맵 초기화
function clearMap() {
  map.startPos = {}
  map.endPos = {}
  map.blocks = []
  drawMap()
}

//맵 불러오기
function loadMap() {
  load = document.createElement('input')
  load.type = 'file'
  load.accept = '.json'
  load.addEventListener('change', (ev) => {
    file = ev.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        map = JSON.parse(e.target.result)
        document.querySelector('.nameInpt').value = map.name
      }
      reader.readAsText(file)
    }
    load.remove()
  })
  load.click()
  drawMap()
}

// 초기 화면 설정
updateBlockTypeDisplay();
drawMap();