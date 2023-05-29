const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;
	
    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");

            // Get the chatroom messages
            socket.emit("get messages");
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);

            // Show the online users
            OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);

            // Add the online user
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);

            // Remove the online user
            OnlineUsersPanel.removeUser(user);
			
			//Join the game to fill vacancy
			if (ChatPanel.iswaiting()){
				socket.emit("queueintogame")
			}
        });

        // Set up the messages event
        socket.on("messages", (chatroom) => {
            chatroom = JSON.parse(chatroom);

            // Show the chatroom messages
            ChatPanel.update(chatroom);
        });

        // Set up the add message event
        socket.on("add message", (message) => {
            message = JSON.parse(message);
			console.log("Received message")
            // Add the message to the chatroom
            ChatPanel.addMessage(message);
        });
        socket.on("typing", (message) => {
            message = JSON.parse(message);
			console.log("Typing",message)
            // Add the message to the chatroom
            //ChatPanel.addMessage(message);
			ChatPanel.addTypeMessage(message);
        });
        socket.on("startgame", (message) => {
			message = JSON.parse(message);
			console.log(message)
			console.log(ChatPanel.getusername());
			ChatPanel.setplayerid( message[  ChatPanel.getusername()     ]  ['id']   )
			console.log("Player id set",ChatPanel.getplayerid());
			console.log("Startgame")
			//Show game page
			if (ChatPanel.iswaiting()){
				console.log("Not in game, still waiting")
			}else{
				ChatPanel.startgame();
				//ChatPanel.
			}
			
        });
        socket.on("pending", () => {
			console.log("Waiting Join Game")
			//Show game page
			ChatPanel.fullplayer();
			
        });
        socket.on("joingame", () => {
			console.log("Wait start")
			//Show game page
			ChatPanel.waitplayer();
			
        });
		
		socket.on("leaderboardresult", (content) => {
			console.log("Received leaderboard")
			
			ChatPanel.fillleaderboard(content);
        });
		
        socket.on("update tank coord", (x, y, dir) => {
            // console.log('you need to update the coord');
            window.tank.updateCoord(x, y, dir);
        });
        socket.on("update monster coord", (time, x, y, dir) => {
             console.log('you need to update the coord Monster');
            window.monster.updateCoord(time, x, y, dir);
			if (ChatPanel.getplayerid()==1){
				//Death +1
				console.log("Death Increment")
				ChatPanel.incrementdeathcount();
			}
			
        });
		
		socket.on("new gem", (x, y, color) => {
            window.gem.generateGem(x, y, color);
        })
		
        socket.on("bullet is updating", (time, x, y, dir) => {
            window.tank.bullet.updateCoord(time, x, y, dir);
        })
		
		
		
		
		
		
		
		
		
		
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    // This function sends a post message event to the server
    const postMessage = function(content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };
	
    // This function sends a post message event to the server
    const postType = function() {
        if (socket && socket.connected) {
            socket.emit("typing", "");
        }
    };
	
	
	
    // This function sends a post ready event to the server
    const postEnter = function() {
        if (socket && socket.connected) {
            socket.emit("ready", "");
        }
    }
    // This function sends a post ready event to the server
	
	//2.1
    const postServerScore = function(content) {
        if (socket && socket.connected) {
            socket.emit("postmark", content);
			console.log("Sent post score")
        }
    }
	
	
	
	//1.
	const postscore = function (content){
		ChatPanel.showleaderboard(content);
	}
	
	//2.2
	const getServerLeaderboard = function (){
		socket.emit("getleaderboard","");
		console.log("Getting leaderboard")
	}
	
	
	
	
	

    return { getSocket, connect, disconnect, postMessage ,postType, postEnter, postscore, postServerScore, getServerLeaderboard};
})();
