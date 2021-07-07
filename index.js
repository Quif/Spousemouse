console.clear();
// == SETTINGS ==
var maxLength = 10; // MAX LENGTH (IN SECONDS)
var FPS = 100; // FPS OF RECORDING (MAXED AT 100)

// ==

var robot = require("robotjs");
var fs = require('fs');
var settings;
var chalk = require("chalk");

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

try {
  const data = fs.readFileSync(__dirname + '/settings.json', 'utf8')
  settings = JSON.parse(data)
} catch (err) {
  console.error(err)
}

var screenSize = robot.getScreenSize();

const io = require("socket.io-client");

awaitConnection()

function awaitConnection(){
  if(settings){
    start()
  } else{
    awaitConnection()
  }
}

function start(){
const socket = io(settings.server);

socket.on("mouseMovement", function (data) {
  if (data.length > maxLength * FPS) {
    data = data.slice(0, maxLength * FPS);
  }
  read(data);
});

socket.on("disconnected", function () {
  socket.emit("disconnect");
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
  console.log(chalk.greenBright("SUCCESSFULLY CONNECTED"));
  GET_MESSAGE();
});

function GET_MESSAGE() {
  var arr = [];
  rl.question(
    chalk.cyanBright("Type ") +
      chalk.cyanBright.underline.italic("mouse") +
      chalk.cyanBright(" to send a mouse movement or ") +
      chalk.cyanBright.underline.italic("wave") +
      chalk.cyanBright(" to say hi to others! \n"),
    (answer) => {
      if (answer.toLowerCase().includes("mouse")) {
        rl.question(chalk.cyan("How many seconds? \n"), (answer) => {
          var writing = setInterval(function () {
            var mouse = robot.getMousePos();
            arr.push([mouse.x, mouse.y]);
          }, 1000 / FPS);
          setTimeout(function () {
            console.log("Sent!");
            socket.emit("mouseMovement", arr);
            GET_MESSAGE();
          }, answer * 1000);
        });
      } else if (answer.toLowerCase().includes("wave")) {
        socket.emit("wave");
        console.log(chalk.magenta.underline("You wave!"));
        GET_MESSAGE();
      } else {
        GET_MESSAGE();
      }
    }
  );
}
function read(dataa) {
  var long = 0;
  var reading = setInterval(function () {
    if (dataa.length > long) {
      robot.moveMouse(dataa[long][0], dataa[long][1]);
      long++;
    } else {
      clearInterval(reading);
    }
  }, 1);
}
}