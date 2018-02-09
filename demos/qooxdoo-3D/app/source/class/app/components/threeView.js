
/**
 * @asset(resource/three/*)
 * @ignore(THREE)
 */

 qx.Class.define("app.components.threeView",
{
  extend: qx.ui.container.Composite,

  construct : function(width, height, backgroundColor)
  {
    this.base(arguments);
    this.set({
      width: width,
      height: height
    });

    this.setLibReady(false);

    var box = new qx.ui.layout.VBox();
    box.set({
      spacing: 10,
      alignX: "center",
      alignY: "middle"
    });

    this.set({
      layout: box
    });


    // initialize the script loading
    var three_path = "resource/three/three.min.js";
    var orbit_path = "resource/three/OrbitControls.js";
    var transform_path = "resource/three/TransformControls.js";
    var loader_path = "resource/three/OBJLoader.js";
    var exporter_path = "resource/three/OBJExporter.js";
    var vtk_loader_path = "resource/three/VTKLoader.js";
    var dynLoader = new qx.util.DynamicScriptLoader([
      three_path,
      orbit_path,
      transform_path,
      loader_path,
      exporter_path,
      vtk_loader_path
    ]);

    dynLoader.addListenerOnce('ready', function(e) {
      console.log(three_path + " loaded");
      this.setLibReady(true);

      this._scene = new THREE.Scene();
      this._scene.background = new THREE.Color(backgroundColor);

      this._camera = new THREE.PerspectiveCamera();
      this._camera.position.x = 18;
      this._camera.position.z = 25;
      this._scene.add(this._camera);

      var pointLight = new THREE.PointLight(0xBBBBBB);
      pointLight.position.x = -10;
      pointLight.position.y = 10;
      pointLight.position.z = 40;
      this._scene.add(pointLight);

      var pointLight2 = new THREE.PointLight(0xFFFFFF);
      pointLight2.position.x = 10;
      pointLight2.position.y = -10;
      pointLight2.position.z = -40;
      this._scene.add(pointLight2);

      // grid
      const grid_size = 20;
      const grid_divisions = 20;
      const center_line = new THREE.Color(0x666666);
      const grid_color = new THREE.Color(0x555555);
      var gridHelper = new THREE.GridHelper( grid_size, grid_divisions, center_line, grid_color );
      this._scene.add(gridHelper);

      // axes
      var axes = new THREE.AxesHelper(1);
      this._scene.add(axes);

      this._mouse = new THREE.Vector2();
      this._raycaster = new THREE.Raycaster();

      this._renderer = new THREE.WebGLRenderer();
      this._renderer.setSize(this.getWidth(), this.getHeight());
      this._camera.aspect = this.getWidth() / this.getHeight();
      this._camera.updateProjectionMatrix();
      this._renderer.setSize(this.getWidth(), this.getHeight());

      this._threeDViewer = new qx.ui.core.Widget();
      this.add(this._threeDViewer, {flex: 1});

      this._threeDViewer.addListenerOnce('appear', function() {
        this._threeDViewer.getContentElement().getDomElement().appendChild(this._renderer.domElement);

        this._orbitControls = new THREE.OrbitControls(this._camera, this._renderer.domElement);
        this._orbitControls.addEventListener('change', this._updateOrbitControls.bind(this));
        this._orbitControls.update();

        document.addEventListener( 'mousedown', this._onDocumentMouseDown.bind(this), false );

        this._render();
      }, this);

    }, this);

    dynLoader.addListener('failed', function(e) {
      var data = e.getData();
      console.log("failed to load " + data.script);
    }, this);

    dynLoader.start();
  },

  properties: {
    LibReady: { check: "Boolean" }
  },

  events : {
    "entitySelected": "qx.event.type.Data",
    "entityAdded": "qx.event.type.Data",
    "entityRemoved": "qx.event.type.Data",
  },

  members: {
    _threeDViewer: null,
    _scene: null,
    _camera: null,
    _raycaster: null,
    _renderer: null,
    _orbitControls: null,
    _transformControls: [],
    _mouse: null,
    _meshes: [],
    _intersected: null,
    _selectionMode: 0,

    _render : function()
    {
      this._renderer.render(this._scene, this._camera);
    },

    _updateOrbitControls : function()
    {
      this._render();
    },

    _updateTransformControls : function()
    {
      for (var i = 0; i < this._transformControls.length; i++) {
        this._transformControls[i].update();
      }
      this._render();
    },

    _onDocumentMouseDown : function( event ) {
      event.preventDefault();
      if (this._selectionMode === 0 ||
        //hacky
        event.target.nodeName != 'CANVAS') {
        //this.fireDataEvent("entitySelected", null);
        return;
      }

      const highlightedColor = 0x000000;

      this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      this._raycaster.setFromCamera( this._mouse, this._camera );
      var intersects = this._raycaster.intersectObjects( this._meshes );
      if (intersects.length > 0)
      {
        if(this._intersected != null) {
          if (this._selectionMode === 1) {
            this._intersected.object.material.opacity = 0.6;
          } else if (this._selectionMode === 2) {
            this._intersected.face.color.setHex(this._intersected.currentHex);
          }
        }
        this._intersected = intersects[0];

        if (this._selectionMode === 1) {
          this.fireDataEvent("entitySelected", this._intersected.object.uuid);
          this._intersected.currentHex = this._intersected.object.material.color.getHex();
          this._intersected.object.material.opacity = 0.9;
        } else if (this._selectionMode === 2) {
          this.fireDataEvent("entitySelected", null);
          this._intersected.currentHex = this._intersected.face.color.getHex();
          this._intersected.face.color.setHex(highlightedColor);
        }

        this._intersected.object.geometry.__dirtyColors = true;
        this._intersected.object.geometry.colorsNeedUpdate = true;
      } else {
    		if (this._intersected) {
          this.fireDataEvent("entitySelected", null);
          if (this._selectionMode === 1) {
            this._intersected.object.material.opacity = 0.6;
          } else if (this._selectionMode === 2) {
            this._intersected.face.color.setHex(this._intersected.currentHex);
          }
          this._intersected.object.geometry.__dirtyColors = true;
          this._intersected.object.geometry.colorsNeedUpdate = true;
    		}
    		// remove previous intersection object reference
    		this._intersected = null;
      }

      this._render();
    },

    LoadDefault : function()
    {
      this.AddSphere(1, 0, 0, 0);
    },

    AddMeshToScene : function(mesh)
    {
      this._scene.add(mesh);
      this._meshes.push(mesh);
      this.fireDataEvent("entityAdded", [mesh.uuid, mesh.name]);
      this._render();
    },

    AddObject : function(objType = "Sphere", scale = 1)
    {
      var geometry;

      switch (objType) {
        case "Sphere":
          geometry = this.AddSphere(scale);
          break;
        case "Box":
          geometry = this.AddBox(scale);
          break;
        case "Dodecahedron":
          geometry = this.AddDodecahedron(scale);
          break;
        default:
          break;
      }

      if (geometry) {
        // mesh
        var material = new THREE.MeshPhongMaterial({
          color: qx.util.ColorUtil.randomColor(),
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
          transparent: true,
          opacity: 0.6,
        });
        material.vertexColors = THREE.FaceColors;

        var mesh = new THREE.Mesh(geometry, material);
        mesh.name = objType;

        this.AddMeshToScene(mesh);

        return mesh;
      } else {
        console.log(name, " not implemented yet");
      }
    },

    AddSphere : function(scale=3, transX=0, transY=0, transZ=0)
    {
      var geometry = new THREE.SphereGeometry(scale, 32, 16);
      geometry.translate(transX, transY, transZ);
      return geometry;
    },

    AddBox : function(scale=3, transX=0, transY=0, transZ=0)
    {
      var geometry = new THREE.BoxGeometry(scale, scale, scale, 4, 4, 4);
      geometry.translate(transX, transY, transZ);
      return geometry;
    },

    AddDodecahedron : function(scale=3, transX=0, transY=0, transZ=0)
    {
      var geometry = new THREE.DodecahedronGeometry(scale);
      geometry.translate(transX, transY, transZ);
      return geometry;
    },

    RemoveAll : function()
    {
      for (var i = this._meshes.length-1; i >= 0 ; i--) {
        this.RemoveObject(this._meshes[i].uuid);
      }
    },

    RemoveObject : function(uuid)
    {
      for (var i = 0; i < this._scene.children.length; i++) {
        if (this._scene.children[i].uuid === uuid) {
          this._scene.remove(this._scene.children[i]);
          break;
        }
      }

      for (var i = 0; i < this._meshes.length; i++) {
        if (this._meshes[i].uuid === uuid) {
          if (i > -1) {
            var el = this._meshes.splice(i, 1);
            //delete el;
          }
          break;
        }
      }

      this.fireDataEvent("entityRemoved", uuid);

      this._render();
    },

    StartMoveTool : function( selObjId )
    {
      for (var i = 0; i < this._meshes.length; i++) {
        if (this._meshes[i].uuid === selObjId) {
          var transformControl = new THREE.TransformControls(this._camera, this._renderer.domElement);
          transformControl.addEventListener('change', this._updateTransformControls.bind(this));
          transformControl.setMode("translate");
          transformControl.attach(this._meshes[i]);
          this._transformControls.push(transformControl);
          this._scene.add(transformControl);
        }
      }
      this._render();
    },

    StopMoveTool : function()
    {
      for (var i = 0; i < this._transformControls.length; i++) {
        var index = this._scene.children.indexOf(this._transformControls[i]);
        if (index >= 0) {
          this._scene.remove(this._scene.children[index]);
          this._transformControls[i].detach();
        }
      }
      this._transformControls = [];
      this._render();
    },

    SetSelectionMode : function( mode )
    {
      if (mode === 2) {
        this._showEdges(true);
        this._highlightAll();
      } else {
        this._showEdges(false);
        this._unhighlightAll();
      }

      this._selectionMode = mode;
      this.StopMoveTool();
      this._render();
    },

    _highlightAll : function()
    {
      for (var i = 0; i < this._meshes.length; i++) {
        this._meshes[i].material.opacity = 0.9;
      }
    },

    _unhighlightAll : function()
    {
      for (var i = 0; i < this._meshes.length; i++) {
        this._meshes[i].material.opacity = 0.6;
      }
    },

    HighlightObject : function( id )
    {
      this._unhighlightAll();
      for (var i = 0; i < this._meshes.length; i++) {
        if (this._meshes[i].uuid === id) {
          this._meshes[i].material.opacity = 0.9;
        }
      }
      this._render();
    },

    _showEdges : function( show_edges )
    {
      if (show_edges) {
        for (var i = 0; i < this._meshes.length; i++) {
          var geo = new THREE.WireframeGeometry( this._meshes[i].geometry );
          var mat = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1
          });
          var wireframe = new THREE.LineSegments( geo, mat );
          wireframe.name = "wireframe";
          this._meshes[i].add( wireframe );
        }
      } else {
        for (var i = 0; i < this._meshes.length; i++) {
          var wireObj = this._meshes[i].getObjectByName("wireframe");
          if (wireObj) {
            this._meshes[i].remove(wireObj);
          }
        }
      }
      this._render();
    },

    LoadMesh : function (model_name)
    {
      var loader = new THREE.OBJLoader();
      var that = this;
      loader.load( 'resource/models/'+model_name, function (object) {
        object.traverse( function ( child ) {
          if ( child instanceof THREE.Mesh ) {
            //child.material.map = texture;
            var material = new THREE.MeshPhongMaterial({
              color: qx.util.ColorUtil.randomColor(),
              polygonOffset: true,
              polygonOffsetFactor: 1,
              polygonOffsetUnits: 1,
              transparent: true,
              opacity: 0.6,
            });
            material.vertexColors = THREE.FaceColors;

            //child.material = material;
            //that.AddMeshToScene(child);

            var newMesh = new THREE.Mesh(child.geometry, material);
            newMesh.name = model_name;

            that.AddMeshToScene(newMesh);
          }
        });
      //}, onProgress, onError );
      }, that );
    },

    SerializeMeshes : function()
    {
      // https://stackoverflow.com/questions/28736104/three-js-how-to-deserialize-geometry-tojson-where-is-geometry-fromjson
      for (var i = 0; i < this._meshes.length; i++) {
        //var mesh_copy = this.CloneMesh(this._meshes[i]);

        var exporter = new THREE.OBJExporter();
        var mesh_to_export = exporter.parse(this._meshes[i]);
        console.log(mesh_to_export);
        var mesh_name = 'model_' + i.toString() + '.obj';
        //this._saveString(mesh_to_export, mesh_name);

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
      }
    },
  }
});
