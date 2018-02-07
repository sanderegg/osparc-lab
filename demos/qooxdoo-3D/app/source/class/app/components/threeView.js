
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
    var vtk_loader_path = "resource/three/VTKLoader.js";
    var dynLoader = new qx.util.DynamicScriptLoader([
      three_path,
      orbit_path,
      transform_path,
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
      if (this._selectionMode === 0) {
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
            this._intersected.object.material.color.setHex(this._intersected.currentHex);
          } else if (this._selectionMode === 2) {
            this._intersected.face.color.setHex(this._intersected.currentHex);
          }
        }
        this._intersected = intersects[0];

        if (this._selectionMode === 1) {
          this.fireDataEvent("entitySelected", this._intersected.object.uuid);
          this._intersected.currentHex = this._intersected.object.material.color.getHex();
          this._intersected.object.material.color.setHex(highlightedColor);
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
            this._intersected.object.material.color.setHex(this._intersected.currentHex);
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

    AddSphere : function(name="Sphere", scale=1, transX=0, transY=0, transZ=0)
    {
      var geometry = new THREE.SphereGeometry(scale, 32, 16);
      geometry.translate(transX, transY, transZ);

      // mesh
      var material = new THREE.MeshPhongMaterial({
        color: qx.util.ColorUtil.randomColor(),
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
      });
      material.vertexColors = THREE.FaceColors;

      var mesh = new THREE.Mesh(geometry, material);
      mesh.name = "Sphere";

      var transformControl = new THREE.TransformControls(this._camera, this._renderer.domElement);
      transformControl.addEventListener('change', this._updateTransformControls.bind(this));
      transformControl.setMode("translate");
      transformControl.attach(mesh);
      this._transformControls.push(transformControl);

      this._scene.add(transformControl);

      this._scene.add(mesh);
      this._meshes.push(mesh);

      this._render();

      return mesh;
    },

    AddBlock : function(name="Block", scale=1, transX=0, transY=0, transZ=0)
    {
      var geometry = new THREE.BoxGeometry(scale, scale, scale, 4, 4, 4);
      geometry.translate(transX, transY, transZ);

      // mesh
      var material = new THREE.MeshPhongMaterial({
        color: qx.util.ColorUtil.randomColor(),
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
      });
      material.vertexColors = THREE.FaceColors;

      var mesh = new THREE.Mesh(geometry, material);
      mesh.name = "Block";

      var transformControl = new THREE.TransformControls(this._camera, this._renderer.domElement);
      transformControl.addEventListener('change', this._updateTransformControls.bind(this));
      transformControl.setMode("translate");
      transformControl.attach(mesh);
      this._transformControls.push(transformControl);

      this._scene.add(transformControl);

      this._scene.add(mesh);
      this._meshes.push(mesh);

      this._render();

      return mesh;
    },

    SetSelectionMode : function( mode ) {
      this._showEdges(mode === 2);
      this._selectionMode = mode;
    },

    _showEdges : function( show_edges ) {
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
  }
});
