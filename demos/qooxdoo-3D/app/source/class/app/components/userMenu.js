qx.Class.define("app.components.userMenu",
{
  extend: qx.ui.container.Composite,

  include : [qx.locale.MTranslation],

  construct : function(activeName, backgroundColor, fontColor)
  {
    this.base(arguments);

    this.setActiveUserName(activeName);

    this.setLayout( new qx.ui.layout.HBox(0) );

    this.add(new qx.ui.basic.Label(this.tr("Hello, ")).set({
      backgroundColor : backgroundColor,
      textColor: fontColor,
      padding : 6,
      allowGrowY: false,
    }));

    this.add(new qx.ui.basic.Label(this.getActiveUserName()).set({
      backgroundColor : backgroundColor,
      textColor: fontColor,
      padding : 6,
      allowGrowY: false,
    }));
  },

  properties: {
    activeUserName: {
      nullable: false,
      init: false,
      check: "String",
    },
  },
});
