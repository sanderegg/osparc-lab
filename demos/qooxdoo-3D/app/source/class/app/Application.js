/* ************************************************************************

   Copyright: 2018 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

/**
 * This is the main application class of "app"
 *
 * @asset(app/*)
 */
qx.Class.define("app.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _threeView: null,
    _objectList: null,

    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Document is the application root
      var doc = this.getRoot();

      var body = document.body;
      var html = document.documentElement;

      var docWidth = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
      var docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

      this._threeView = new app.components.threeView(docWidth, docHeight);
      this._objectList = new app.components.objectList(10, 60, 300, 400);

      doc.add(this._threeView);
      doc.add(this._getMenuBar());
      this._objectList.open();
    },

    _getMenuBar : function(width, height)
    {
      var frame = new qx.ui.container.Composite(new qx.ui.layout.Grow);
      frame.setDecorator("main");

      var toolbar = new qx.ui.toolbar.ToolBar;
      frame.add(toolbar);

      var menuPart = new qx.ui.toolbar.Part;
      toolbar.add(menuPart);

      var sphere_btn = new qx.ui.toolbar.Button("Add Sphere");
      sphere_btn.addListener("execute", this._addSphere.bind(this));

      menuPart.add(sphere_btn);

      return frame;
    },

    _addSphere : function()
    {
      var mesh = this._threeView.AddSphere();
      this._objectList.AddObject(mesh.uuid, "Sphere");
    }
  }
});
