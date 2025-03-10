export function testRGB(col) {
  const coloregex = /^([0-9A-Fa-f]{6})$/;
  if (coloregex.test(col)) return '#' + col.toUpperCase()
  return "#" + Math.floor(Math.random() * 16777215).toString(16) // 랜덤 색상
}