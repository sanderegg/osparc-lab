
/**
 * @asset(resource/three/*)
 * @ignore(THREE)
 */

 qx.Class.define("app.components.threeView",
{
  extend: qx.ui.container.Composite,

  construct : function(width, height)
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
      this._scene.background = new THREE.Color(0xEEEEEE);

      this._camera = new THREE.PerspectiveCamera();
      this._camera.position.z = 20;
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

      var size = 20;
      var divisions = 20;
      var gridHelper = new THREE.GridHelper( size, divisions );
      this._scene.add(gridHelper);

      this._mouse = new THREE.Vector2();
      this._raycaster = new THREE.Raycaster();

      this._renderer = new THREE.WebGLRenderer();
      this._renderer.setSize(this.getWidth(), this.getHeight());
      this._camera.aspect = this.getWidth() / this.getHeight();
      this._camera.updateProjectionMatrix();
      this._renderer.setSize(this.getWidth(), this.getHeight());

      var widget = new qx.ui.core.Widget();
      this.add(widget, {flex: 1});

      widget.addListenerOnce('appear', function() {
        widget.getContentElement().getDomElement().appendChild(this._renderer.domElement);

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

    LoadDefault : function()
    {
      this.AddSphere(1, 0, 0, 0);
    },

    AddSphere : function(scale=1, transX=0, transY=0, transZ=0)
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
      mesh.name = "Default mesh";

      var transformControl = new THREE.TransformControls(this._camera, this._renderer.domElement);
      transformControl.addEventListener('change', this._updateTransformControls.bind(this));
      transformControl.setMode("translate");
      transformControl.attach(mesh);
      this._transformControls.push(transformControl);

      this._scene.add(transformControl);

      this._scene.add(mesh);
      this._meshes.push(mesh);

      // wireframe
      var geo = new THREE.WireframeGeometry( mesh.geometry );
      var mat = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 1
      });
      var wireframe = new THREE.LineSegments( geo, mat );
      mesh.add( wireframe );

      this._render();

      return mesh;
    },

    _onDocumentMouseDown : function( event ) {
      event.preventDefault();

      const highlightedColor = 0x000000;

      this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      this._raycaster.setFromCamera( this._mouse, this._camera );
      var intersects = this._raycaster.intersectObjects( this._meshes );
      if (intersects.length > 0)
      {
        if(this._intersected != null) {
          this._intersected.face.color.setHex(this._intersected.currentHex);
        }
        this._intersected = intersects[0];
        this._intersected.currentHex = this._intersected.face.color.getHex();
        this._intersected.face.color.setHex(highlightedColor);
        this._intersected.object.geometry.__dirtyColors = true;
        this._intersected.object.geometry.colorsNeedUpdate = true;
      } else {
    		if (this._intersected) {
          this._intersected.face.color.setHex(this._intersected.currentHex);
          this._intersected.object.geometry.__dirtyColors = true;
    			this._intersected.object.geometry.colorsNeedUpdate = true;
    		}
    		// remove previous intersection object reference
    		this._intersected = null;
      }
      this._render();
    }
  }
});
