import { boardH, boardW, playerId, players, playing } from "."
import { Block } from "./block/block"
import { Player } from "./player"

// 내 캐릭터 정보
export const myPlayer = new Player("", "#000000")

// 맵 정보 불러오기
export let map = { blocks: [] }

export function loadMap(newMap) {
  map = {
    ...newMap,
    blocks: newMap.blocks.map((bl) => new Block(bl.type, bl.x, bl.y, bl.size)),
  };
  myPlayer.x = map.startPos.x
  myPlayer.y = map.startPos.y
}

// 모든 플레이어 및 블록 다시 그리기
export function drawPlayers(ctx) {
  ctx.clearRect(0, 0, boardW, boardH); // 화면 초기화
  ctx.font = 'bold 15px Arial'
  ctx.textAlign = 'center'

  if (playing) ctx.globalAlpha = 1
  else ctx.globalAlpha = 0.5

  // 블록 먼저 그리기
  for (let block of map.blocks) {
    block.draw(ctx, block)
  }

  const playerCount = Object.keys(players).length
  const successCount = Object.values(players).filter((e) => e.success).length

  // 성공 인원 그리기
  ctx.globalAlpha = 0.75
  ctx.fillStyle = '#93b5ff'
  ctx.beginPath()
  ctx.roundRect(boardW - 137.5, 20, 112.5, 27.5, 30)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`성공 ${successCount}/${playerCount}`, boardW - 81.25, 38.75)

  // 플레이어 그리기
  for (let id in players) {
    if (id == playerId && !playing) continue
    players[id].draw(ctx)
  }
}