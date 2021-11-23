const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
}

function formatOldMessage(username, text,time) {
  // console.log(time.getHours()) 
  // console.log(time.getMinutes())
  // console.log(time.getSeconds())
  var hour =time.getHours()
  if(time.getHours()>12)
  {
    hour=hour-12;
  }
  var T = hour +":"+ time.getMinutes() ;
  console.log(T)
  return {
    username,
    text,
    time : T
  };
}

module.exports = {formatMessage,formatOldMessage};