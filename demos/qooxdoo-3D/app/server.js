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


var thrift = require('thrift');

var thrApplication       = require('./thrift/ApplicationJSNode/gen-nodejs/Application.js');
var thrApplicationTypes  = require('./thrift/ApplicationJSNode/gen-nodejs/application_types');
var thrAppLogger         = require('./thrift/ApplicationJSNode/gen-nodejs/Logger');
var thrAppSharedService  = require('./thrift/ApplicationJSNode/gen-nodejs/SharedService');
var thrAppProcessFactory = require('./thrift/ApplicationJSNode/gen-nodejs/ProcessFactory');

const S4L_IP = '172.16.9.89';
const S4L_APP_PORT = 9095;

var transport = thrift.TBufferedTransport;
var protocol = thrift.TBinaryProtocol;
var connection_0 = thrift.createConnection(S4L_IP, S4L_APP_PORT, {
  transport: transport,
  protocol : protocol
});
connection_0.on('error', function(err) {
  console.log('Thrift connection to Appication failed:');
  console.log(err);
});

var applicationClient = thrift.createClient(thrApplication, connection_0);
//var multiplexer = new thrift.Multiplexer();
//var applicationClient = multiplexer.createClient('All the same', thrApplication, connection);
applicationClient.GetApiVersion( function(err, response) {
  console.log('Application API version', response);
});


var thrModeler           = require('./thrift/ModelerJSNode/gen-nodejs/Modeler');
var thrModelerTypes      = require('./thrift/ModelerJSNode/gen-nodejs/modeler_types');

const S4L_MODELER_PORT = 9096;

var connection_1 = thrift.createConnection(S4L_IP, S4L_MODELER_PORT, {
  transport: transport,
  protocol : protocol
});
connection_1.on('error', function(err) {
  console.log('Thrift connection to Modeler failed:');
  console.log(err);
});

var modelerClient = thrift.createClient(thrModeler, connection_1);
modelerClient.GetEntities( function(err, response) {
  console.log('Entities');
});


var io = require('socket.io')(server);
io.on('connection', function(socket_client) {
  console.log('Client connected...');

  socket_client.on('importEntities', function(active_user) {
    importEntities(socket_client, active_user);
  });

  socket_client.on('exportEntities', function(args) {
    var active_user = args[0];
    var entities_json = args[1];
    exportEntities(socket_client, active_user, entities_json);
  });

  socket_client.on('importScene', function(active_user) {
    importScene(socket_client, active_user);
  });

  socket_client.on('exportScene', function(args) {
    var active_user = args[0];
    var scene_json = args[1];
    exportScene(socket_client, active_user, scene_json);
  });

  socket_client.on('importViP', function(ViP_model) {
    importViP(socket_client, ViP_model);
  });


  socket_client.on('newSplineS4LRequested', function(pointList_uuid) {
    var pointList = pointList_uuid[0];
    var uuid = pointList_uuid[1];
    var transform4x4 = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0];
    var color = { diffuse: { r: 1.0, g: 0.3, b: 0.65, a: 1.0 } };
    var spline = { vertices: pointList, transform4x4: transform4x4, material: color };
    modelerClient.CreateSpline( spline, uuid, function(err, response) {
      modelerClient.GetEntityWire( response, function(err2, response2) {
        var listOfPoints = {
          type: 'newSplineS4LRequested',
          value: response2,
          uuid: response
        };
        socket_client.emit('newSplineS4LRequested', listOfPoints);
      });
    });
  });
});


function importEntities(socket_client, active_user) {
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
        socket_client.emit('importEntities', modelJson);
      });
    }
  });
};

function exportEntities(socket_client, active_user, entities_json) {
  const models_dir = APP_PATH + MODELS_PATH + active_user;
  var fs = require('fs');
  var response = {};
  response.type = 'exportEntities';
  response.value = entities_json.length > 0;
  for (var i = 0; i < entities_json.length; i++) {
    const file_path = models_dir +'/'+ entities_json[i].name;
    fs.writeFile(file_path, entities_json[i].data, 'utf8', function (err) {
      if (err) {
        console.log("Error: ", err);
        response.value = response.value && false;
      } else {
        console.log(models_dir, " file was saved!");
        response.value = response.value && true;
      }
    });
  }
  socket_client.emit('exportEntities', response);
};

function importScene(socket_client, active_user) {
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
        socket_client.emit('importScene', modelJson);
      });
    }
  });
};

function exportScene(socket_client, active_user, scene_json) {
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
    socket_client.emit('exportScene', response);
    if (err) {
      throw err;
    }
  });
};

function importViP(socket_client, ViP_model) {
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
        socket_client.emit('importViP', modelJson);
      });
    }
  });
};


console.log("server started on " + PORT + '/app');
