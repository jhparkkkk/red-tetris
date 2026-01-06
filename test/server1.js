import chai from "chai";
import { startServer, configureStore } from "./helpers/server";
import rootReducer from "../src/client/reducers";
import { ping } from "../src/client/actions/server";
import io from "socket.io-client";
import params from "../params";

chai.should();

describe("Server Integration Tests", function () {
  let tetrisServer;

  before((cb) =>
    startServer(params.server, function (err, server) {
      tetrisServer = server;
      cb();
    })
  );

  after(function (done) {
    tetrisServer.stop(done);
  });

  describe("Basic Connection", function () {
    it("should pong", function (done) {
      const initialState = {};
      const socket = io(params.server.url);
      const store = configureStore(rootReducer, socket, initialState, {
        pong: () => {
          socket.disconnect();
          done();
        },
      });
      store.dispatch(ping());
    });

    it("should connect to server", function (done) {
      this.timeout(3000);
      const socket = io(params.server.url);

      socket.on("connect", () => {
        socket.connected.should.be.true;
        socket.disconnect();
        done();
      });

      socket.on("connect_error", (err) => {
        socket.disconnect();
        done(err);
      });
    });

    it("should receive available rooms on connection", function (done) {
      this.timeout(3000);
      const socket = io(params.server.url);

      socket.on("rooms", (rooms) => {
        rooms.should.be.an("array");
        socket.disconnect();
        done();
      });

      socket.on("connect_error", (err) => {
        socket.disconnect();
        done(err);
      });
    });
  });

  describe("Room Management", function () {
    it("should create a new room", function (done) {
      this.timeout(3000);
      const socket = io(params.server.url);
      const roomName = "test-room-" + Date.now();

      socket.on("connect", () => {
        socket.emit("create-room", roomName);
      });

      socket.on("new-room", (room) => {
        room.should.equal(roomName);
        socket.disconnect();
        done();
      });

      socket.on("connect_error", (err) => {
        socket.disconnect();
        done(err);
      });
    });

    it("should allow joining a room", function (done) {
      this.timeout(3000);
      const socket = io(params.server.url);
      const roomName = "join-room-" + Date.now();

      socket.on("connect", () => {
        socket.emit("join-room", { room: roomName, player: "TestPlayer" });
      });

      socket.on("player-joined", (data) => {
        data.players.should.include("TestPlayer");
        data.host.should.equal("TestPlayer");
        socket.disconnect();
        done();
      });

      socket.on("connect_error", (err) => {
        socket.disconnect();
        done(err);
      });
    });

    it("should not create duplicate rooms", function (done) {
      this.timeout(3000);
      const socket = io(params.server.url);
      const roomName = "duplicate-room-" + Date.now();

      socket.on("connect", () => {
        socket.emit("create-room", roomName);

        setTimeout(() => {
          socket.emit("create-room", roomName);
        }, 200);
      });

      socket.on("error", (error) => {
        error.message.should.equal("Room already exists");
        socket.disconnect();
        done();
      });

      socket.on("connect_error", (err) => {
        socket.disconnect();
        done(err);
      });
    });
  });

  describe("Game Flow", function () {
    it("should start game when host requests", function (done) {
      this.timeout(5000);
      const socket = io(params.server.url);
      const roomName = "game-start-" + Date.now();

      socket.on("connect", () => {
        socket.emit("join-room", { room: roomName, player: "Host" });
      });

      socket.on("player-joined", () => {
        setTimeout(() => {
          socket.emit("start-game", { room: roomName });
        }, 200);
      });

      socket.on("game-started", (data) => {
        data.should.have.property("piece");
        data.piece.should.have.property("type");
        data.piece.type.should.be.oneOf(["I", "O", "T", "S", "Z", "J", "L"]);
        socket.disconnect();
        done();
      });

      socket.on("connect_error", (err) => {
        socket.disconnect();
        done(err);
      });
    });
  });
});
