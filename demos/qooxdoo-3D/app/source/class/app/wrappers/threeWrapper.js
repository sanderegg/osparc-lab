/**
 * @asset(three/*)
 * @ignore(THREE)
 */

qx.Class.define("app.wrappers.threeWrapper",
{
  extend: qx.core.Object,

  construct : function()
  {
    // initialize the script loading
    var three_path = "three/three.min.js";
    var orbit_path = "three/OrbitControls.js";
    var transform_path = "three/TransformControls.js";
    var obj_loader_path = "three/OBJLoader.js";
    var obj_exporter_path = "three/OBJExporter.js";
    var gltf_loader_path = "three/GLTFLoader.js";
    var gltf_exporter_path = "three/GLTFExporter.js";
    var vtk_loader_path = "three/VTKLoader.js";
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

      this._addCameraLight();
      //this._addPointLight1();
      //this._addPointLight2();
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

    CreateNewPlaneMaterial : function(red, green, blue)
    {
      var material = new THREE.MeshPhongMaterial({
        color: Math.random() * 0xffffff,
        side: THREE.DoubleSide
      });
      return material;
    },

    CreateNewMaterial : function(red, green, blue)
    {
      var color;
      if ( red === undefined || green === undefined || blue === undefined ) {
        color = this._randomRGBColor();
      } else {
        color = 'rgb('+Math.round(255*red)+','+Math.round(255*green)+','+Math.round(255*blue)+')';
      }

      var material = new THREE.MeshPhongMaterial({
        color: color,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        transparent: true,
        opacity: 0.6,
        vertexColors: THREE.FaceColors,
      });
      return material;
    },

    _randomRGBColor : function()
    {
      return Math.random() * 0xffffff;

      var color;
      var rCh = Math.floor((Math.random() * 170) + 80);
      var gCh = Math.floor((Math.random() * 170) + 80);
      var bCh = Math.floor((Math.random() * 170) + 80);
      color = 'rgb('+rCh+','+gCh+','+bCh+')';
      return color;
    },

    CreateMeshNormalMaterial : function()
    {
      var material = new THREE.MeshNormalMaterial();
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

    CreateSphere : function(radius, center, widthSegments=32, heightSegments=16)
    {
      var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
      return geometry;
    },

    CreatePoint : function(position)
    {
      var sphere_geo = this.CreateSphere(0.07, position, 8, 8);
      var sphere = new THREE.Mesh(sphere_geo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      sphere.position.x = position.x;
      sphere.position.y = position.y;
      sphere.position.z = position.z;
      return sphere;
      /*
      var starsGeometry = new THREE.Geometry();
      for ( var i = 0; i < 2; i ++ ) {
        var pos = new THREE.Vector3();
        pos.x = position.x + i;
        pos.y = position.y + i;
        pos.z = position.z + i;
        starsGeometry.vertices.push( pos );
      }
      var starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        //sizeAttenuation: false,
        //size: 0.5
      });
      var sphere = new THREE.Points( starsGeometry, starsMaterial );
      return sphere;
      */
      /*
      var geometry = new THREE.BufferGeometry();
      geometry.addAttribute( 'position', position ) );
      geometry.addAttribute( 'color', 0xff0000 );
      geometry.computeBoundingSphere();
      var material = new THREE.PointsMaterial( { size: 15, vertexColors: THREE.VertexColors } );
      var point = new THREE.Points( geometry, material );
      return point;
      */
    },

    CreateBox : function(point0, point1, point2)
    {
      if ( point2 === undefined ) {
        var width = Math.abs(point1.x - point0.x);
        var height = Math.abs(point1.y - point0.y);
        var depth = 0;
        var geometry = new THREE.PlaneGeometry( width, height );
        return geometry;
      } else {
        var width = Math.abs(point1.x - point0.x);
        var height = Math.abs(point1.y - point0.y);
        var depth = Math.abs(point2.z - point1.z);
        var geometry = new THREE.BoxGeometry(width, height, depth);
        return geometry;
      }
    },

    CreateCylinder : function(radius, height)
    {
      if ( height === undefined ) {
        var geometry = new THREE.CircleGeometry( radius, 32 );
        return geometry;
      } else {
        var geometry = new THREE.CylinderGeometry(radius, radius, height, 16);
        return geometry;
      }
    },

    CreateDodecahedron : function(radius)
    {
      var geometry = new THREE.DodecahedronGeometry(radius);
      return geometry;
    },

    CreateSpline : function(listOfPoints)
    {
      var curve_points = this._arrayToThreePoints(listOfPoints);
      var curve = new THREE.CatmullRomCurve3(curve_points);
      var points = curve.getPoints( listOfPoints.length * 10 );
      return this.CreateLine(points);
    },

    FromEntityMeshToEntity : function(entityMesh)
    {
      var geom = new THREE.Geometry();
      for (var i = 0; i < entityMesh.vertices.length; i+=3) {
        var v1 = new THREE.Vector3( entityMesh.vertices[i+0], entityMesh.vertices[i+1], entityMesh.vertices[i+2] );
        geom.vertices.push(v1);
      }
      for (var i = 0; i < entityMesh.triangles.length; i+=3) {
        geom.faces.push( new THREE.Face3( entityMesh.triangles[i+0], entityMesh.triangles[i+1], entityMesh.triangles[i+2] ) );
      }

      geom.computeFaceNormals();
      const applySmoothing = true;
      if (applySmoothing) {
        geom.mergeVertices();
        geom.computeVertexNormals();
      }

      return geom;
    },

    FromEntityToEntityMesh : function(entity)
    {
      var i, j, m = 0;
      var myVertices = [];
      if (entity.geometry.vertices) {
        // Geometries
        for ( i = 0; i < entity.geometry.vertices.length; i++ ) {
          myVertices.push(entity.geometry.vertices[i].x);
          myVertices.push(entity.geometry.vertices[i].y);
          myVertices.push(entity.geometry.vertices[i].z);
        }
      } else {
        // BufferGeometries
        var vertices = entity.geometry.getAttribute('position');
        var vertex = new THREE.Vector3();
        for ( i = 0; i < vertices.count; i++ ) {
          vertex.x = vertices.getX( i );
          vertex.y = vertices.getY( i );
          vertex.z = vertices.getZ( i );

          //// transfrom the vertex to world space
          //vertex.applyMatrix4( entity.matrixWorld );

          myVertices.push(vertex.x);
          myVertices.push(vertex.y);
          myVertices.push(vertex.z);
        }
      }

      var myFaces = [];
      if (entity.geometry.faces) {
        // Geometries
        for ( i = 0; i < entity.geometry.faces.length; i++ ) {
          myFaces.push(entity.geometry.faces[i].a);
          myFaces.push(entity.geometry.faces[i].b);
          myFaces.push(entity.geometry.faces[i].c);
        }
      } else {
        // BufferGeometries
        for ( i = 0; i < vertices.count; i += 3 ) {
          for ( m = 0; m < 3; m ++ ) {
            j = i + m + 1;
            //j = i + m;
            myFaces.push(j);
          }
        }
      }

      var entityMesh = {
        vertices: myVertices,
        triangles: myFaces,
        normals: [],
        transform4x4: entity.matrix.elements,
        material: null,
        lines: [],
        points: [],
      };

      console.log(entityMesh.vertices);
      console.log(entityMesh.triangles);
      console.log(entityMesh.transform4x4);

      return entityMesh;
    },

    ApplyTransformationMatrixToEntity : function(entity, transformation)
    {
      entity.matrixAutoUpdate = false;

      var quaternion = new THREE.Matrix4();
      quaternion.elements = transformation;
      entity.matrix.fromArray(transformation);
    },

    _arrayToThreePoints : function(listOfPoints)
    {
      var three_points = [];
      for (var i = 0; i < listOfPoints.length; i++) {
        three_points.push(new THREE.Vector3( listOfPoints[i].x, listOfPoints[i].y, listOfPoints[i].z ));
      }
      return three_points;
    },

    CreateLine : function(points)
    {
      var geometry = new THREE.BufferGeometry().setFromPoints( points );
      var material = new THREE.LineBasicMaterial( { color : 0xffffff } );
      var curveObject = new THREE.Line( geometry, material );
      return curveObject;
    },

    CreateInvisiblePlane : function(fixed_axe = 2, fixed_position = 0)
    {
      var planeMaterial = new THREE.MeshBasicMaterial({
        alphaTest: 0,
        visible: false
      });
      var plane = new THREE.Mesh( new THREE.PlaneBufferGeometry(5000, 5000), planeMaterial );

      switch (fixed_axe) {
        case 0:
          plane.geometry.rotateY( Math.PI / 2 );
          plane.geometry.translate( fixed_position, 0, 0 );
          break;
        case 1:
          plane.geometry.rotateZ( Math.PI / 2 );
          plane.geometry.translate( 0, fixed_position, 0 );
          break;
        case 2:
          //plane.geometry.rotateX( Math.PI / 2 );
          plane.geometry.translate( 0, 0, fixed_position );
          break;
        default:
          break;
      }

      return plane;
    },

    CreateTransformControls : function()
    {
      return (new THREE.TransformControls(this._camera, this._renderer.domElement));
    },

    _addCameraLight : function(camera)
    {
      var pointLight = new THREE.PointLight( 0xffffff );
      pointLight.position.set(1,1,2);
      this._camera.add(pointLight);
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
      const center_line_color = new THREE.Color(0x666666);
      const grid_color = new THREE.Color(0x555555);
      var gridHelper = new THREE.GridHelper( grid_size, grid_divisions, center_line_color, grid_color );
      // Z up:
      //https://stackoverflow.com/questions/44630265/how-can-i-set-z-up-coordinate-system-in-three-js
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
