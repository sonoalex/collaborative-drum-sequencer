// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', function(req, res) {
    console.log(__dirname);
  	res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/test', function(req, res) {
    console.log(__dirname);
  	res.sendFile(path.join(__dirname, '/views/test.html'));
});


const users = {};
let gridPositions = {}

io.on('connection', (socket) => {

	console.log('New Connection!');
	
	socket.on('new user', ({username, grid}) => {
		
		console.log('new user grid:', gridPositions);
		
		
		users[username] = socket.id;
		console.log(users);
		//Save the username to socket as well. This is important for later.
		socket["username"] = username;
		console.log(socket["username"]);
		console.log(`✋ ${username} has joined the colabo!! ✋`);

		if (Object.entries(users).length > 1 ) {
			console.log('Emitting config...', gridPositions);
			io.to(socket.id).emit('grid-changed', {
				grid: true,
				message: gridPositions
			});
		}
	  })

	socket.on('isPlaying', data => {
		socket.broadcast.emit('isPlaying', {
			message: data
		});
	});

	socket.on('tempo changed', data => {
		console.log(data);
		socket.broadcast.emit('tempo changed', {
			message: data
		});
	});

	socket.on('grid-changed', (data) => {
		console.log('grid-changed: ' , data);
		gridPositions = data;
		if (Object.entries(users).length === 1) {
			console.log('just one user connected! Do not broadcast');
			return;
		}

		socket.broadcast.emit('grid-changed', {
			grid: 'holi',
			message: data
		});
	});

	socket.on('disconnect', () => {
		//This deletes the user by using the username we saved to the socket
		console.log(users[socket.username]);
		delete users[socket.username]
		console.log(users);
		io.emit('user has left', users);
	  });
});
