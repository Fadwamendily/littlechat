const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
// use mysql
var mysql = require("mysql");
 
// create connection
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "web_chat"
});
 
connection.connect(function (error) {
    // show error, if any
});
const io = new Server(server);
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  
  
  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    // server should listen from each client via it's socket
socket.on("new_message", function (data) {
    console.log("Client", socket.id," says", data);
       // server will send message to all connected clients
    // send same message back to all users
/*     io.emit("new_message",  data);
 */    // save message in database
    connection.query("INSERT INTO messages (message) VALUES ('" + data + "')", function (error, result) {
      // server will send message to all connected clients

      io.emit("new_message", {
        id: result.insertId,
        message: data        
    });
  });
}) ; 
// attach listener to server
socket.on("delete_message", function (messageId) {
  // delete from database
  connection.query("DELETE FROM messages WHERE id = '" + messageId + "'", function (error, result) {
      // send event to all users
      io.emit("delete_message", messageId);
  });
});


 

  
  });

 
  // add headers
app.use(function (request, result, next) {
  result.setHeader("Access-Control-Allow-Origin", "*");
  next();
});
// create API for get_message
app.get("/get_messages", function (request, result) {
  connection.query("SELECT * FROM messages", function (error, messages) {
      // return data will be in JSON format
      result.end(JSON.stringify(messages));
  });
});
  

  server.listen(3000, () => {
    console.log('listening on *:3000');
  });