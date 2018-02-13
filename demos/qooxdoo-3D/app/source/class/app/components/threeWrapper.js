/**
 * @asset(resource/three/*)
 * @ignore(THREE)
 */

qx.Class.define("app.components.threeWrapper",
{
  extend : qx.ui.core.Widget,

  construct : function()
  {
    // initialize the script loading
    var three_path = "resource/three/three.min.js";
    var orbit_path = "resource/three/OrbitControls.js";
    var transform_path = "resource/three/TransformControls.js";
    var loader_path = "resource/three/OBJLoader.js";
    var loaderSupp_path = "resource/three/LoaderSupport.js";
    var loader2_path = "resource/three/OBJLoader2.js";
    var exporter_path = "resource/three/OBJExporter.js";
    var vtk_loader_path = "resource/three/VTKLoader.js";
    var dynLoader = new qx.util.DynamicScriptLoader([
      three_path,
      orbit_path,
      transform_path,
      loader_path,
      loaderSupp_path,
      loader2_path,
      exporter_path,
      vtk_loader_path
    ]);

    dynLoader.addListenerOnce('ready', function(e) {
      console.log(three_path + " loaded");

      this._scene = new THREE.Scene();

      this._camera = new THREE.PerspectiveCamera();
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

  events: {
    "ThreeLibReady": "qx.event.type.Data",
    "MeshToBeAdded": "qx.event.type.Data",
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

    AddObjectToScene : function(objToScene)
    {
      this._scene.add(objToScene);
      this.Render();
    },

    ImportMeshFromPath : function(models_path, model_name)
    {
      var loader = new THREE.OBJLoader();
      var scope = this;
      loader.load( models_path + model_name, function (object) {
        object.traverse( function ( child ) {
          if ( child instanceof THREE.Mesh ) {
            var material = scope.CreateNewMaterial();
            child.material = material;
            child.name = model_name;
            scope.fireDataEvent("MeshToBeAdded", child);
          }
        });
      //}, onProgress, onError );
      });
    },

    ImportMeshFromBuffer : function(model_buffer, model_name)
    {
      /*
      var objLoader2 = new THREE.OBJLoader2();
      var local = new THREE.Object3D();
      local.add( objLoader2.parse( model_buffer ) );
      local.name = model_name;
      var material = this.CreateNewMaterial();
      local.material = material;
      this.fireDataEvent("MeshToBeAdded", local);
      */

      var objLoader = new THREE.OBJLoader();
      var myObj = objLoader.parse(model_buffer);
      var scope = this;
      myObj.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          var material = scope.CreateNewMaterial();
          child.material = material;
          child.name = model_name;
          scope.fireDataEvent("MeshToBeAdded", child);
        }
      });
    },

    ExportMesh : function (mesh)
    {
      // https://stackoverflow.com/questions/28736104/three-js-how-to-deserialize-geometry-tojson-where-is-geometry-fromjson

      var exporter = new THREE.OBJExporter();
      var mesh_to_export = exporter.parse(mesh);
      return mesh_to_export;

      /*
      var serializedGeometry = this._meshes[i].geometry.toJSON();
      var serializedMaterial = this._meshes[i].material.toJSON();
      console.log(serializedGeometry);
      console.log(serializedMaterial);
      var jsonLoader = new THREE.JSONLoader();
      var result1 = jsonLoader.parse(serializedGeometry.data);
      var result2 = jsonLoader.parse(serializedMaterial.data);
      var geo_copy = result1.geometry;
      var mat_copy = result2.material;
      geo_copy.uuid = "00000000-0000-0000-0000-000000" + Math.floor((Math.random() * 100000)).toString();
      mat_copy.uuid = "00000000-0000-0000-0000-000000" + Math.floor((Math.random() * 100000)).toString();
      var mesh_copy = new THREE.Mesh(geo_copy, mat_copy);
      mesh_copy.uuid = "00000000-0000-0000-0000-000000" + Math.floor((Math.random() * 100000)).toString();

      mesh_copy.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
              child.material = mat_copy;
          }
      });

      this.AddMeshToScene(mesh_copy);
      */
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

    IntersectMeshes : function(meshes, posX, posY)
    {
      this._mouse.x = posX;
      this._mouse.y = posY;
      this._raycaster.setFromCamera( this._mouse, this._camera );
      var intersects = this._raycaster.intersectObjects( meshes );
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
      });
      material.vertexColors = THREE.FaceColors;

      return material;
    },

    CreateMesh : function(geometry, material)
    {
      var mesh = new THREE.Mesh(geometry, material);
      return mesh;
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
      this._scene.add(pointLight);
    },

    _addPointLight2 : function()
    {
      var pointLight2 = new THREE.PointLight(0xFFFFFF);
      pointLight2.position.x = 10;
      pointLight2.position.y = -10;
      pointLight2.position.z = -40;
      this._scene.add(pointLight2);
    },

    _addGridHelper : function()
    {
      const grid_size = 20;
      const grid_divisions = 20;
      const center_line = new THREE.Color(0x666666);
      const grid_color = new THREE.Color(0x555555);
      var gridHelper = new THREE.GridHelper( grid_size, grid_divisions, center_line, grid_color );
      this._scene.add(gridHelper);
    },

    _addAxesHelper : function()
    {
      // axes
      var axes = new THREE.AxesHelper(1);
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
