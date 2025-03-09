var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
let playing = false
let progress

var socket = io(); // 소켓 연결

socket.on('progress', function(data) {
  progress = data
})

// username 불러오기
username = localStorage.username
if (username == undefined) {
    let username = 'Player'
    for (let i = 0; i < 4; i++) username += Math.floor(Math.random() * 9) + 1
    document.querySelector('.putInUsername').value = username
    localStorage.username = username
}
else document.querySelector('.putInUsername').value = username

// RGB 확인
function testRGB(co) {
  regex = /^([0-9A-Fa-f]{6})$/;
  if (regex.test(co)) return '#' + co.toUpperCase()
  regex = /^#([0-9A-Fa-f]{6})$/;
  if (regex.test(co)) return co.toUpperCase()
  return "#" + Math.floor(Math.random() * 16777215).toString(16) // 랜덤 색상
}

// color 불러오기
color = testRGB(localStorage.color)
localStorage.color = color
document.querySelector('.putInColor').value = color
document.querySelector('.putInColor').style.color = color

canvas.width = 1080 * 26 / 27
canvas.height = 607.5 * 14 / 15

// 플레이어 저장 객체
var players = {};

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
  if (playing) {
    movePlayer(); // 플레이어 이동 처리
    socket.emit("movePlayer", myPlayer); // 서버에 위치 전송
  }
  drawPlayers(); // 캔버스 다시 그리기
}