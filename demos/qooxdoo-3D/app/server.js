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

  client.on('loadViPServer', function(ViP_model) {
    loadViPFromServer(client, ViP_model);
  });

  client.on('exportScene', function(args) {
    var path = args[0];
    var scene_json = args[1];
    exportScene(path, scene_json);
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

function loadViPFromServer(client, ViP_model) {
  models_dir = 'source-output/app/resource/models/ViP/' + ViP_model;
  console.log('loadViPFromServer: ', ViP_model);
  var fs = require("fs");
  fs.readdirSync(models_dir).forEach(file => {
    file_path = models_dir +'/'+ file;
    fs.readFile(file_path, function (err, data) {
      if (err)
        throw err;
      var modelJson = {};
      modelJson.modelName = file;
      modelJson.value = data.toString();
      modelJson.type = 'loadViPServer';
      client.emit('loadViPServer', modelJson);
    });
  });
};

function exportScene(path, scene_json) {
  models_dir = 'source-output/app/' + path + '/hallo.json';
  console.log('here: ', models_dir);
  var content = JSON.stringify(scene_json);
  var fs = require('fs');
  fs.writeFile(models_dir, content, 'utf8', function (err) {
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log(models_dir, " file was saved!");
    }
  });
};


console.log("server started on " + port + '/app');
