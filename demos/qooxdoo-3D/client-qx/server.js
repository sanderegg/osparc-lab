// #run script:
// node server.js

const express = require('express');
const path = require('path');

const app = express();
let server = require('http').createServer(app);
let Promise = require('promise');

const HOSTNAME = process.env.SIMCORE_WEB_HOSTNAME || "127.0.0.1"
const PORT = process.env.SIMCORE_WEB_PORT || 8080;
const APP_PATH = process.env.SIMCORE_WEB_OUTDIR || path.resolve(__dirname, 'source-output');
const MODELS_PATH = '/models/';


// serve static assets normally
const static_path = APP_PATH
console.log( "Serving static : " + static_path );
app.use( express.static(static_path) );

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('/', function (request, response) {
  console.log("Routing / to " + path.resolve(APP_PATH, 'index.html'))
  response.sendFile( path.resolve(APP_PATH, 'index.html') );
});

server.listen(PORT, HOSTNAME);


let thrift = require('thrift');

let thrApplication       = require('./thrift/ApplicationJSNode/gen-nodejs/Application.js');
//let thrApplicationTypes  = require('./thrift/ApplicationJSNode/gen-nodejs/application_types');
//let thrAppLogger         = require('./thrift/ApplicationJSNode/gen-nodejs/Logger');
//let thrAppSharedService  = require('./thrift/ApplicationJSNode/gen-nodejs/SharedService');
//let thrAppProcessFactory = require('./thrift/ApplicationJSNode/gen-nodejs/ProcessFactory');
let thrModeler           = require('./thrift/ModelerJSNode/gen-nodejs/Modeler');
let thrModelerTypes      = require('./thrift/ModelerJSNode/gen-nodejs/modeler_types');

const S4L_IP = process.env.CS_S4L_HOSTNAME || '172.16.9.89';
const S4L_PORT_APP = process.env.CS_S4L_PORT_APP || 9095;
const S4L_PORT_MOD = process.env.CS_S4L_PORT_MOD || 9096;

let transport = thrift.TBufferedTransport;
let protocol = thrift.TBinaryProtocol;

let s4lAppClient = null;
let s4lModelerClient = null;
connectToS4LServer().then(function() {
  console.log('Connected to S4L server');
  s4lAppClient.GetApiVersion( function(err, response) {
    console.log('Application API version', response);
  });
  s4lModelerClient.GetApiVersion( function(err, response) {
    console.log('Application API version', response);
  });
}).catch(function(err) {
  console.log('No connection: ' + err);
});


let io = require('socket.io')(server);
io.on('connection', function(socketClient) {
  console.log('Client connected...');

  socketClient.on('importScene', function(active_user) {
    importScene(socketClient, active_user);
  });

  socketClient.on('exportScene', function(args) {
    let active_user = args[0];
    let scene_json = args[1];
    exportScene(socketClient, active_user, scene_json);
  });

  socketClient.on('importModel', function(model_name) {
    importModel(socketClient, model_name);
  });


  socketClient.on('newSplineS4LRequested', function(pointListUUID) {
    var pointList = pointListUUID[0];
    var uuid = pointListUUID[1];
    var transform4x4 = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0];
    var color = { diffuse: { r: 1.0, g: 0.3, b: 0.65, a: 1.0 } };
    var spline = { vertices: pointList, transform4x4: transform4x4, material: color };
    s4lModClient.CreateSpline( spline, uuid, function(err, response_uuid) {
      s4lModClient.GetEntityWire( response_uuid, function(err2, response2) {
        let listOfPoints = {
          type: 'newSplineS4LRequested',
          value: response2,
          uuid: response_uuid
        };
        socketClient.emit('newSplineS4LRequested', listOfPoints);
      });
    });
  });

  socketClient.on('newSphereS4LRequested', function(radiusCenterUUID) {
    let radius = radiusCenterUUID[0];
    let center = radiusCenterUUID[1];
    let uuid = radiusCenterUUID[2];
    s4lModClient.CreateSolidSphere( center, radius, uuid, function(err, response_uuid) {
      const get_normals = false;
      s4lModClient.GetEntityMeshes( response_uuid, get_normals, function(err2, response2) {
        let meshEntity = {
          type: 'newSphereS4LRequested',
          value: response2,
          uuid: response_uuid
        };
        socketClient.emit('newSphereS4LRequested', meshEntity);
      });
    });
  });

  socketClient.on('newBooleanOperationRequested', function(entityMeshesSceneOperationType) {
    let entityMeshesScene = entityMeshesSceneOperationType[0];
    let operationType = entityMeshesSceneOperationType[1];
    booleanOperation(socketClient, entityMeshesScene, operationType);
  });
});

function failureCallback(error) {
  console.log('Thrift error: ' + error);
}

function connectToS4LServer() {
  return new Promise(function(resolve, reject) {
    createThriftConnection(S4L_IP, S4L_PORT_APP, thrApplication, s4lAppClient, disconnectFromApplicationServer)
    .then(function(client) {
      s4lAppClient = client;
      createThriftConnection(S4L_IP, S4L_PORT_MOD, thrModeler, s4lModelerClient, disconnectFromModelerServer)
        .then(function(client) {
          s4lModelerClient = client;
          resolve();
        });
    })
    .catch(function(err) {
      reject(err);
    });
  });
}

function disconnectFromModelerServer() {
  s4lModelerClient = null;
  console.log('Modeler client disconnected');
}

function disconnectFromApplicationServer() {
  s4lAppClient = null;
  console.log('Application client disconnected');
}

/**
 * creates a Thrift connection with the thing object
 *
 * @param {any} host
 * @param {any} port
 * @param {any} thing
 * @param {any} client
 * @param {any} disconnectionCB
 * @return {any} the client object promise
 */
function createThriftConnection(host, port, thing, client, disconnectionCB) {
  return new Promise(function(resolve, reject) {
    if (client == null) {
      const connection = thrift.createConnection(host, port, {
        transport: transport,
        protocol: protocol,
      });

      connection.on('close', function() {
        console.log('Connection to ' + host + ':' + port + ' closed');
        disconnectionCB();
      });
      connection.on('timeout', function() {
        console.log('Connection to ' + ' timed out...');
      });
      connection.on('reconnecting', function(delay, attempt) {
        console.log('Reconnecting to ' + host + ':' + port + ' delay ' + delay + ', attempt ' + attempt);
      });
      connection.on('connect', function() {
        console.log('connected to ' + host + ':' + port);
        client = thrift.createClient(thing, connection);
        resolve(client);
      });
      connection.on('error', function(err) {
        console.log('connection error to ' + host + ':' + port);
        reject(err);
      });
    } else {
      resolve(client);
    }
  });
}

function importScene(socketClient, active_user) {
  const models_dir = APP_PATH + MODELS_PATH + active_user;
  console.log('import Scene from: ', models_dir);
  let fs = require("fs");
  fs.readdirSync(models_dir).forEach(file => {
    const file_path = models_dir +'/'+ file;
    if (file === 'myScene.gltf') {
      fs.readFile(file_path, function (err, data) {
        if (err)
          throw err;
        let modelJson = {};
        modelJson.modelName = file;
        modelJson.value = data.toString();
        modelJson.type = 'importScene';
        console.log("sending file: ", modelJson.modelName);
        socketClient.emit('importScene', modelJson);
      });
    }
  });
};

function exportScene(socketClient, active_user, scene_json) {
  const models_dir = APP_PATH + MODELS_PATH + active_user + '/myScene.gltf';
  console.log('export Scene to: ', models_dir);
  let content = JSON.stringify(scene_json);
  let fs = require('fs');
  fs.writeFile(models_dir, content, 'utf8', function (err) {
    let response = {};
    response.type = 'exportScene';
    response.value = false;
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log(models_dir, " file was saved!");
      response.value = true;
    }
    socketClient.emit('exportScene', response);
    if (err) {
      throw err;
    }
  });
};

function importModel(socketClient, model_name) {
  s4lAppClient.NewDocument( function(err, response) {
    let modelPath;
    switch (model_name) {
      case 'Thelonious':
        modelPath = "D:/sparc/thelonius_reduced.smash";
        break;
      case 'Rat':
        modelPath = "D:/sparc/ratmodel_simplified.smash";
        break;
      case 'BigRat':
        modelPath = "D:/sparc/Rat_Male_567g_v2.0b02.sat";
        break;
      default:
        modelPath = "D:/sparc/ratmodel_simplified.smash";
        break;
    }
    console.log('Importing', model_name);
    s4lModClient.ImportModel( modelPath, function(err2, response2) {
      console.log('Importing path', modelPath);
      s4lModClient.GetFilteredEntities(thrModelerTypes.EntityFilterType.BODY_AND_MESH, function(err3, response3) {
        console.log('Total meshes', response3.length);
        
        let nMeshes = response3.length;
        for (let i = 0; i <nMeshes ; i++) {
          let mesh_id = response3[i].uuid;
          let mesh_name = response3[i].name;
          console.log(mesh_id);
          s4lModClient.GetEntitiesEncodedScene([mesh_id], thrModelerTypes.SceneFileFormat.GLTF, function(err4, response4) {
            let encodedScene = {
              type: 'importModelScene',
              value: response4.data
            };
            let storeAllInServerFirst = false;
            if (storeAllInServerFirst)
            {
              let listOfEncodedScenes = [];
              listOfEncodedScenes.push(encodedScene);
              //socketClient.emit('importModelScene', meshEntity);
              console.log(i);
              if (i === nMeshes-1) {
                sendEncodedScenesToTheClient(socketClient, listOfEncodedScenes);
              }
            }
            else
            {
              sendEncodedScenesToTheClient(socketClient, [encodedScene]);
            }
          });
        }
      });
    });
  });

  function sendToMeshEntitiesToTheClient(socketClient, meshEntities) {
    console.log('sendToMeshEntitiesToTheClient');
    for (let i = 0; i < meshEntities.length; i++) {
      socketClient.emit('importModel', meshEntities[i]);
    }
  };

  function sendEncodedScenesToTheClient(socketClient, listOfEncodedScenes) {
    console.log('sendEncodedScenesToTheClient');
    for (let i = 0; i < listOfEncodedScenes.length; i++) {
      socketClient.emit('importModelScene', listOfEncodedScenes[i]);
    }
  }
};

function booleanOperation(socketClient, entityMeshesScene, operationType) {
  let myEncodedScene = {
    fileType: thrModelerTypes.SceneFileFormat.GLTF,
    data: entityMeshesScene
  }
  s4lModClient.CreateEntitiesFromScene(myEncodedScene, function(err, response) {
    s4lModClient.BooleanOperation(response, operationType, function(err2, response2) {
      s4lModClient.GetEntitiesEncodedScene([response2], thrModelerTypes.SceneFileFormat.GLTF, function(err3, response3) {
        let encodedScene = {
          type: 'newBooleanOperationRequested',
          value: response3.data
        };
        socketClient.emit('newBooleanOperationRequested', encodedScene);
      });
    });
  });
};


console.log("server started on " + PORT + '/app');
