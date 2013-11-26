/**
 * Created with JetBrains WebStorm.
 * User: cocos
 * Date: 13-10-23
 * Time: 下午1:56
 * To change this template use File | Settings | File Templates.
 */

//layer: game menu.
var MenuUI = ccs.UILayer.extend({
    parentScene:null,
    settingBtn:null,
    bloodBar:null,
    distanceScore:null,
    musicEffect:null,
    musicVolume:null,
    init:function(bloodBarPercent, value)
    {
        if( ccs.UILayer.prototype.init.call(this) )
        {
            this.parentScene = GameScene.getScene();
            this.addWidget( ccs.GUIReader.getInstance().widgetFromJsonFile(Json_IronCityUI_1) );

            this.settingBtn    = this.getWidgetByName("Setting");
            this.bloodBar      = this.getWidgetByName("BloodBar");
            this.distanceScore = this.getWidgetByName("DistanceScore");

            this.settingBtn.addTouchEventListener(this.settingBtnCallback, this);
            this.setBloodBarPercent(bloodBarPercent);
            this.setDistanceScore(value);

            this.musicEffect = 0;
            this.musicVolume = 50;

            return true;
        }
        return false;
    },
    //set blood.
    setBloodBarPercent:function(percent)
    {
        this.bloodBar.setPercent(percent);
    },
    //set distance score.
    setDistanceScore:function(value){
        this.distanceScore.setStringValue(value);
    },
    //call back function of setting button.
    settingBtnCallback:function(pSender, type)
    {
        if(ccs.TouchEventType.ended == type)
        {
            this.parentScene = GameScene.getScene();
            var gameSetLayer = new SettingUI();
            gameSetLayer.init(this.musicEffect, this.musicVolume);

            gameSetLayer.setAnchorPoint(cc.p(0, 0));
            gameSetLayer.setPosition(cc.p(0, 0));

            this.parentScene.addChild(gameSetLayer,4);
            this.parentScene.pause();

            return true;
        }
    },
    //get score of distance.
    getDistanceScore:function(){
        return this.distanceScore.getStringValue();
    }
});
