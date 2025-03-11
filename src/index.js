import { generateChat } from "./chat"
import { testRGB } from "./utils"
import { drawPlayers, loadMap, myPlayer } from "./playGame"
import { Player } from "./player"

export let username
export let playerId
export let color
export let players = {}
export let playing = false
export const keys = {}

export const boardW = 1280
export const boardH = 720 

const FPS = 60
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

function loadPreference() {
  // username 불러오기
  if (localStorage.username) {
    username = localStorage.username
  }
  else {
    username = 'Player'
    for (let i = 0; i < 4; i++) username += Math.floor(Math.random() * 9) + 1
    localStorage.username = username
  }

  myPlayer.username = username
  document.querySelector('.putInUsername').value = username

  // color 불러오기
  color = testRGB(localStorage.color)
  localStorage.color = color
  myPlayer.color = color
  document.querySelector('.putInColor').value = color
  document.querySelector('.putInColor').style.color = color
}

loadPreference()

const socket = io()
let progress

playerId = socket.id

socket.on('progress', function (data) {
  progress = data
})

socket.on("updatePlayers", function (serverPlayers) {
  const currentPlayers = new Set(Object.keys(players))
  const newPlayers = new Set([playerId])

  for (const id in serverPlayers) {
    if (id === playerId)
      return

    newPlayers.add(id)

    const playerData = serverPlayers[id]

    if (!(id in players))
      players[id] = new Player(playerData.username, playerData.color)

    players[id].set(playerData)
  }

  currentPlayers.difference(newPlayers).forEach(id => {
    delete players[id]
  })
})

socket.on("newMap", function (map) {
  loadMap(map)
})


// 키 입력 상태 저장
window.addEventListener("keydown", function (event) {
  keys[event.key] = true
})

window.addEventListener("keyup", function (event) {
  keys[event.key] = false
})

// 채팅 생성
generateChat(socket)

// 게임 플레이 설정
setInterval(updateGame, 1000 / FPS);

function updateGame() {
  if (playing) {
    myPlayer.move()
    socket.emit("movePlayer", myPlayer)
  }
  drawPlayers(ctx)
}

//게임 참가
window.playGame = function () {
  socket.emit('newPlayer', myPlayer)
  playing = true
}

// 설정 변경
window.changeSetting = function () {
  const user = document.querySelector('.putInUsername').value
  if (user.length < 2 || user.length > 15) {
    alert('username은 2글자 이상, 15글자 이하로 설정해주세요')
    return
  }

  username = user
  localStorage.username = username
  myPlayer.username = username

  color = testRGB(document.querySelector('.putInColor').value)
  myPlayer.color = color
  localStorage.color = color
  document.querySelector('.putInColor').value = color
  document.querySelector('.putInColor').style.color = color
  alert('성공적으로 변경했습니다')
}