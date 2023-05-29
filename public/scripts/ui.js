const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Populate the avatar selection
        Avatar.populate($("#register-avatar"));
        
        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();

                    Socket.connect();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const avatar   = $("#register-avatar").val();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, avatar, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    // This function shows the form
    const show = function() {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const UserPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                    SignInForm.show();
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        }
        else {
            $("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const OnlineUsersPanel = (function() {
    // This function initializes the UI
    const initialize = function() {};

    // This function updates the online users panel
    const update = function(onlineUsers) {
        const onlineUsersArea = $("#online-users-area");

        // Clear the online users area
        onlineUsersArea.empty();

		// Get the current user
        const currentUser = Authentication.getUser();

        // Add the user one-by-one
        for (const username in onlineUsers) {
            if (username != currentUser.username) {
                onlineUsersArea.append(
                    $("<div id='username-" + username + "'></div>")
                        .append(UI.getUserDisplay(onlineUsers[username]))
                );
            }
        }
    };

    // This function adds a user in the panel
	const addUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Add the user
		if (userDiv.length == 0) {
			onlineUsersArea.append(
				$("<div id='username-" + user.username + "'></div>")
					.append(UI.getUserDisplay(user))
			);
		}
	};

    // This function removes a user from the panel
	const removeUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
	};

    return { initialize, update, addUser, removeUser };
})();

const ChatPanel = (function() {
	// This stores the chat area
    let chatArea = null;
	let timer = null;
	let gamearea = null;
	let queuing = false;
	let id = null;
	let username = null;
	let deathcount = null;
    // This function initializes the UI
    const initialize = function() {
		// Set up the chat area
		chatArea = $("#chat-area");
		chatType = $("#chat-typing");
		gamearea = $("#game-container");
		waitarea = $("#lobby");
		fullarea = $("#lobby-full");
		username = $("#username");
		gamestart = $("#game-start");
		deathcount = $("#monster-death-count");
		
		
        // Submit event for the input form
        $("#chat-input-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the message content
            const content = $("#chat-input").val().trim();

            // Post it
            Socket.postMessage(content);

			// Clear the message
            $("#chat-input").val("");
        });
		
        waitarea.on('click', function(event) {
			Socket.postEnter();
			console.log('Ready game');
		});

		//On keydown
        $("#chat-input-form").on("change", (e) => {
            // Do not submit the form
            e.preventDefault();
            // Post it
            Socket.postType();
        });
 	};

    // This function updates the chatroom area
    const update = function(chatroom) {
        // Clear the online users area
        chatArea.empty();

        // Add the chat message one-by-one
        for (const message of chatroom) {
			addMessage(message);
        }
    };

    // This function adds a new message at the end of the chatroom
    const addMessage = function(message) {
		const datetime = new Date(message.datetime);
		const datetimeString = datetime.toLocaleDateString() + " " +
							   datetime.toLocaleTimeString();

		chatArea.append(
			$("<div class='chat-message-panel row'></div>")
				.append(UI.getUserDisplay(message.user))
				.append($("<div class='chat-message col'></div>")
					.append($("<div class='chat-date'>" + datetimeString + "</div>"))
					.append($("<div class='chat-content'>" + message.content + "</div>"))
				)
		);
		chatArea.scrollTop(chatArea[0].scrollHeight);
    };
    const addTypeMessage = function(message) {
		clearTimeout(timer)
		chatType.text( message +" is typing...");
		timer = setTimeout(function() {
			chatType.text("");
		}, 3000);
    };
	const startgame = function(){
        playerid = getplayerid();
        console.log(playerid);
		gamearea.show();
		gamestart.click();
	};
	const fullplayer = function(){
		fullarea.show();
		waitarea.hide();
		queuing = true;
	};
	const waitplayer = function(){
		fullarea.hide();
		waitarea.show();
		queuing = false;
	};
	const iswaiting = function(){
		return queuing;
	}
	const setplayerid = function(content){
		id = content;
	}
	const getplayerid = function(){
		return id;
	}
	const getusername = function(){
		console.log("User name",username.text())
		return username.text()
	}
	const incrementdeathcount = function(){
		console.log("Increase death");
		deathcount.text(  parseInt(deathcount.text())+1)
		console.log("New death",deathcount.text())
	}
	
	//2.
	const showleaderboard = function (content){
		//Post mark
		Socket.postServerScore(content)
		Socket.getServerLeaderboard()
	}
	const fillleaderboard = function (content){
		
		console.log(content)
		let leaderboard = content;
	
		//Feed data into div of leaderboard TODO
		
		const leaderboardarea = $("#leaderboard-area");
		leaderboardarea.show();
        // Clear the online users area
        leaderboardarea.empty();

        // Add the user one-by-one
		
		let sortable = [];
		for (const entry in leaderboard){
			sortable.push([entry,leaderboard[entry]['mark']])
		}
		sortable.sort(function(a,b){
			return b[1] - a[1];
		});
		console.log(sortable)
					leaderboardarea.append($("<span>Leaderboard </span>")
				
			);
		
		
        for (const entry2 in sortable) {
			console.log(sortable[entry2]);
			leaderboardarea.append(
				UI.getMarkDisplay(sortable[entry2][0],sortable[entry2][1])
			);
        }
		//gamerarea.hide();
	}

	
	
    return { initialize, update, addMessage, addTypeMessage, startgame, fullplayer, waitplayer, iswaiting, setplayerid,
	getplayerid, getusername, showleaderboard, fillleaderboard, incrementdeathcount};
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-avatar'>" +
			        Avatar.getCode(user.avatar) + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };
    const getMarkDisplay = function(name,mark) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-name'>" +  name  + "</span>"))
            .append($("<span >" + mark + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, UserPanel, OnlineUsersPanel, ChatPanel];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };
	const hideleaderboard = function (){
		const leaderboardarea = $("#leaderboard-area");
		leaderboardarea.hide();
	};

    return { getUserDisplay, initialize, getMarkDisplay, hideleaderboard };
})();
