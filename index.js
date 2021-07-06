var robot = require("robotjs");

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
var screenSize = robot.getScreenSize()

var arr = []
var FPS = 120

DONEXT();

function DONEXT(){
    rl.question('Read or write? ', (answer) => {
    if(answer.toLowerCase().includes("read")){
        read()
    } else{
        write();
    }
})
}

function write(){
    arr = []
    rl.question('How many miliseconds? ', (answer) => {
    var writing = setInterval(function(){
        var mouse = robot.getMousePos();
        arr.push([mouse.x, mouse.y])
    }, 1000/FPS)
    setTimeout(function(){
        console.log(arr.length)
        clearInterval(writing)
        DONEXT();
    }, answer)
})
}

function read(){
    var long = 0;
    var reading = setInterval(function(){
        if(arr.length > long){
    robot.moveMouse(arr[long][0], arr[long][1]);
    long++
        } else{
            console.log(long)
            clearInterval(reading)
        }
}, 1)
DONEXT()
}