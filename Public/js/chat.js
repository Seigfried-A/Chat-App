const socket = io();

//elements
const msgForm = document.querySelector("form");
const showLocation = document.querySelector("#show-location");
const FormInput = document.querySelector(".formInput");
const sendMessage = document.querySelector(".send");
const messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const urlTemplate = document.querySelector("#url-template").innerHTML;
const sideBarTemplate = document.querySelector("#side-bar__template").innerHTML;

//Qs
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const newMessage = messages.lastElementChild;

  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = messages.offsetHeight;

  const containerHeight = messages.scrollHeight;

  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};
socket.on("Message", (msg) => {
  //console.log(msg);

  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("hh:mm a"),
  });

  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (msg) => {
  const html = Mustache.render(urlTemplate, {
    username: msg.username,
    url: msg.url,
    createdAt: moment(msg.createdAt).format("hh:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  msgForm.setAttribute("disabled", "disabled");

  if (FormInput.value) {
    socket.emit("sendMessage", FormInput.value, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("delivered");
    });

    msgForm.removeAttribute("disabled");
    FormInput.value = "";
    FormInput.focus();
  } else if (FormInput.value === "") {
    alert("wrong input");
  }
});

showLocation.addEventListener("click", () => {
  // console.log("clicked");
  showLocation.setAttribute("disabled", "disabled");

  if (!navigator.geolocation) {
    return console.log("no support");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "Location",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      () => {
        showLocation.removeAttribute("disabled");
        console.log("Location Shared!");
      }
    );
  });
});

socket.emit("joinServer", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
