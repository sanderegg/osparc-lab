/**
 * @asset(resource/three/*)
 * @ignore(THREE)
 */
 qx.Class.define("app.ui.ThreeDView",
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

    var label = new qx.ui.basic.Label("3D view (three.js)").set({
      font: new qx.bom.Font(20, ["Verdana", "sans-serif"]),
      textColor: 'black'
    });
    this.add(label);


    // initialize the script loading
    var three_path = "resource/three/three.min.js";
    var orbit_path = "resource/three/OrbitControls.js";
    var vtk_loader_path = "resource/three/VTKLoader.js";
    var dynLoader = new qx.util.DynamicScriptLoader([
      three_path,
      orbit_path,
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

        /*
        var sphere = new THREE.SphereGeometry(100);
        sphere.translate(100, 100, 100);
        var object = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( 0xff0000 ) );
        var box = new THREE.BoxHelper( object, 0xffff00 );
        this._scene.add( box );
        this._scene.add( object );
        */

        this._addSphere(1, 0, 0, 0);

        var that = this;
        var modelsToLoad = ["resource/models/bunny.vtk"];
        modelsToLoad.push("resource/models/head.vtp");
        //modelsToLoad.push("resource/models/Head_Real.vtp");
        //modelsToLoad.push("resource/models/head.vtk");
        //modelsToLoad.push("resource/models/Head_ASCII.vtk");
        //modelsToLoad.push("resource/models/HeadXMLFormat.vtr");
        //modelsToLoad.push("resource/models/HeadXMLFormat_bin.vtp");
        for (var i = 0; i < modelsToLoad.length; i++) {
          var loader = new THREE.VTKLoader();
          loader.load( modelsToLoad[i], function ( geometry ) {
            geometry.center();
            geometry.computeVertexNormals();

            var material = new THREE.MeshLambertMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
            var mesh = new THREE.Mesh( geometry, material );
            //mesh.position.set( - 0.075, 0.005, 0 );
            mesh.scale.multiplyScalar( 8 );
            that._scene.add(mesh);
            that._meshes.push(mesh);
            that._render();
          }, that);
        }

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
    _mouse: null,
    _meshes: [],

    _render : function()
    {
      this._renderer.render(this._scene, this._camera);
    },

    _updateOrbitControls : function()
    {
      this._render();
    },

    setData : function(colData, rowData)
    {
      this._clearScene();
      for (var i = 0; i < rowData.length; i++) {
        this._addSphere(1, rowData[i][0], rowData[i][1], rowData[i][2]);
      }
    },

    _clearScene : function()
    {
      var i = this._meshes.length;
      while(i--) {
        this._scene.remove(this._meshes[i]);
      }
      this._render();
    },

    _addSphere : function(scale=1, transX=0, transY=0, transZ=0)
    {
      var geometry = new THREE.SphereGeometry(scale, 32, 16);
      geometry.translate(transX, transY, transZ);
      var material = new THREE.MeshPhongMaterial({
        wireframe: true,
        wireframeLinewidth: 3,
        color: 0xFF0000
      });
      var mesh = new THREE.Mesh(geometry, material);
      this._scene.add(mesh);
      this._meshes.push(mesh);
      this._render();
    },

    _onDocumentMouseDown : function( event ) {
      event.preventDefault();

      //this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      //this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			this._mouse.x = ( event.clientX / this._renderer.domElement.clientWidth ) * 2 - 1;
			this._mouse.y = - ( event.clientY / this._renderer.domElement.clientHeight ) * 2 + 1;
      this._mouse.x = this._mouse.x - 2;
      this._mouse.y = this._mouse.y * 0.96 + 0.05;

      this._raycaster.setFromCamera( this._mouse, this._camera );
      var intersects = this._raycaster.intersectObjects( this._meshes );
      if ( intersects.length > 0 ) {
        console.log('In');
      } else {
        console.log('Out');
      }
    }
  }
});
