import { blockDatas } from "./data"

export class Block {
  x
  y
  size
  data

  constructor(type = "normal", x, y, size) {
    if (!(type in blockDatas))
      throw new Error(`'${type}' 이름의 블럭이 존재하지 않습니다`)

    this.data = blockDatas[type]
    this.x = x
    this.y = y
    this.size = size
  }

  get type() {
    return this.data.type
  }

  get draw() {
    return this.data.draw
  }

  get collide() {
    return this.data.collide
  }

  get onCollide() {
    return this.data.onCollide
  }
}