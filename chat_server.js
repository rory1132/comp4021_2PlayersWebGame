const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);


// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;

    //
    // D. Reading the users.json file
    //
	const users = JSON.parse(fs.readFileSync("data/users.json"))
	console.log(users);
    //
    // E. Checking for the user data correctness
    //
	if(!username || !avatar || !name || !password ){
		res.json({ status: "error", error: "Empty data " });
		console.log("Empty data");
	}else if ( !containWordCharsOnly(username)){
		res.json({ status: "error", error: "User name contains non-word" });
		console.log("User name has non-word");
	}else if ( username in users ){
		res.json({ status: "error", error: "User exists" });
		console.log("User exists");
	}
	console.log(res.json)
    //
    // G. Adding the new user account
    //
	const hash = bcrypt.hashSync(password, 10);
    //
    // H. Saving the users.json file
    //
	users[username] = {avatar,name,hash};
	fs.writeFileSync("data/users.json",JSON.stringify(users, null, " " ));
    //
    // I. Sending a success response to the browser
    //
	res.json({ success: true });
    // Delete when appropriate
    //res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
	const users = JSON.parse(fs.readFileSync("data/users.json"));
	console.log(users);
    //
    // E. Checking for username/password
    //
	const hashed =  users[username]['hash'];
	console.log(hashed);
	if (username in users){
		if (!bcrypt.compareSync(password, hashed)){
			res.json({ status: "error", error: "Wrong password" });
		}
	}else{
		res.json({ status: "error", error: "User not found" });
	}
    //
    // G. Sending a success response with the user account
    //
	req.session.user = {username:username,avatar:users[username]['avatar'],name:users[username]['name']};
	res.json({ status: "success", user: {username:username,avatar:users[username]['avatar'],name:users[username]['name']} });
    // Delete when appropriate
//    res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
	if (req.session.user){
		res.json({ status: "success",user:req.session.user});
	}else{
		res.json({ status: "error",error:"No session"});
	}
    //
    // D. Sending a success response with the user account
    //
 
    // Delete when appropriate
    //res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
	req.session.destroy();
	
    //
    // Sending a success response
    //
 
    // Delete when appropriate
    res.json({ status: "success"});
});








//
// ***** Please insert your Lab 6 code here *****
//
//online users
const onlineUsers = {};
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer( app );
const io = new Server(httpServer);
io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});
io.on("connection", (socket) => {
	if (socket.request.session.user){
		if ( Object.keys(onlineUsers).length<=1  ){
			onlineUsers[socket.request.session.user['username']] = {avatar:socket.request.session.user['avatar'],name:socket.request.session.user['name']}
			console.log("Added Users")
			console.log(socket.request.session.user)
			socket.broadcast.emit('add user', JSON.stringify(socket.request.session.user));
			socket.emit('add user', JSON.stringify(socket.request.session.user));
			socket.emit('joingame',"");
		} else{
			socket.emit('pending', "");
		}
	}
	console.log("Current List")
	console.log(onlineUsers);
	socket.on("disconnect", () => {
    // Remove the user from the online user list
	if (socket.request.session.user){
		socket.broadcast.emit('remove user', JSON.stringify(socket.request.session.user));
		delete onlineUsers[socket.request.session.user['username']];
		console.log("Disconnected");
		console.log(onlineUsers);
	}
	});
	
	socket.on("get users", () => {
		socket.emit('users', JSON.stringify(onlineUsers));
		console.log(onlineUsers);
	});
	
	socket.on("ready", () => {
		let index = 0; 
		for (const x in onlineUsers){
			onlineUsers[x]['id'] = index
			index +=1
		}
		socket.broadcast.emit('startgame',JSON.stringify(onlineUsers));
		socket.emit('startgame',JSON.stringify(onlineUsers));
		console.log("Game starting");
	});
	socket.on("queueintogame", () => {
		if ( Object.keys(onlineUsers).length<=1  ){
			onlineUsers[socket.request.session.user['username']] = {avatar:socket.request.session.user['avatar'],name:socket.request.session.user['name']}
			console.log("Added Users")
			console.log(socket.request.session.user)
			socket.broadcast.emit('add user', JSON.stringify(socket.request.session.user));
			socket.emit('add user', JSON.stringify(socket.request.session.user));
			socket.emit('joingame',"");
		} else{
			socket.emit('pending', "");
		}
	});
	
	socket.on("tank moved", (x, y, dir) => {
		socket.broadcast.emit("update tank coord", x, y, dir);
	});
	socket.on("monster moved", (time, x, y, dir) => {
		socket.broadcast.emit("update monster coord", time, x, y, dir);
	});
	
	socket.on("generate new gem", (x, y, color) => {
		io.emit("new gem", x, y, color);
	})
	
	socket.on("update bullet", (time, x, y, dir) => {
		socket.broadcast.emit("bullet is updating", time, x, y, dir);
	})
	
	//3
	socket.on("postmark", (req) => {
		const { username, mark } = req;
		const marksheet = JSON.parse(fs.readFileSync("data/mark.json"))
		if (username in marksheet){
			if ( marksheet[username]['mark'] <=mark    ){
				console.log("Old mark is smaller");
				marksheet[username] = {mark};
			}
		}else{
			marksheet[username] = {mark};
		}
		console.log(marksheet);
		fs.writeFileSync("data/mark.json",JSON.stringify(marksheet, null, " " ));
	});
	socket.on("getleaderboard", () => {
		const marksheet = JSON.parse(fs.readFileSync("data/mark.json"))
		console.log(marksheet);
		socket.emit('leaderboardresult',marksheet)
	});

	

	

});





// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});
