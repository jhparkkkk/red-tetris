import fs from 'fs'
import debug from 'debug'

const logerror = debug('tetris:error')
  , loginfo = debug('tetris:info')

const Game = require('./models/Game');
const Player = require('./models/Player');

let games = {};

const initApp = (app, params, cb) => {
  const {host, port} = params
  const handler = (req, res) => {
    const file = req.url === '/bundle.js' ? '/../../build/bundle.js' : '/../../index.html'
    fs.readFile(__dirname + file, (err, data) => {
      if (err) {
        logerror(err)
        res.writeHead(500)
        return res.end('Error loading index.html')
      }
      res.writeHead(200)
      res.end(data)
    })
  }

  app.on('request', handler)

  app.listen({host, port}, () =>{
    loginfo(`tetris listen on ${params.url}`)
    cb()
  })
}

const initEngine = io => {
  io.on('connection', function(socket){
    loginfo("Socket connected: " + socket.id)
    socket.emit('rooms', Object.keys(games));

    socket.on('create-room', (room) => {
      if (games[room]) {
        socket.emit('error', { message: 'Room already exists' });
        return;
      }
      games[room] = new Game(room);
      io.emit('new-room', room);
      loginfo(`Room ${room} created by socket ${socket.id}`);
    });

    socket.on('join-room', ({room, player}) => {
      if (!games[room]) {
        games[room] = new Game(room);
        loginfo(`Room ${room} created on join by ${player}`);
      }
      const p = new Player(socket, player);
      games[room].addPlayer(p);
      socket.join(room);
      const roomPlayers = games[room].players.map(p => p.name);
      const hostName = games[room].host.name;
      loginfo(`Players in room ${room}:`, roomPlayers, "Host:", hostName);
      io.to(room).emit('player-joined', {
        players: roomPlayers,
        host: hostName
      });
      loginfo(`${player} joined room ${room}`);
    });

    socket.on('start-game', ({room}) => {
      loginfo(`Received start-game for room ${room}`);
      if (games[room]) {
        games[room].started = true;
        loginfo(`Starting game in room ${room}`);
        io.to(room).emit('game-started');
        loginfo(`Game started event emitted to room ${room}`);
      } else {
        loginfo(`Error: Room ${room} not found for start-game`);
      }
    });

    socket.on('action', (action) => {
      if(action.type === 'server/ping'){
        socket.emit('action', {type: 'pong'})
      }
    })
  })
}

export function create(params){
  const promise = new Promise( (resolve, reject) => {
    const app = require('http').createServer()
    initApp(app, params, () =>{
      const io = require('socket.io')(app, {
        cors: {
          origin: "http://localhost:8080",
          methods: ["GET", "POST"]
        }
      });
      const stop = (cb) => {
        io.close()
        app.close( () => {
          app.unref()
        })
        loginfo(`Engine stopped.`)
        cb()
      }

      initEngine(io)
      resolve({stop})
    })
  })
  return promise
}
