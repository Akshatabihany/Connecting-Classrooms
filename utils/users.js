const users=[]; /// instead of this maybe you can keep map with user id

function userJoin(id,username,room,isteacher){
    const user ={id,username,room,isteacher};
    users.push(user);
    return user;
}

function getCurrentUser(id){ //for this function you can return name mapping to this id
    return users.find(user =>user.id === id) 
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
  
    if (index !== -1) {
      return users.splice(index, 1)[0];
    }
  }


  // Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
  }

 module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
 };