const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUsers,
  getUsers,
  getUsersRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../Public");
app.use(express.static(publicDirectoryPath));

const port = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("joinServer", ({ username, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit("Message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "Message",
        generateMessage("Admin", `${user.username} has Joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersRoom(user.room),
    });
  });

  socket.on("sendMessage", (msg, callback) => {
    console.log("message: " + msg);

    const user = getUsers(socket.id);

    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback("word is profane!");
    }

    io.to(user.room).emit("Message", generateMessage(user.username, msg));
    callback();
  });

  socket.on("Location", (msg, callback) => {
    //console.log("location: " + msg.lat + " , " + msg.long);
    const user = getUsers(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${msg.lat},${msg.long}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUsers(socket.id);

    if (user) {
      io.to(user.room).emit(
        "Message",
        generateMessage("Admin", `${user.username} left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersRoom(user.room),
      });
    }
  });
});

app.get("/home", (req, res) => {
  res.send("hello express");
});

server.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
