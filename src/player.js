import { boardH, boardW, keys } from "."
import { map } from "./playGame"

export class Player {
  x = 0
  y = 0
  width = 30
  height = 45
  speed = 5
  jumpPower = 15
  gravity = 0.5
  moveX = 0
  deltaY = 0
  onIce = false
  success = false

  username
  color

  constructor(username, color) {
    this.username = username
    this.color = color
  }

  die() {
    this.x = map.startPos.x
    this.y = map.startPos.y

    this.moveX = 0
    this.deltaY = 0

    this.onIce = false
  }

  set({username, color, x, y, success}) {
    this.username = username
    this.color = color
    this.x = x
    this.y = y
    this.success = success
  }

  toJSON() {
    return {
      username: this.username,
      color: this.color,
      x: this.x,
      y: this.y
    }
  }

  move() {
    this.deltaY += this.gravity

    let newX = this.x
    let newY = this.y + this.deltaY

    const speedFactor = this.onIce ? 0.1 : 0.95
    const speedRetain = this.onIce ? 0.98 : 0.7

    const movementDir = !!keys["ArrowRight"] - !!keys["ArrowLeft"] // bool 연산

    this.moveX += (this.speed * speedFactor / 2) * movementDir;
    this.moveX *= speedRetain

    if (this.moveX > this.speed) this.moveX = this.speed
    if (this.moveX < -this.speed) this.moveX = -this.speed
    newX += this.moveX

    let isOnGround = false;

    // 좌측 벽 감지
    if (newX < 0) newX = 0
    // 우측 벽 감지
    if (newX + this.width > boardW) newX = boardW - this.width

    for (const block of map.blocks) {
      if (block.data.isWall) {
        // 🔵 상단 충돌 감지 (블록 위 착지)
        if (
          newX + this.width > block.x &&
          newX < block.x + block.size &&
          this.y + this.height <= block.y && // 이전 프레임에서 위에 있었는지 확인
          newY + this.height > block.y // 새로운 위치가 블록과 겹치는지 확인
        ) {
          newY = block.y - this.height; // 블록 위에 올려놓기
          this.deltaY = 0;
          isOnGround = true;
          // 얼음 블록
          if (block.type == 'ice') this.onIce = true
          else this.onIce = false
          // 점프 블록
          if (block.type == 'jump') {
            this.deltaY = -1.5 * this.jumpPower
            isOnGround = false
            newY -= 2.5
          }
        }

        // 🔴 하단 충돌 감지 (머리 부딪힘)
        if (
          newX + this.width > block.x &&
          newX < block.x + block.size &&
          this.y > block.y + block.size && // 이전 프레임에서 아래에 있었는지 확인
          newY < block.y + block.size
        ) {
          newY = block.y + block.size; // 블록 아래로 튕겨나감
          this.deltaY = 1; // 살짝 밀어줌
        }

        // 🟠 왼쪽 충돌 감지 (벽 충돌)
        if (
          this.x + this.width <= block.x && // 이전 프레임에서 왼쪽에 있었는지 확인
          newX + this.width > block.x &&
          this.y + this.height > block.y &&
          this.y < block.y + block.size
        ) {
          newX = block.x - this.width; // 왼쪽 벽에서 멈춤
        }

        // 🟣 오른쪽 충돌 감지 (벽 충돌)
        if (
          this.x >= block.x + block.size && // 이전 프레임에서 오른쪽에 있었는지 확인
          newX < block.x + block.size &&
          this.y + this.height > block.y &&
          this.y < block.y + block.size
        ) {
          newX = block.x + block.size; // 오른쪽 벽에서 멈춤
        }
      }
      else if (block.collide(block, this, newX, newY)) {
        const isReturn = block.onCollide(block, this)
        if (isReturn) return
      }
    }

    // 🟢 점프 판정 수정: 착지 상태에서만 점프 가능
    if (keys["ArrowUp"] && isOnGround) {
      this.deltaY = -this.jumpPower; // 점프
    }

    this.x = newX;
    this.y = newY;

    // 바닥에 없으면 중력 적용 계속하기
    if (!isOnGround) {
      this.deltaY += this.gravity;
    }

    // 낙사 판정
    if (this.y > boardH + 4 * this.height) this.die()
  }

  draw(ctx) {
    if (this.success)
      return
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillText(this.username, this.x + 15, this.y - 10)
  }
}