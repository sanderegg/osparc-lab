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

  client.on('importMeshes', function(models_path) {
    importMeshes(client, models_path);
  });

  client.on('exportMeshes', function(args) {
    var path = args[0];
    var meshes_json = args[1];
    exportMeshes(client, path, meshes_json);
  });

  client.on('importScene', function(models_path) {
    importScene(client, models_path);
  });

  client.on('exportScene', function(args) {
    var path = args[0];
    var scene_json = args[1];
    exportScene(client, path, scene_json);
  });

  client.on('importViP', function(ViP_model) {
    importViP(client, ViP_model);
  });
});


function importMeshes(client, models_dir) {
  models_dir = 'source-output/app/' + models_dir;
  console.log('import Meshes from: ', models_dir);
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
        modelJson.type = 'importMeshes';
        console.log("sending file: ", modelJson.modelName);
        client.emit('importMeshes', modelJson);
      });
    }
  });
};

function importMeshes(client, path, scene_json) {
  console.log('export Meshes to: ', path);
};

function importScene(client, models_dir) {
  models_dir = 'source-output/app/' + models_dir;
  console.log('loadSceneFromServer: ', models_dir);
  var fs = require("fs");
  fs.readdirSync(models_dir).forEach(file => {
    file_path = models_dir +'/'+ file;
    if (file === 'helloScene.json') {
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

function exportScene(client, path, scene_json) {
  models_dir = 'source-output/app/' + path + '/helloScene.json';
  console.log('here: ', models_dir);
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
  });
};

function importViP(client, ViP_model) {
  models_dir = 'source-output/app/resource/models/ViP/' + ViP_model;
  console.log('importViP: ', ViP_model);
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


console.log("server started on " + port + '/app');
