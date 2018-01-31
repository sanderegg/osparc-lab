/**
 * @asset(resource/vtk/*)
 * @ignore(VTK)
 */
 qx.Class.define("app.ui.VTKView",
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

    var label = new qx.ui.basic.Label("3D view (vtk.js)").set({
      font: new qx.bom.Font(20, ["Verdana", "sans-serif"]),
      textColor: 'black'
    });
    this.add(label);


    // initialize the script loading
    var vtk_path = "resource/vtk/vtk.min.js";
    var dynLoader = new qx.util.DynamicScriptLoader([
      vtk_path
    ]);

    dynLoader.addListenerOnce('ready', function(e) {
      console.log(vtk_path + " loaded");
      this.setLibReady(true);

      this._VTKViewer = new qx.ui.core.Widget();
      this._VTKViewer.getContentElement().setAttribute('id', 'vtkViewer');
      this.add(this._VTKViewer, {flex: 1});

      this._VTKViewer.addListenerOnce('appear', function() {

        var vtkContainer = document.getElementById('vtkViewer');
        var fullScreenRenderer = vtk.Rendering.Misc.vtkFullScreenRenderWindow.newInstance({
          background: [0.3, 0.3, 0.3],
          rootContainer: vtkContainer,
          containerStyle: { height: '100%', width: '100%' }
        });
        var actor              = vtk.Rendering.Core.vtkActor.newInstance();
        var mapper             = vtk.Rendering.Core.vtkMapper.newInstance();
        var cone               = vtk.Filters.Sources.vtkConeSource.newInstance();

        actor.setMapper(mapper);
        mapper.setInputConnection(cone.getOutputPort());

        var renderer = fullScreenRenderer.getRenderer();
        renderer.addActor(actor);
        renderer.resetCamera();

        var renderWindow = fullScreenRenderer.getRenderWindow();
        renderWindow.render();
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
    _VTKViewer: null
  }
});
