// ==UserScript==
// @name        super-duper-mod
// @namespace   super-duper-mod
// @description super-duper-mod
// @include     */moomoo.io/*
// @version     1
// @run-at      document-start
// @require     https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js
// @require  http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
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

let toggleInsta = 0
let mainSkin = 0
let instaSkin = 7
let rotation = null
let hp = 100

function intercept (data) {
  if (data[0] != 2 && data[0] != '2' && data[0] != 'pp') {
      console.log(...data)
  }
  if(data[0] == '13c'){
      if(data[1][2] == 0){
          mainSkin = data[1][1]
      }
  }
  if (data[0] == 'c') {
    if(toggleInsta){
      if (data[1][0] == 1) {
        send('13c', [0, 0, 1])
        send('13c', [0, instaSkin, 0])
      } else {
        send('13c', [0, 11, 1])
        send('13c', [0, mainSkin, 0])
      }
    }
  }
  if(data[0] == '33'){
    rotation = data[1][0]
  }
}
function onmessage (data) {
  if(data[0] == 'h'){
    hp = data[1][1]
  }
  // if(data[0]!= "33" && data[0]!="a" && data[0]!="pp"){

  // }
}
function loop(){
  requestAnimationFrame(loop)
  //console.log(hp)
}
loop()

document.addEventListener('keypress', (e)=>{
  if(e.code == "KeyI"){
    toggleInsta = (toggleInsta+1)%2
    console.log(toggleInsta)
  }
})
