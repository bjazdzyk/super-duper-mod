// ==UserScript==
// @name        super-duper-mod
// @namespace   super-duper-mod
// @description super-duper-mod
// @include     */moomoo.io/*
// @version     1
// @run-at      document-start
// @require     https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js
// @require  http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// ==/UserScript==

// const en = new Uint8Array(Array.from(msgpack.encode('123')))
// console.log(en))

let this_backup = null, onmessage_backup

function send (...data) {
  this_backup.send_org(new Uint8Array(Array.from(msgpack.encode(data))))
}

WebSocket.prototype.send_org = WebSocket.prototype.send

WebSocket.prototype.send = function (data) {
  const m = msgpack.decode(data)
  intercept(m)
  if (this_backup == null) {
    this_backup = this
    init()
  }
  this.send_org(data)
}

function init () {
  document.querySelector('#ot-sdk-btn-floating').remove()
  onmessage_backup = this_backup.onmessage
  this_backup.onmessage = (m) => {
    onmessage(msgpack.decode(new Uint8Array(m.data)))
    onmessage_backup(m)
  }
}

let toggleRecive = 0
let toggleIntercept = 0

let toggleInsta = 0
let mainSkin = 0
let instaSkin = 7
let tempSkin = 0
let rotation = null
let hp = 100
let position = {}
let onWater = 0
let onSnow = 0
let spikeType = 6

function intercept (data) {
  if (data[0] != 2 && data[0] != '2' && data[0] != 'pp') {
      if(toggleIntercept){
        console.log(...data)
      }
  }
  if(data[0] == '13c'){
      if(data[1][2] == 0){
        mainSkin = data[1][1]
        tempSkin = mainSkin
      }
  }
  if (data[0] == 'c') {
    if(toggleInsta){
      if (data[1][0] == 1) {
        send('13c', [0, 0, 1])
        send('13c', [0, instaSkin, 0])
      } else {
        let l = 0
        const int = setInterval(()=>{
          if(l == 0){
            send('13c', [0, 11, 1])
            send('13c', [0, 53, 0])//turret gear
          }else if(l == 1){
            send('13c', [0, tempSkin, 0])
            clearInterval(int)
          }
          l++
        },500)
      }
    }
  }
  if(data[0] == '6'){
    if(data[1][0] == 23){
      spikeType = 7
    }
  }
}
function onmessage (data) {
  if(data[0] == 'h'){
    hp = data[1][1]
    if(hp<=0)
  }
  if(data[0] == '33'){
    rotation = data[1][0][3]
    position.x = data[1][0][1]
    position.y = data[1][0][2]

    if(position.y < 7565 && position.y > 6774){//auto flipper
      if(!onWater){
        tempSkin = 31
        send('13c', [0, 31, 0])
        onWater = 1
      }
    }else{
      if(onWater){
        tempSkin = mainSkin
        send('13c', [0, mainSkin, 0])
        onWater = 0
      }
    }
    if(position.y < 2440){//auto winter hat
      if(!onSnow){
        tempSkin = 15
        send('13c', [0, 15, 0])
        onSnow = 1
      }
    }else{
      if(onSnow){
        tempSkin = mainSkin
        send('13c', [0, mainSkin, 0])
        onSnow = 0
      }
    }

  }
  if(toggleRecive){
    if(data[0] != 'a'){
      console.log(...data)
    }
  }
}
// function loop(){
//   requestAnimationFrame(loop)
//   //console.log(hp)
// }
// loop()

document.addEventListener('keypress', (e)=>{
  if(e.code == "KeyI"){
    toggleInsta = (toggleInsta+1)%2
    console.log(toggleInsta)
  }
  if(e.code == "KeyP"){
    toggleIntercept = (toggleIntercept+1)%2
    console.log(toggleIntercept)
  }
  if(e.code == "KeyL"){
    toggleRecive = (toggleRecive+1)%2
    console.log(toggleRecive)
  }
  if(e.code == "KeyF"){
    send('5', [spikeType, null])//spike
    send('c', [1, rotation])
    send('c', [0, rotation])
  }
  if(e.code == "KeyB"){
    send('5', [22, null])//teleport
    send('c', [1, rotation])
    send('c', [0, rotation])
  }
  if(e.code == "KeyG"){//four spikes
    send('5', [spikeType, null])
    send('c', [1, 0])
    send('c', [0, 0])
    send('5', [spikeType, null])
    send('c', [1, Math.PI/2])
    send('c', [0, Math.PI/2])
    send('5', [spikeType, null])
    send('c', [1, Math.PI])
    send('c', [0, Math.PI])
    send('5', [spikeType, null])
    send('c', [1, Math.PI*1.5])
    send('c', [0, Math.PI*1.5])
  }
  if(e.key == "v"){
    send('5', [16, null])//boost pad
    send('c', [1, rotation])
    send('c', [0, rotation])
  }
})

document.addEventListener('keydown', (e)=>{
  if(e.key == 'V'){
    let l = 0
    const int = setInterval(()=>{
      if(l == 0){
        send('33', [rotation])
        send('5', [16, null])//boost pad
        send('c', [1, rotation])
        send('c', [0, rotation])
      }else if(l == 1){
        send('5', [spikeType, null])
        send('c', [1, rotation+Math.PI*0.5])
        send('c', [0, rotation+Math.PI*0.5])
        send('5', [spikeType, null])
        send('c', [1, rotation+Math.PI*1.5])
        send('c', [0, rotation+Math.PI*1.5])
        send('33', [null])
      }
      l++
    },50)
  }
})
