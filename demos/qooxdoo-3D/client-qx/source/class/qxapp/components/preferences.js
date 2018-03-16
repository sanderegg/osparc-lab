qx.Class.define("qxapp.components.preferences",
{
  extend: qx.ui.window.Window,

  include : [qx.locale.MTranslation],

  construct : function(model, width, height, backgroundColor, fontColor)
  {
    this.base(arguments, this.tr("Preferences"));

    this._model = model;

    this.set({
      //contentPadding: 0,
      //width: width,
      //height: height,
      //allowClose: false,
      allowMinimize: false,
      backgroundColor: backgroundColor,
      textColor: fontColor,
      modal: true,
    });
    this.setLayout(new qx.ui.layout.Grow());

    //this.setLayout(new qx.ui.layout.VBox);
    var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());

    var options_form = this._createOptions();
    this._createButtons(options_form);
    //this.add(options_form);
    container.add(new qx.ui.form.renderer.Single(options_form), {left: 10, top: 10});

    this.add(container);
  },

  events : {

  },

  members: {
    _model: null,

    _createOptions : function()
    {
      var form = new qx.ui.form.Form();


      // Translation && Localization
      var localeManager = qx.locale.Manager.getInstance();
      var locales = localeManager.getAvailableLocales().sort();
      var currentLocale = localeManager.getLocale();

      var localeBox = new qx.ui.form.SelectBox({
        width: 100,
        allowGrowY: false,
      });
      localeBox.setTextColor("black");
      var defaultListItem = this._model.getLocaleCode();
      for (var i=0; i<locales.length; i++)
      {
        var listItem = new qx.ui.form.ListItem(locales[i]);
        localeBox.add(listItem);
        if ((!defaultListItem && locales[i] == "en") || locales[i] == currentLocale) {
          defaultListItem = listItem;
        }
      }
      localeBox.addListener("changeSelection", function(e) {
        var locale = e.getData()[0].getLabel();
        qx.locale.Manager.getInstance().setLocale(locale);
        this._model.setLocaleCode(locale);
      }, this);
      if (defaultListItem) {
        localeBox.setSelection([defaultListItem]);
      }
      form.add(localeBox, this.tr("Language"));


      // FormAndListController
      var userBox = new qx.ui.form.SelectBox();
      userBox.setTextColor("black");
      var userController = new qx.data.controller.List(null, userBox);
      userController.setDelegate( {
        bindItem: function(controller, item, index) {
          controller.bindProperty("Name", "label", null, item, index);
          controller.bindProperty("ID", "model", null, item, index);
        }
      });
      userController.setModel(this._model.getUsers());
      for (var i = 0; i < userBox.getSelectables().length; i++) {
        if (userBox.getSelectables()[i].getModel() === this._model.getActiveUser()) {
          userBox.setSelection([userBox.getSelectables()[i]]);
          break;
        }
      }
      userBox.addListener("changeSelection", function(e) {
        var userId = e.getData()[0].getModel();
        this._model.setActiveUser(userId);
      }, this);
      form.add(userBox, this.tr("User"));


      var useExternalModeler = this._model.getUseExternalModeler();
      var useExternalModelerBox = new qx.ui.form.CheckBox();
      useExternalModelerBox.setValue(Boolean(useExternalModeler));
      useExternalModelerBox.addListener("changeValue", function(e) {
        var useExternal = e.getData();
        this._model.setUseExternalModeler(useExternal);
      }, this);
      form.add(useExternalModelerBox, this.tr("Use external modeler"));


      var exportSceneAsBinary = this._model.getExportSceneAsBinary();
      var exportSceneAsBinaryBox = new qx.ui.form.CheckBox();
      exportSceneAsBinaryBox.setValue(Boolean(exportSceneAsBinary));
      exportSceneAsBinaryBox.addListener("changeValue", function(e) {
        var useBinary = e.getData();
        this._model.setExportSceneAsBinary(useBinary);
      }, this);
      form.add(exportSceneAsBinaryBox, this.tr("Export scenes in binary format"));


      return form;
    },

    _createButtons : function(options_form)
    {
      const btnWidth = 120;

      var cancelBtn = new qx.ui.form.Button(this.tr("Cancel"));
      cancelBtn.setWidth(btnWidth);
      cancelBtn.setTextColor("black");
      cancelBtn.addListener("execute", function(e) {
        this._CloseWindow(0);
      }, this);
      options_form.addButton(cancelBtn);

      var saveBtn = new qx.ui.form.Button(this.tr("Accept"));
      saveBtn.setWidth(btnWidth);
      saveBtn.setTextColor("black");
      saveBtn.addListener("execute", function(e) {
        this._CloseWindow(1);
      }, this);
      options_form.addButton(saveBtn);
    },

    _CloseWindow : function(code)
    {
      this._closeStatus = code;
      this.close();
    },
  }
});
