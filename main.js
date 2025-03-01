var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 100;
canvas.height = window.innerHeight - 100;

var socket = io(); // 소켓 연결

// 플레이어 저장 객체
var players = {};

// 내 캐릭터 정보
var myPlayer = {
  x: 200,
  y: 200,
  width: 30,
  height: 45,
  color: "#" + Math.floor(Math.random() * 16777215).toString(16), // 랜덤 색상
  speed: 5, // 이동 속도 (고정값)
  jumpPower: 15,
  gravity: 0.5,
  deltaY: 0,
  success: 0,
};

// 블록 종류에 따른 색
const blocksInfo = [
  { type: "normal", color: "black", order: 0 },
  { type: "obstacle", color: "red", order: 1 },
  { type: "spike", color: "red", order: 2 },
  { type: "flatSpike", color: "red", order: 3 },
];

// 기본 블록 클래스
class Block {
  constructor(x, y, size, type = "normal") {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = type;

    const blockData = blocksInfo.find((block) => block.type === type);
    this.color = blockData.color;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

// 맵 정보 불러오기

var map = { blocks: [] };
socket.on("newMap", function (newMap) {
  map = {
    ...newMap,
    blocks: newMap.blocks.map((b) => new Block(b.x, b.y, b.size, b.type)),
  };
});

// 서버에 내 캐릭터 정보 전송
socket.emit("newPlayer", myPlayer);

// 키 입력 상태 저장
var keys = {};

// 키가 눌릴 때 true로 설정
window.addEventListener("keydown", function (event) {
  keys[event.key] = true;
});

// 키가 떼질 때 false로 설정
window.addEventListener("keyup", function (event) {
  keys[event.key] = false;
});

// 🌟 고정된 FPS(60)로 플레이어 이동 및 화면 갱신
const FPS = 60; // 초당 프레임
setInterval(updateGame, 1000 / FPS);

function updateGame() {
  movePlayer(); // 플레이어 이동 처리
  socket.emit("movePlayer", myPlayer); // 서버에 위치 전송
  drawPlayers(); // 캔버스 다시 그리기
}

// 플레이어 이동 처리 (중력 & 점프 적용)
function movePlayer() {
  myPlayer.deltaY += myPlayer.gravity; // 중력 적용

  let newX = myPlayer.x;
  let newY = myPlayer.y + myPlayer.deltaY;

  if (keys["ArrowRight"]) newX += myPlayer.speed;
  if (keys["ArrowLeft"]) newX -= myPlayer.speed;

  let isOnGround = false;

  for (const block of map.blocks) {
    // 🔵 상단 충돌 감지 (블록 위 착지)
    if (
      newX + myPlayer.width > block.x &&
      newX < block.x + block.size &&
      myPlayer.y + myPlayer.height <= block.y && // 이전 프레임에서 위에 있었는지 확인
      newY + myPlayer.height > block.y // 새로운 위치가 블록과 겹치는지 확인
    ) {
      newY = block.y - myPlayer.height; // 블록 위에 올려놓기
      myPlayer.deltaY = 0;
      isOnGround = true;
    }

    // 🔴 하단 충돌 감지 (머리 부딪힘)
    if (
      newX + myPlayer.width > block.x &&
      newX < block.x + block.size &&
      myPlayer.y > block.y + block.size && // 이전 프레임에서 아래에 있었는지 확인
      newY < block.y + block.size
    ) {
      newY = block.y + block.size; // 블록 아래로 튕겨나감
      myPlayer.deltaY = 1; // 살짝 밀어줌
    }

    // 🟠 왼쪽 충돌 감지 (벽 충돌)
    if (
      myPlayer.x + myPlayer.width <= block.x && // 이전 프레임에서 왼쪽에 있었는지 확인
      newX + myPlayer.width > block.x &&
      myPlayer.y + myPlayer.height > block.y &&
      myPlayer.y < block.y + block.size
    ) {
      newX = block.x - myPlayer.width; // 왼쪽 벽에서 멈춤
    }

    // 🟣 오른쪽 충돌 감지 (벽 충돌)
    if (
      myPlayer.x >= block.x + block.size && // 이전 프레임에서 오른쪽에 있었는지 확인
      newX < block.x + block.size &&
      myPlayer.y + myPlayer.height > block.y &&
      myPlayer.y < block.y + block.size
    ) {
      newX = block.x + block.size; // 오른쪽 벽에서 멈춤
    }
  }

  // 🟢 점프 판정 수정: 착지 상태에서만 점프 가능
  if (keys["ArrowUp"] && isOnGround) {
    myPlayer.deltaY = -myPlayer.jumpPower; // 점프
  }

  myPlayer.x = newX;
  myPlayer.y = newY;

  // 바닥에 없으면 중력 적용 계속하기
  if (!isOnGround) {
    myPlayer.deltaY += myPlayer.gravity;
  }
}

// 🌟 서버에서 모든 플레이어 정보 수신 (새로운 플레이어 포함)
socket.on("updatePlayers", function (serverPlayers) {
  players = serverPlayers; // 기존 데이터를 새 데이터로 덮어씌움
  drawPlayers();
});

// 모든 플레이어 및 블록 다시 그리기
function drawPlayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 초기화

  // 블록 먼저 그리기
  for (let block of map.blocks) {
    block.draw(ctx);
  }

  // 플레이어 그리기
  for (let id in players) {
    let player = players[id];
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  // 내 플레이어 그리기
  //ctx.fillStyle = myPlayer.color;
  //ctx.fillRect(myPlayer.x, myPlayer.y, myPlayer.width, myPlayer.height);
}
