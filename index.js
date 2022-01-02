console.clear();

// == SETTINGS ==
var maxLength = 10; // MAX LENGTH OF SENT MOUSE MOVEMENTS (IN SECONDS)
var FPS = 100; // FPS OF RECORDING (MAXED AT 100)

// == DEPENDENCIES ==

var robot = require("robotjs");
var fs = require('fs');
var path = require('path');
const io = require("socket.io-client");
const chalk = require("chalk");
const readline = require("readline");

var settings;
var roomID;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

try {
  const data = fs.readFileSync(path.join(__dirname + '/settings.json'), 'utf8')
  settings = JSON.parse(data)
} catch (err) {
  console.error(err)
}

var screenSize = robot.getScreenSize();

awaitConnection()

function awaitConnection() {
  if (settings) {
    rl.question(chalk.cyan("What's the room ID? \n") + chalk.grey("(To make a new room just type a unique room ID) \n"), (answer) => {
      roomID = answer
      start()
    })
  } else {
    awaitConnection()
  }
}


var onlineUsers = [];
function start() {
  const socket = io(settings.server);

  socket.on("mouseMovement", function (data) {
    var resDifH;
    var resDifW;
    resDifW = screenSize.width / data[0][0];
    resDifH = screenSize.height / data[0][1];
    if (data.length + 1 > maxLength * FPS) {
      data = data.slice(1, maxLength * FPS);
    }
    read(data, resDifW, resDifH);
  });

  socket.on("disconnected", function () {
    console.log(chalk.rgb(186, 66, 50)("Someone has disconnected!"));
  });

  socket.on("online", function (data) {
    console.log(chalk.rgb(255, 0, 106)("Someone else connected!"));
  });

  socket.on("movementAlert", function (data) {
    console.log(chalk.yellowBright("Someone just sent a new mouse movement!"));
  });

  socket.on("wave", function (data) {
    console.log(chalk.magenta.underline("Someone waves!"));
  });

  socket.on("connect", () => {
    socket.emit("roomID", roomID);
  });

  socket.on("disconnect", () => {
    console.log(chalk.red.underline("Disconnected from server.. attempting reconnect"));
  });

  socket.on("serverInfo", (data) => {
    onlineUsers = data.onlineUsers;
    console.clear();
    console.log(chalk.greenBright("Connected to " + data.name) + chalk.rgb(198, 3, 252)("\nRoom: " + roomID) + "\n" + chalk.rgb(252, 186, 3)(onlineUsers.length + " user(s) online") +
      chalk.cyanBright("\nType ") +
      chalk.cyanBright.underline.italic("mouse") +
      chalk.cyanBright(" to send a mouse movement or ") +
      chalk.cyanBright.underline.italic("wave") +
      chalk.cyanBright(" to say hi to others!"));
    GET_MESSAGE();
  });

  function GET_MESSAGE() {
    var arr = [];
    if (onlineUsers) {
      rl.question("",
        (command) => {
          if (command.toLowerCase().includes("mouse")) {
            rl.question(chalk.cyan("How many seconds?\n"), (answer) => {
              var mouse = robot.getMousePos();
              var displacementX = 0;
              arr.push([screenSize.width, screenSize.height])

              if (mouse.x > screenSize.width) {
                displacementX = screenSize.width;
              }

              setInterval(function () {
                mouse = robot.getMousePos();
                arr.push([Math.abs(mouse.x - displacementX), Math.abs(mouse.y)]);
              }, 1000 / FPS);

              setTimeout(function () {
                console.log(chalk.red("Sent!"));
                socket.emit("mouseMovement", arr);
                GET_MESSAGE();
              }, answer * 1000);
            });

          } else if (command.toLowerCase().includes("wave")) {
            socket.emit("wave");
            console.log(chalk.magenta.underline("You wave!"));
            GET_MESSAGE();

          } else {
            GET_MESSAGE();
          }
        }
      );
    } else { GET_MESSAGE() }
  }
  function read(dataa, resDifW, resDifH) {
    var long = 0;
    var reading = setInterval(function () {
      if (dataa.length > long) {
        robot.moveMouse(dataa[long][0] * resDifW, dataa[long][1] * resDifH);
        long++;
      } else {
        clearInterval(reading);
      }
    }, 1);
  }
}
