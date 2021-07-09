#!/usr/bin/env node

console.clear();
// == SETTINGS ==
var maxLength = 10; // MAX LENGTH (IN SECONDS)
var FPS = 100; // FPS OF RECORDING (MAXED AT 100)

// ==

var robot = require("robotjs");
var fs = require('fs');
var path = require('path');
var settings;
var roomID;
var chalk = require("chalk");

const readline = require("readline");

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

const io = require("socket.io-client");

awaitConnection()

function awaitConnection(){
  if(settings){
    rl.question(chalk.cyan("What's the room ID? \n") + chalk.grey("(To make a new room just type a unique room ID) \n"), (answer) => {
      roomID = answer
      start()
    })
  } else{
    awaitConnection()
  }
}


var onlineUsers = [];
function start(){
const socket = io(settings.server);

socket.on("mouseMovement", function (data) {
  if (data.length > maxLength * FPS) {
    data = data.slice(0, maxLength * FPS);
  }
  read(data);
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
  if(onlineUsers){
  rl.question("",
    (answer) => {
      if (answer.toLowerCase().includes("mouse")) {
        rl.question(chalk.cyan("How many seconds?\n"), (answer) => {
          var writing = setInterval(function () {
            var mouse = robot.getMousePos();
            arr.push([mouse.x, mouse.y]);
          }, 1000 / FPS);
          setTimeout(function () {
            console.log(chalk.red("Sent!"));
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
  } else { GET_MESSAGE() }
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