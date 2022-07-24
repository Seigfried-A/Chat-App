const users = [];

const addUser = ({ id, username, room }) => {
  //clean user input
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  ////validate the data

  if (!username || !room) {
    return {
      error: "Username or room not provided",
    };
  }

  //check for existing username in a room
  const existingUser = users.find((user) => {
    return (user.room === room) & (user.username === username);
  });

  //check for existing username
  if (existingUser) {
    return {
      error: "This username exists",
    };
  }

  //push data

  const user = { id, username, room };
  users.push(user);
  return { user };
};

//remove users
const removeUsers = (id) => {
  const index = users.findIndex((user) => user.id === id);

  console.log(index);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//getuser

const getUsers = (id) => {
  const user = users.find((user) => user.id === id);
  //check if user exists

  if (!user) {
    return {
      error: " no user found",
    };
  }

  return user;
};

//get the list of users in a Room
const getUsersRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((userRoom) => userRoom.room === room);
};

module.exports = {
  addUser,
  removeUsers,
  getUsers,
  getUsersRoom,
};
