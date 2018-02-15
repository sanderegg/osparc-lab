qx.Class.define("app.components.preferences",
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
      //var localeController = new qx.data.controller.List(null, localeBox);
      //localeController.setModel(this._model.getLocaleCode());
      form.add(localeBox, this.tr("Language"));


      // FormAndListController
      var userBox = new qx.ui.form.SelectBox();
      userBox.setTextColor("black");
      var userController = new qx.data.controller.List(null, userBox);
      userController.setDelegate({bindItem: function(controller, item, index) {
        controller.bindProperty("Name", "label", null, item, index);
        controller.bindProperty("ID", "model", null, item, index);
      }});
      userController.setModel(this._model.getUsers());
      form.add(userBox, this.tr("User"));


      return form;
    },

    _createButtons : function(options_form)
    {
      const btnWidth = 120;
      //var buttons_bar = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

      //buttons_bar.add(new qx.ui.core.Spacer(40));

      var cancelBtn = new qx.ui.form.Button(this.tr("Cancel"));
      cancelBtn.setWidth(btnWidth);
      cancelBtn.setTextColor("black");
      cancelBtn.addListener("execute", function(e) {
        this._CloseWindow();
      }, this);
      //buttons_bar.add(cancelBtn);
      options_form.addButton(cancelBtn);

      var saveBtn = new qx.ui.form.Button(this.tr("Save"));
      saveBtn.setWidth(btnWidth);
      saveBtn.setTextColor("black");
      saveBtn.addListener("execute", function(e) {

      }, this);
      //buttons_bar.add(saveBtn);
      options_form.addButton(saveBtn);

      //return buttons_bar;
    },

    _CloseWindow : function()
    {
      this.close();
    },
  }
});
