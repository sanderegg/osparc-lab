// #run script:
// node server.js

const express = require('express');
const app = express();
var server = require('http').createServer(app);
var https = require('https');

const PORT = 8080;
const APP_PATH = 'source-output/app/'
const MODELS_PATH = 'resource/models/';

// serve static assets normally
app.use(express.static(__dirname + '/source-output'));

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('/', function (request, response) {
  const path = require('path');
  response.sendFile(path.resolve(__dirname, APP_PATH, 'index.html'));
});

server.listen(PORT);


var io = require('socket.io')(server);
io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('importEntities', function(active_user) {
    importEntities(client, active_user);
  });

  client.on('exportEntities', function(args) {
    var active_user = args[0];
    var entities_json = args[1];
    exportEntities(client, active_user, entities_json);
  });

  client.on('importScene', function(active_user) {
    importScene(client, active_user);
  });

  client.on('exportScene', function(args) {
    var active_user = args[0];
    var scene_json = args[1];
    exportScene(client, active_user, scene_json);
  });

  client.on('importViP', function(ViP_model) {
    importViP(client, ViP_model);
  });
});


function importEntities(client, active_user) {
  const models_dir = APP_PATH + MODELS_PATH + active_user;
  console.log('import Entities from: ', models_dir);
  var fs = require("fs");
  fs.readdirSync(models_dir).forEach(file => {
    if ('obj' === file.split('.').pop()) {
      const file_path = models_dir +'/'+ file;
      fs.readFile(file_path, function (err, data) {
        if (err)
          throw err;
        var modelJson = {};
        modelJson.modelName = file;
        modelJson.value = data.toString();
        modelJson.type = 'importEntities';
        console.log("sending file: ", modelJson.modelName);
        client.emit('importEntities', modelJson);
      });
    }
  });
};

function exportEntities(client, active_user, entities_json) {
  const models_dir = APP_PATH + MODELS_PATH + active_user;
  var fs = require('fs');
  for (var i = 0; i < entities_json.length; i++) {
    const file_path = models_dir +'/'+ entities_json[i].name;
    fs.writeFile(file_path, entities_json[i].data, 'utf8', function (err) {
      var response = {};
      response.type = 'exportScene';
      response.value = false;
      if (err) {
        console.log("Error: ", err);
      } else {
        console.log(models_dir, " file was saved!");
        response.value = true;
      }
      client.emit('exportScene', response);
    });
  }
};

function importScene(client, active_user) {
  const models_dir = APP_PATH + MODELS_PATH + active_user;
  console.log('import Scene from: ', models_dir);
  var fs = require("fs");
  fs.readdirSync(models_dir).forEach(file => {
    const file_path = models_dir +'/'+ file;
    if (file === 'myScene.json') {
      fs.readFile(file_path, function (err, data) {
        if (err)
          throw err;
        var modelJson = {};
        modelJson.modelName = file;
        modelJson.value = data.toString();
        modelJson.type = 'importScene';
        console.log("sending file: ", modelJson.modelName);
        client.emit('importScene', modelJson);
      });
    }
  });
};

function exportScene(client, active_user, scene_json) {
  const models_dir = APP_PATH + MODELS_PATH + active_user + '/myScene.json';
  console.log('export Scene to: ', models_dir);
  var content = JSON.stringify(scene_json);
  var fs = require('fs');
  fs.writeFile(models_dir, content, 'utf8', function (err) {
    var response = {};
    response.type = 'exportScene';
    response.value = false;
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log(models_dir, " file was saved!");
      response.value = true;
    }
    client.emit('exportScene', response);
    if (err) {
      throw err;
    }
  });
};

function importViP(client, ViP_model) {
  models_dir = APP_PATH + MODELS_PATH + 'ViP/' + ViP_model;
  console.log('sending files: ', models_dir);
  var fs = require("fs");
  fs.readdirSync(models_dir).forEach(file => {
    if ('obj' === file.split('.').pop()) {
      file_path = models_dir +'/'+ file;
      fs.readFile(file_path, function (err, data) {
        if (err)
          throw err;
        var modelJson = {};
        modelJson.modelName = file;
        modelJson.value = data.toString();
        modelJson.type = 'importViP';
        client.emit('importViP', modelJson);
      });
    }
  });
};


console.log("server started on " + PORT + '/app');
