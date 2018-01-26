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

      /*
      ------ Application ------
      */

      // Document is the application root
      var doc = this.getRoot();

      var body = document.body;
      var html = document.documentElement;
      var docWidth = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
      var docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight ) - 30;
      var almostAllWidth = parseInt(docWidth / 1.3);
      var halfHeight = parseInt(docHeight / 2);

      var nCols = 3;
      var nRows = 50;

      var btn = new qx.ui.form.Button("New Data");
      btn.addListener("execute", this._createRandomData.bind(this, nCols, nRows));

      this._tableView = new app.ui.TableView(almostAllWidth, halfHeight - 10, nCols);
      this._chartView = new app.ui.ChartView(almostAllWidth, halfHeight - 10);

      this._tableView.addListener("filteredDataChanged", function(e) {
        var colData = this._createRandomCols(nCols);
        this._chartView.setData(colData, this._tableView.getFilteredData());
      }, this);

      doc.add(btn, {top: 0});
      doc.add(this._tableView, {top: 30});
      doc.add(this._chartView, {top: halfHeight + 10});
    },

    _createRandomData : function(nCols, nRows)
    {
      var colData = this._createRandomCols(nCols);
      var rowData = this._createRandomRows(nCols, nRows);
      this._tableView.setData(colData, rowData);
      this._chartView.setData(colData, rowData);
    },

    _createRandomCols : function(nCols)
    {
      var myCols = ["Time"];
      for (var col = 1; col < nCols; col++) {
        myCols.push("Value " + col);
      }
      return myCols;
    },

    _createRandomRows : function(nCols, nRows)
    {
      var rowsData = [];
      for (var row = 0; row < nRows; row++) {
        var rowData = [row+1];
        for (var col = 1; col < nCols; col++) {
          rowData.push(Math.random() * 100);
        }
        rowsData.push(rowData);
      }
      return rowsData;
    },
  }
});
