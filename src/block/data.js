export const blockDatas = {}

function defaultDraw(ctx, block) {
  ctx.fillStyle = block.data.color
  ctx.fillRect(block.x, block.y, block.size, block.size)
}

function defaultCollision(block, player, newX, newY) {
  return newX + player.width > block.x &&
    newX < block.x + block.size &&
    newY + player.height > block.y &&
    newY < block.y + block.size
}

function registerBlockData(name, color = "black", isWall = false,
  draw = defaultDraw, collide = () => false, onCollide = () => {}) {
  if (name in blockDatas)
    throw new Error(`이미 '${name}' 이름의 블럭이 존재합니다`)

  blockDatas[name] = { type: name, color, isWall, draw, collide, onCollide }
}

registerBlockData(
  "normal",
  "black",
  true,
  defaultDraw
)

registerBlockData(
  "ice",
  "aqua",
  true,
  defaultDraw
)

registerBlockData(
  "jump",
  "#00ff00",
  true,
  defaultDraw
)

function obstacleOnCollide(block, player) {
  player.die()
  return true
}

registerBlockData(
  "obstacle",
  "red",
  false,
  defaultDraw,
  defaultCollision,
  obstacleOnCollide
)

registerBlockData(
  "spike",
  "red",
  false,
  (ctx, block) => {
    ctx.fillStyle = block.data.color
    ctx.beginPath()
    ctx.moveTo(block.x, block.y + block.size) // 왼쪽 아래
    ctx.lineTo(block.x + block.size / 2, block.y) // 위쪽 꼭짓점
    ctx.lineTo(block.x + block.size, block.y + block.size) // 오른쪽 아래
    ctx.closePath()
    ctx.fill()
  },
  defaultCollision,
  obstacleOnCollide
)

registerBlockData(
  "flatSpike",
  "red",
  false,
  (ctx, block) => {
    ctx.fillStyle = block.data.color
    ctx.beginPath()
    ctx.moveTo(block.x, block.y) // 왼쪽 위
    ctx.lineTo(block.x + block.size / 2, block.y + block.size) // 아래쪽 꼭짓점
    ctx.lineTo(block.x + block.size, block.y) // 오른쪽 위
    ctx.closePath();
    ctx.fill();
  },
  defaultCollision,
  obstacleOnCollide
)