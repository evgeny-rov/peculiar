const createConversationButton = document.getElementById('create');
const mainAppWindow = document.getElementById('chatapp');
const chatBox = document.getElementById('chatbox');
const messageForm = document.getElementById('chat');

const getRandomStr = () => (Math.random() + 1).toString(36).substring(2);

const createSocket = (query) => {
  return new Promise((res, rej) => {
    const socket = new WebSocket(`ws://localhost:8080/${query}`)
    socket.onopen = () => res(socket);
    socket.onclose = rej;
  })
};

const searchParams = new URLSearchParams(window.location.search);
const conversationIdLink = searchParams.get('conversationId');

const renderMessage = (data) => {
  const newMessageElement = document.createElement('p');
  newMessageElement.textContent = data;

  chatBox.append(newMessageElement);
};

const connect = (socket) => {
  
  const userId = getRandomStr();
  socket.onmessage = (({data}) => {
    const parsedData = JSON.parse(data);

    console.log(parsedData)
    
    if (parsedData.type === 'meta') {
      const {conversationId} = parsedData;
      window.history.pushState("", "", `/?conversationId=${conversationId}`);
    } else {
      renderMessage(parsedData.message);
    }
  });

  socket.send(JSON.stringify({type: 'meta'}));
  
  messageForm.onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(messageForm);
    socket.send(JSON.stringify({
      message: userId + ": " + formData.get('message')
    }));
    messageForm.reset();
  }
}

if (conversationIdLink) {
  const query = `/?conversationId=${conversationIdLink}`;
  createSocket(query).then((socket) => {
    console.log('resolved')
    connect(socket);
    createConversationButton.style.display = 'none';
    mainAppWindow.style.display = 'block';
  });
} else {
  createConversationButton.addEventListener('click', () => {  
    createConversationButton.style.display = 'none';
    mainAppWindow.style.display = 'block';
    createSocket('').then((socket) => {
      connect(socket);
      createConversationButton.style.display = 'none';
      mainAppWindow.style.display = 'block';
    });
  });
}


