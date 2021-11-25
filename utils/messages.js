const moment = require('moment');
var Filter = require('bad-words'),
filter = new Filter();


function formatMessage(username, text) {
  var filteredText=filter.clean(text);
  let result = text.localeCompare(filteredText);
  if(result === 1) 
  {
    text="This message contains bad words.";
  }
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
  
}

function formatOldMessage(username, text,time) {
  var filteredText=filter.clean(text);
  let result = text.localeCompare(filteredText);
  if(result === 1) 
  {
    text="This message contains bad words.";
  }
  var currentdate = new Date(); 
  var datetime =currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
  return {
    username,
    text,
    time : datetime
  };
}

module.exports = {formatMessage,formatOldMessage};