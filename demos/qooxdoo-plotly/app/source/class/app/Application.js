/* ************************************************************************
   Copyright: 2018
   License: MIT license
   Authors: @odeimaiz
************************************************************************ */

/**
 * This is the main application class of "app"
 * @asset(app/*)
 */
qx.Class.define("app.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     * @lint ignoreDeprecated(alert)
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

      // Document is the application root
      var doc = this.getRoot();

      this._tableView = new app.ui.TableView();
      this._chartView = new app.ui.ChartView();
      doc.add(this._tableView, {left: 0, top: 0, width: "100%"});
      doc.add(this._chartView, {left: 0, top: 450, width: "100%"});
    }
  }
});
