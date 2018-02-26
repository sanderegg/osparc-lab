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
    modelerClient.CreateSpline( spline, uuid, function(err, response_uuid) {
      modelerClient.GetEntityWire( response_uuid, function(err2, response2) {
        var listOfPoints = {
          type: 'newSplineS4LRequested',
          value: response2,
          uuid: response_uuid
        };
        socket_client.emit('newSplineS4LRequested', listOfPoints);
      });
    });
  });

  socket_client.on('newSphereS4LRequested', function(radius_center_uuid) {
    var radius = radius_center_uuid[0];
    var center = radius_center_uuid[1];
    var uuid = radius_center_uuid[2];
    modelerClient.CreateSolidSphere( center, radius, uuid, function(err, response_uuid) {
      const get_normals = false;
      modelerClient.GetEntityMeshes( response_uuid, get_normals, function(err2, response2) {
        var meshEntity = {
          type: 'newSphereS4LRequested',
          value: response2,
          uuid: response_uuid
        };
        socket_client.emit('newSphereS4LRequested', meshEntity);
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
  applicationClient.NewDocument( function(err, response) {
    var vipPath;
    switch (ViP_model) {
      case 'Thelonious':
        vipPath = "D:/Thelonious_v3_20140519_selfinter3_S4Lbuilt68_simplify.smash_Results/9c9aea0d-8539-400f-98dd-715ae0b5df07_simplify.dat"
        break;
      default:
        vipPath = "D:/Thelonious_v3_20140519_selfinter3_S4Lbuilt68_simplify.smash_Results/9c9aea0d-8539-400f-98dd-715ae0b5df07_simplify.dat"
        break;
    }
    modelerClient.ImportModel( vipPath, function(err2, response2) {
      console.log('Importing', ViP_model);
      modelerClient.GetFilteredEntities(thrModelerTypes.EntityFilterType.BODY_AND_MESH, function(err3, response3) {
        console.log('Total meshes', response3.length);
        for (let i = 0; i < response3.length; i++) {
          let mesh_id = response3[i].uuid;
          let mesh_name = response3[i].name;
          const get_normals = false;
          modelerClient.GetEntityMeshes( mesh_id, get_normals, function(err4, response4) {
            var meshEntity = {
              type: 'importViP',
              value: response4,
              uuid: mesh_id,
              name: mesh_name
            };
            socket_client.emit('importViP', meshEntity);
            console.log(i);
          });
        }
      });
    });
  });
  /*
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
  */
};


console.log("server started on " + PORT + '/app');
