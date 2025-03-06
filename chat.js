// username 변경
function changeSetting() {
    user = document.querySelector('.putInUsername').value
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

// 채팅바 추가
chatbar = document.createElement('input')
chatbar.type = 'text'
chatbar.className = 'chatbar'
chatbar.addEventListener('keydown', (key) => {
    if (key.key == 'Enter' && chatbar.value.replaceAll(' ', '') != '') {
        socket.emit('addChat', {username: username, content: chatbar.value, color: color})
        chatbar.value = ''
    }
})
document.querySelector('.chatStorage').appendChild(chatbar)

// 채팅 추가
let messages = []
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