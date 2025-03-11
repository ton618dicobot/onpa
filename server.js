var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
const fs = require("fs");
const path = require("path");

let progress = 'game'

app.use(express.static(__dirname + "/dist/")); // 정적 파일 제공

// 🔥 파일을 비동기적으로 불러오는 함수 (fs 사용)
function loadMap(mapFile) {
  try {
    const data = fs.readFileSync(`assets/maps/${mapFile}.json`, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("맵 로딩 오류:", error);
    return null;
  }
}

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/dist/index.html");
});

const port = 3000

http.listen(port, function () {
  console.log(`Server가 실행 중입니다. 포트번호: ${port}`);
});

var players = {}; // 접속한 플레이어들을 저장할 객체
var messages = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]

io.on("connection", function (socket) {
  console.log("새로운 플레이어 접속:", socket.id);

  socket.emit('progress', progress)
  socket.emit('chatHistory', messages)
  const mapData = loadMap("aaa");
  if (mapData) {
    socket.emit("newMap", mapData);
  }

  // 새로운 플레이어 등록
  socket.on("newPlayer", function (playerData) {
    players[socket.id] = playerData;
    io.emit("updatePlayers", players);
    // 채팅 기록 전송
  });

  // 플레이어 이동 처리
  socket.on("movePlayer", function (playerData) {
    if (players[socket.id]) {
      players[socket.id] = playerData;
      io.emit("updatePlayers", players);
    }
  });

  // 채팅 기록 저장
  socket.on('addChat', function(chat) {
    messages.splice(0, 0, chat)
    messages.pop()
    io.emit('addChat', chat)
  })

  // 플레이어가 접속 종료할 경우 제거
  socket.on("disconnect", function () {
    console.log("플레이어 접속 종료:", socket.id);
    delete players[socket.id];
    io.emit("updatePlayers", players);
  });
});