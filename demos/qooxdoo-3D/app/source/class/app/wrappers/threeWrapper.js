/**
 * @asset(resource/three/*)
 * @ignore(THREE)
 */

qx.Class.define("app.wrappers.threeWrapper",
{
  extend: qx.core.Object,

  construct : function()
  {
    // initialize the script loading
    var three_path = "resource/three/three.min.js";
    var orbit_path = "resource/three/OrbitControls.js";
    var transform_path = "resource/three/TransformControls.js";
    var obj_loader_path = "resource/three/OBJLoader.js";
    var obj_exporter_path = "resource/three/OBJExporter.js";
    var gltf_loader_path = "resource/three/GLTFLoader.js";
    var gltf_exporter_path = "resource/three/GLTFExporter.js";
    var vtk_loader_path = "resource/three/VTKLoader.js";
    var dynLoader = new qx.util.DynamicScriptLoader([
      three_path,
      orbit_path,
      transform_path,
      obj_loader_path,
      obj_exporter_path,
      gltf_loader_path,
      gltf_exporter_path,
      vtk_loader_path
    ]);

    dynLoader.addListenerOnce('ready', function(e) {
      console.log(three_path + " loaded");
      this.setLibReady(true);

      this._scene = new THREE.Scene();

      this._camera = new THREE.PerspectiveCamera();
      this._camera.far = 10000;
      this._camera.up.set(0,0,1);
      this._scene.add(this._camera);

      this._addPointLight1();
      this._addPointLight2();
      this._addGridHelper();
      this._addAxesHelper();

      this._mouse = new THREE.Vector2();
      this._raycaster = new THREE.Raycaster();

      this._renderer = new THREE.WebGLRenderer();

      this._addOrbitControls();
      this.Render();

      this.fireDataEvent("ThreeLibReady", true);
    }, this);

    dynLoader.addListener('failed', function(e) {
      var data = e.getData();
      console.log("failed to load " + data.script);
      this.fireDataEvent("ThreeLibReady", false);
    }, this);

    dynLoader.start();
  },

  properties: {
    libReady: {
      nullable: false,
      init: false,
      check: "Boolean",
    },
  },

  events: {
    "ThreeLibReady": "qx.event.type.Data",
    "EntityToBeAdded": "qx.event.type.Data",
    "sceneToBeExported": "qx.event.type.Data",
  },

  members: {
    _scene: null,
    _camera: null,
    _raycaster: null,
    _renderer: null,
    _orbitControls: null,
    _mouse: null,

    GetDomElement : function()
    {
      return this._renderer.domElement;
    },

    Render : function()
    {
      this._renderer.render(this._scene, this._camera);
    },

    AddEntityToScene : function(objToScene)
    {
      this._scene.add(objToScene);
      this.Render();
    },

    ImportEntityFromBuffer : function(model_buffer, model_name)
    {
      // https://threejs.org/docs/#api/loaders/MaterialLoader
      // Have a look at this to load materials together with geometry.
      //Could be stored in userData{}

      var objLoader = new THREE.OBJLoader();
      var myObj = objLoader.parse(model_buffer);

      var scope = this;
      myObj.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {

          // entity is black
          // https://github.com/expo/expo-three/issues/5#issuecomment-360956203
          var material = scope.CreateNewMaterial();
          child.material = material;
          child.name = model_name;

          child.geometry.__dirtyColors = true;
          child.geometry.colorsNeedUpdate = true;
          child.geometry.dynamic = true;

          scope.fireDataEvent("EntityToBeAdded", child);
        }
      });
    },

    ExportEntity : function (entity)
    {
      // https://stackoverflow.com/questions/28736104/three-js-how-to-deserialize-geometry-tojson-where-is-geometry-fromjson

      var exporter = new THREE.OBJExporter();
      var entity_to_export = exporter.parse(entity);
      return entity_to_export;
    },

    ImportSceneFromBuffer : function(model_buffer)
    {
      var scope = this;
      var glTFLoader = new THREE.GLTFLoader();
      glTFLoader.parse(model_buffer, null, function( myScene ) {
        scope._scene.add(myScene.scene);
        scope.Render();
      });
    },

    ExportScene : function ()
    {
      var options = {
        binary: false,
      };

      var scope = this;
      var glTFExporter = new THREE.GLTFExporter();
      glTFExporter.parse( this._scene, function ( gltf ) {
        scope.fireDataEvent("sceneToBeExported", gltf);
      }, options );
    },

    RemoveFromScene : function(objFromScene)
    {
      var index = this._scene.children.indexOf(objFromScene);
      if (index >= 0) {
        this._scene.remove(this._scene.children[index]);
        return true;
      }
      return false;
    },

    RemoveFromSceneById : function(uuid)
    {
      var objInScene = this.GetFromScene(uuid);
      if (objInScene) {
        return this.RemoveFromScene(objInScene);
      }
      return false;
    },

    GetFromScene : function(uuid)
    {
      for (var i = 0; i < this._scene.children.length; i++) {
        if (this._scene.children[i].uuid === uuid) {
          return this._scene.children[i];
        }
      }
      return null;
    },

    IntersectEntities : function(entities, posX, posY)
    {
      this._mouse.x = posX;
      this._mouse.y = posY;
      this._raycaster.setFromCamera( this._mouse, this._camera );
      var intersects = this._raycaster.intersectObjects( entities );
      return intersects;
    },

    SetBackgroundColor : function(backgroundColor)
    {
      this._scene.background = new THREE.Color(backgroundColor);
    },

    SetCameraPosition : function(x = 0, y = 0, z = 0)
    {
      this._camera.position.x = x;
      this._camera.position.y = y;
      this._camera.position.z = z;
    },

    SetSize : function(width, height)
    {
      this._renderer.setSize(width, height);
      this._camera.aspect = width / height;
      this._camera.updateProjectionMatrix();
      this._renderer.setSize(width, height);
    },

    CreateNewMaterial : function()
    {
      //var randColor = qx.util.ColorUtil.randomColor();
      var rCh = Math.floor((Math.random() * 170) + 80);
      var gCh = Math.floor((Math.random() * 170) + 80);
      var bCh = Math.floor((Math.random() * 170) + 80);
      var randColor = 'rgb('+rCh+','+gCh+','+bCh+')';

      var material = new THREE.MeshPhongMaterial({
        color: randColor,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        transparent: true,
        opacity: 0.6,
        vertexColors: THREE.FaceColors,
      });

      return material;
    },

    CreateEntity : function(geometry, material)
    {
      var entity = new THREE.Mesh(geometry, material);
      return entity;
    },

    CreateWireframeFromGeometry : function(geometry)
    {
      var geo = new THREE.WireframeGeometry( geometry );
      var mat = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 1
      });
      var wireframe = new THREE.LineSegments( geo, mat );
      wireframe.name = "wireframe";

      return wireframe;
    },

    CreateSphere : function(scale=3, transX=0, transY=0, transZ=0)
    {
      var geometry = new THREE.SphereGeometry(scale, 32, 16);
      geometry.translate(transX, transY, transZ);
      return geometry;
    },

    CreateBox : function(scale=3, transX=0, transY=0, transZ=0)
    {
      var geometry = new THREE.BoxGeometry(scale, scale, scale, 4, 4, 4);
      geometry.translate(transX, transY, transZ);
      return geometry;
    },

    CreateDodecahedron : function(scale=3, transX=0, transY=0, transZ=0)
    {
      var geometry = new THREE.DodecahedronGeometry(scale);
      geometry.translate(transX, transY, transZ);
      return geometry;
    },

    CreateInvisiblePlane : function()
    {
      var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0x248f24,
          alphaTest: 0,
          visible: false
        }
      ));
      return plane;
    },

    CreateTransformControls : function()
    {
      return (new THREE.TransformControls(this._camera, this._renderer.domElement));
    },

    _addPointLight1 : function()
    {
      var pointLight = new THREE.PointLight(0xBBBBBB);
      pointLight.position.x = -10;
      pointLight.position.y = 10;
      pointLight.position.z = 40;
      pointLight.name = "PointLight1";
      this._scene.add(pointLight);
    },

    _addPointLight2 : function()
    {
      var pointLight2 = new THREE.PointLight(0xFFFFFF);
      pointLight2.position.x = 10;
      pointLight2.position.y = -10;
      pointLight2.position.z = -40;
      pointLight2.name = "PointLight2";
      this._scene.add(pointLight2);
    },

    _addGridHelper : function()
    {
      const grid_size = 20;
      const grid_divisions = 20;
      const center_line = new THREE.Color(0x666666);
      const grid_color = new THREE.Color(0x555555);
      var gridHelper = new THREE.GridHelper( grid_size, grid_divisions, center_line, grid_color );
      gridHelper.geometry.rotateX( Math.PI / 2 );
      var vector = new THREE.Vector3( 0, 0, 1 );
      gridHelper.lookAt( vector );
      gridHelper.name = "GridHelper";
      this._scene.add(gridHelper);
    },

    _addAxesHelper : function()
    {
      var axes = new THREE.AxesHelper(1);
      axes.name = "AxesHelper";
      this._scene.add(axes);
    },

    _addOrbitControls : function()
    {
      this._orbitControls = new THREE.OrbitControls(this._camera, this._renderer.domElement);
      this._orbitControls.addEventListener('change', this._updateOrbitControls.bind(this));
      this._orbitControls.update();
    },

    _updateOrbitControls : function()
    {
      this.Render();
    },
  }
});
