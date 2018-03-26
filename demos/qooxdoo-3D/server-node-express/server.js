// #run script:
// node server.js

const express = require('express');
const path = require('path');

const app = express();
let server = require('http').createServer(app);

const HOSTNAME = process.env.SIMCORE_WEB_HOSTNAME || '127.0.0.1';
const PORT = process.env.SIMCORE_WEB_PORT || 8080;
const APP_PATH = process.env.SIMCORE_WEB_OUTDIR || path.resolve(__dirname, 'source-output');


// serve static assets normally
const staticPath = APP_PATH;
console.log( 'Serving static : ' + staticPath );
app.use( express.static(staticPath) );

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('/', function(request, response) {
  console.log('Routing / to ' + path.resolve(APP_PATH, 'index.html'));
  response.sendFile( path.resolve(APP_PATH, 'index.html') );
});

server.listen(PORT, HOSTNAME);


let thrift = require('thrift');

let thrApplication = require('./thrift/ApplicationJSNode/gen-nodejs/Application.js');
// let thrApplicationTypes = require('./thrift/ApplicationJSNode/gen-nodejs/application_types');
// let thrAppLogger = require('./thrift/ApplicationJSNode/gen-nodejs/Logger');
// let thrAppSharedService = require('./thrift/ApplicationJSNode/gen-nodejs/SharedService');
// let thrAppProcessFactory = require('./thrift/ApplicationJSNode/gen-nodejs/ProcessFactory');
let thrModeler = require('./thrift/ModelerJSNode/gen-nodejs/Modeler');
let thrModelerTypes = require('./thrift/ModelerJSNode/gen-nodejs/modeler_types');

const S4L_IP = process.env.CS_S4L_HOSTNAME || '172.16.9.89';
const S4L_PORT_APP = process.env.CS_S4L_PORT_APP || 9095;
const S4L_PORT_MOD = process.env.CS_S4L_PORT_MOD || 9096;

let transport = thrift.TBufferedTransport;
let protocol = thrift.TBinaryProtocol;

let s4lAppClient = createThriftConnection(S4L_IP, S4L_PORT_APP,
  thrApplication, function(err) {
  console.log('Thrift connection to the application failed:');
  console.log(err);
});

// var multiplexer = new thrift.Multiplexer();
// var s4lAppClient = multiplexer.createClient('All the same', thrApplication, connection);
s4lAppClient.GetApiVersion( function(err, response) {
  console.log('Application API version', response);
});

let s4lModClient = createThriftConnection(S4L_IP, S4L_PORT_MOD, thrModeler, function(err) {
  console.log('Thrift connection to the modeler failed:');
  console.log(err);
});

let io = require('socket.io')(server);
io.on('connection', function(socketClient) {
  console.log('Client connected...');

  socketClient.on('importEntities', function(activeUser) {
    importEntities(socketClient, activeUser);
  });

  socketClient.on('exportEntities', function(args) {
    let activeUser = args[0];
    let entitiesJson = args[1];
    exportEntities(socketClient, activeUser, entitiesJson);
  });

  socketClient.on('importScene', function(activeUser) {
    importScene(socketClient, activeUser);
  });

  socketClient.on('exportScene', function(args) {
    let activeUser = args[0];
    let sceneJson = args[1];
    exportScene(socketClient, activeUser, sceneJson);
  });

  socketClient.on('importModel', function(modelName) {
    importModel(socketClient, modelName);
  });


  socketClient.on('newSplineS4LRequested', function(pointListUUID) {
    let pointList = pointListUUID[0];
    let uuid = pointListUUID[1];
    let transform4x4 = [
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0];
    let color = {diffuse: {r: 1.0, g: 0.3, b: 0.65, a: 1.0}};
    let spline = {vertices: pointList, transform4x4: transform4x4, material: color};
    s4lModClient.CreateSpline( spline, uuid, function(err, responseUUID) {
      s4lModClient.GetEntityWire( responseUUID, function(err2, response2) {
        let listOfPoints = {
          type: 'newSplineS4LRequested',
          value: response2,
          uuid: responseUUID,
        };
        socketClient.emit('newSplineS4LRequested', listOfPoints);
      });
    });
  });

  socketClient.on('newSphereS4LRequested', function(radiusCenterUUID) {
    let radius = radiusCenterUUID[0];
    let center = radiusCenterUUID[1];
    let uuid = radiusCenterUUID[2];
    s4lModClient.CreateSolidSphere( center, radius, uuid, function(err, responseUUID) {
      const getNormals = false;
      s4lModClient.GetEntityMeshes( responseUUID, getNormals, function(err2, response2) {
        let meshEntity = {
          type: 'newSphereS4LRequested',
          value: response2,
          uuid: responseUUID,
        };
        socketClient.emit('newSphereS4LRequested', meshEntity);
      });
    });
  });

  socketClient.on('newBooleanOperationRequested', function(entityMeshesScene_operationType) {
    let entityMeshesScene = entityMeshesScene_operationType[0];
    let operationType = entityMeshesScene_operationType[1];
    booleanOperation(socketClient, entityMeshesScene, operationType);
  });
});


/**
 * creates a Thrift connection with the thing object
 *
 * @param {any} host
 * @param {any} port
 * @param {any} thing
 * @param {any} errorCallback
 * @return {any} the client object
 */
function createThriftConnection(host, port, thing, errorCallback) {
  const connection = thrift.createConnection(host, port, {
    transport: transport,
    protocol: protocol,
  });
  connection.on('error', errorCallback);
  connection.on('close', function() {
    console.log('Connection to ' + thing + ' closed');
  });
  connection.on('timeout', function() {
    console.log('Connection to ' + thing + ' timed out...');
  });
  connection.on('reconnecting', function(delay, attempt) {
    console.log('Reconnecting to ' + thing + ' delay ' + delay + ', attempt ' + attempt);
  });
  connection.on('connect', function() {
    console.log('connected to ' + thing);
  });

  return thrift.createClient(thing, connection);
}

/**
 * Import entities from local folder
 *
 * @param {any} socketClient
 * @param {any} activeUser
 */
function importEntities(socketClient, activeUser) {
  const modelsDirectory = APP_PATH + MODELS_PATH + activeUser;
  console.log('import Entities from: ', modelsDirectory);
  let fs = require('fs');
  fs.readdirSync(modelsDirectory).forEach((file) => {
    if ('obj' === file.split('.').pop()) {
      const filePath = modelsDirectory +'/'+ file;
      fs.readFile(filePath, function(err, data) {
        if (err) {
          throw err;
        }
        let modelJson = {};
        modelJson.modelName = file;
        modelJson.value = data.toString();
        modelJson.type = 'importEntities';
        console.log('sending file: ', modelJson.modelName);
        socketClient.emit('importEntities', modelJson);
      });
    }
  });
};

function exportEntities(socketClient, activeUser, entitiesJson) {
  const modelsDirectory = APP_PATH + MODELS_PATH + activeUser;
  let fs = require('fs');
  let response = {};
  response.type = 'exportEntities';
  response.value = entitiesJson.length > 0;
  for (let i = 0; i < entitiesJson.length; i++) {
    const filePath = modelsDirectory +'/'+ entitiesJson[i].name;
    fs.writeFile(filePath, entitiesJson[i].data, 'utf8', function(err) {
      if (err) {
        console.log('Error: ', err);
        response.value = response.value && false;
      } else {
        console.log(modelsDirectory, ' file was saved!');
        response.value = response.value && true;
      }
    });
  }
  socketClient.emit('exportEntities', response);
};

function importScene(socketClient, activeUser) {
  const modelsDirectory = APP_PATH + MODELS_PATH + activeUser;
  console.log('import Scene from: ', modelsDirectory);
  let fs = require('fs');
  fs.readdirSync(modelsDirectory).forEach((file) => {
    const filePath = modelsDirectory +'/'+ file;
    if (file === 'myScene.gltf') {
      fs.readFile(filePath, function(err, data) {
        if (err) {
throw err;
}
        let modelJson = {};
        modelJson.modelName = file;
        modelJson.value = data.toString();
        modelJson.type = 'importScene';
        console.log('sending file: ', modelJson.modelName);
        socketClient.emit('importScene', modelJson);
      });
    }
  });
};

function exportScene(socketClient, activeUser, sceneJson) {
  const modelsDirectory = APP_PATH + MODELS_PATH + activeUser + '/myScene.gltf';
  console.log('export Scene to: ', modelsDirectory);
  let content = JSON.stringify(sceneJson);
  let fs = require('fs');
  fs.writeFile(modelsDirectory, content, 'utf8', function(err) {
    let response = {};
    response.type = 'exportScene';
    response.value = false;
    if (err) {
      console.log('Error: ', err);
    } else {
      console.log(modelsDirectory, ' file was saved!');
      response.value = true;
    }
    socketClient.emit('exportScene', response);
    if (err) {
      throw err;
    }
  });
};

function importModel(socketClient, modelName) {
  s4lAppClient.NewDocument( function(err, response) {
    let modelPath;
    switch (modelName) {
      case 'Thelonious':
        modelPath = 'D:/sparc/thelonius_reduced.smash';
        break;
      case 'Rat':
        modelPath = 'D:/sparc/ratmodel_simplified.smash';
        break;
      case 'BigRat':
        modelPath = 'D:/sparc/Rat_Male_567g_v2.0b02.sat';
        break;
      default:
        modelPath = 'D:/sparc/ratmodel_simplified.smash';
        break;
    }
    console.log('Importing', modelName);
    s4lModClient.ImportModel( modelPath, function(err2, response2) {
      console.log('Importing path', modelPath);
      s4lModClient.GetFilteredEntities(thrModelerTypes.EntityFilterType.BODY_AND_MESH, function(err3, response3) {
        console.log('Total meshes', response3.length);

        let nMeshes = response3.length;
        for (let i = 0; i <nMeshes; i++) {
          let mesh_id = response3[i].uuid;
          let mesh_name = response3[i].name;
          console.log(mesh_id);
          s4lModClient.GetEntitiesEncodedScene([mesh_id], thrModelerTypes.SceneFileFormat.GLTF, function(err4, response4) {
            let encodedScene = {
              type: 'importModelScene',
              value: response4.data,
            };
            let storeAllInServerFirst = false;
            if (storeAllInServerFirst) {
              let listOfEncodedScenes = [];
              listOfEncodedScenes.push(encodedScene);
              // socketClient.emit('importModelScene', meshEntity);
              console.log(i);
              if (i === nMeshes-1) {
                sendEncodedScenesToTheClient(socketClient, listOfEncodedScenes);
              }
            } else {
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
    data: entityMeshesScene,
  };
  s4lModClient.CreateEntitiesFromScene(myEncodedScene, function(err, response) {
    if (err) {
      console.log('Entities creation failed: ' + err);
    } else {
      s4lModClient.BooleanOperation(response, operationType, function(err2, response2) {
        if (err2) {
          console.log('Boolean operation failed: ' + err2);
        } else {
          s4lModClient.GetEntitiesEncodedScene([response2], thrModelerTypes.SceneFileFormat.GLTF, function(err3, response3) {
            if (err3) {
              console.log('Getting entities failed: ' + err3);
            } else {
              let encodedScene = {
                type: 'newBooleanOperationRequested',
                value: response3.data,
              };
              socketClient.emit('newBooleanOperationRequested', encodedScene);
            }
          });
        }
      });
    }
  });
};


console.log('server started on ' + PORT + '/app');
