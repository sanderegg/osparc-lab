// #run script:
// node server.js

const express = require('express');
const app = express();
var server = require('http').createServer(app);
var https = require('https');

const port = 8080;

// serve static assets normally
app.use(express.static(__dirname + '/source-output'));

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('/', function (request, response) {
  const path = require('path');
  response.sendFile(path.resolve(__dirname, 'source-output', 'app', 'index.html'));
});

server.listen(port);

var io = require('socket.io')(server);
io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('loadFromServer', function(models_path) {
    loadFromServer(client, models_path);
  });

});


function loadFromServer(client, models_dir) {
  models_dir = 'source-output/app/' + models_dir;
  console.log('loadFromServer: ', models_dir);
  var fs = require("fs");
  fs.readdirSync(models_dir).forEach(file => {
    file_path = models_dir +'/'+ file;
    fs.readFile(file_path, function (err, data) {
      if (err)
        throw err;
      var modelJson = {};
      modelJson.modelName = file;
      modelJson.value = data.toString();
      modelJson.type = 'loadFromServer';
      console.log("sending file: ", modelJson.modelName);
      client.emit('loadFromServer', modelJson);
    });
  });
};

console.log("server started on " + port + '/app');
