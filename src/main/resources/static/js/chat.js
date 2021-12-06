const url = 'http://localhost:8080';
let stompClient;
let selectedUser;
let socket;
let newMessages = new Map();


function connectToChat(userName) {
    selectedUser = userName;
    console.log("connecting to chat...")
    socket = new SockJS(url + '/chat');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log("connected to: " + frame);
        stompClient.subscribe("/topic/messages/" + userName, function (response) {
            let data = JSON.parse(response.body);
            if (selectedUser === data.sender) {
                render(data.message, data.sender);
            } else {
                newMessages.set(data.sender, data.message);
                $('#userNameAppender_' + data.sender).append('<span id="newMessage_' + data.sender + '" style="color: red">+1</span>');
            }
        });
    });
    fetchAll()
}
function disconnect(){
      let socket = new SockJS(url + '/chat');
      socket.onclose = function() {
    console.log('close');
    stompClient.disconnect();
    setConnected();
};
}

function sendMsg(from, text) {
    stompClient.send("/app/chat/" + selectedUser, {}, JSON.stringify({
        sender: from,
        message: text
    }));
}

function registration() {
    document.getElementById("submitName").style.display = "none";
    let userInputTag = document.getElementById("userName");
    userInputTag.style.display = "none";
    let userInputValue = userInputTag.value;
    let text = "";
    if(userInputValue=="" || userInputValue==null){
        text = "Unknown";
    }else{
        text = userInputValue;
    }
    let x = document.createElement("P");                        // Create a <p> node
    let t = document.createTextNode(text);    // Create a text node
    x.appendChild(t);
    x.id = "userNameDisplay"; 
    document.querySelector(".search").appendChild(x);
    let userName = document.getElementById("userName").value;
    $.get(url + "/registration/" + userName, function (response) {
        connectToChat(userName);
        
    }).fail(function (error) {
        if (error.status === 400) {
            alert("user name has been taken!")
        }
    })
    
    
    
}

function selectUser(userName) {
    console.log("selecting users: " + userName);
    selectedUser = userName;
    
    let isNew = document.getElementById("newMessage_" + userName) !== null;
    if (isNew) {
        let element = document.getElementById("newMessage_" + userName);
        element.parentNode.removeChild(element);
        render(newMessages.get(userName), userName);
    }

    $('#selectedUserId').html('');
    $('#selectedUserId').append('Chat with ' + userName);
      $('.chat-history').find('ul').html('');
}

function fetchAll() {
    $.get(url + "/fetchAllUsers", function (response) {
    	let users = response;
        let usersTemplateHTML = "";
       	userList = users
       	
        for (let i = 0; i < users.length; i++) {
            if(users[i]!=selectedUser){
                  usersTemplateHTML = usersTemplateHTML + 
                    ' <a style="text-decoration:none;color:white" href="#" onclick="selectUser(\'' + users[i] + '\')"><li class="clearfix">\n' +
                    '   <img class="profileImage" src="./img/028d394ffb00cb7a4b2ef9915a384fd9.png" width="55px" height="55px" alt="avatar" />\n' +
                    '   <div class="about">\n' +
                    '   <div class="friendChatName" id="userName' + users[i] + '">'+ users[i] +'</div>\n' +
                    '   <div class="status">\n' +
                    '    <i class="fa fa-circle offline"></i>\n' +
                    '   </div>\n' +
                    '   </div>\n' +
                    '   </li></a>';
        }
        }
        
        $('#usersList').html(usersTemplateHTML);
    });
    
}