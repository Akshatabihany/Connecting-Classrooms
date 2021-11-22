const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
}

function formatOldMessage(username, text,time) {
  return {
    username,
    text,
    time
  };
}

module.exports = {formatMessage,formatOldMessage};