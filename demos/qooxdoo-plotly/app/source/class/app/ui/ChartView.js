/**
 * @asset(resource/plotly/*)
 * @ignore(plotly)
 */
 qx.Class.define("app.ui.ChartView",
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

    var label = new qx.ui.basic.Label("Chart view").set({
      font: new qx.bom.Font(20, ["Verdana", "sans-serif"]),
      textColor: 'black'
    });
    this.add(label);

    this._plot = new qx.ui.core.Widget();
    this._plot.getContentElement().setAttribute('id', 'plotlyDiv');

    this.add(this._plot, {flex: 1});


    // in debug mode load the uncompressed unobfuscated scripts
    // three.js files are in resource/three/three(.min).js
    var min = '.min';
    if (qx.core.Environment.get("qx.debug")) {
      min = '';
    }

    // initialize the script loading
    var plotly_path = "resource/plotly/plotly-latest.min.js";
    var dynLoader = new qx.util.DynamicScriptLoader([
      plotly_path
    ]);

    dynLoader.addListenerOnce('ready', function(e) {
      console.log(plotly_path + " loaded");
      this.setLibReady(true);

      var trace1 = {
        x: [1, 2, 3, 4],
        y: [10, 15, 13, 17],
        type: 'scatter'
      };
      var trace2 = {
        x: [1, 2, 3, 4],
        y: [16, 5, 11, 9],
        type: 'scatter'
      };
      var data = [trace1, trace2];

      var layout = {
        title:'Line and Scatter Plot',
        width: this.getWidth(),
        height: this.getHeight()
      };

      Plotly.newPlot('plotlyDiv', data, layout);
    }, this);

    dynLoader.addListener('failed', function(e) {
      var data = e.getData();
      console.log("failed to load " + data.script);
    }, this);

    dynLoader.start();
  },

  properties: {
    LibReady: { check: "Boolean" },
  },

  members: {
    _plot: null,
  }
});
