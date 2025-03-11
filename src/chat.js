import { username } from "./index"

let messages = []

export function generateChat(socket) {
  // 채팅바 추가
  const chatbar = document.createElement('input')
  chatbar.type = 'text'
  chatbar.className = 'chatbar'
  chatbar.addEventListener('keydown', (ev) => {
    if (ev.key == 'Enter' && chatbar.value.replaceAll(' ', '') != '') {
      socket.emit('addChat', { username: username, content: chatbar.value, color: color })
      chatbar.value = ''
    }
  })
  document.querySelector('.chatStorage').appendChild(chatbar)

  // 채팅 추가
  for (let i = 0; i < 15; i++) {
    let frame = document.createElement('div')
    frame.classList = `chatFrame chat${i}`
    document.querySelector('.chatStorage').appendChild(frame)
    let user = document.createElement('div')
    user.className = 'chatUser'
    frame.appendChild(user)
    user.textContent = '　'
    let content = document.createElement('div')
    content.className = 'chatContent'
    frame.appendChild(content)
    content.textContent = '　'
  }

  // 채팅 기록 전수
  socket.on('chatHistory', (chat) => {
    messages = chat
    updateChat()
  })

  // 채팅 추가 감지
  socket.on('addChat', (chat) => {
    messages.splice(0, 0, chat)
    messages.pop()
    updateChat()
  })
}

//채팅 업데이트
function updateChat() {
  for (let i = 0; i < 15; i++) {
    let frame = document.querySelector(`.chat${i}`)
    if (messages[i] == null) {
      frame.childNodes[0].textContent = '　'
      frame.childNodes[1].textContent = '　'
      return
    }
    frame.childNodes[0].textContent = messages[i].username
    frame.childNodes[1].textContent = messages[i].content
    frame.childNodes[0].style.color = messages[i].color
  }
}