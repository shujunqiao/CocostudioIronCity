/**
 * Created with JetBrains WebStorm.
 * User: cocos
 * Date: 13-10-23
 * Time: 下午2:59
 * To change this template use File | Settings | File Templates.
 */

//layer: setting layer.
var SettingUI = ccs.UILayer.extend({
    musicEffectStatus:0,
    musicEffectSlider:null,
    musicVolumeSlider:null,
    parentScene:null,
    //init function: effectStatus: effect of audio, volumn: volume of music.
    init:function(effectStatus, volumn){
        if( ccs.UILayer.prototype.init.call(this) ){
            this.parentScene = GameScene.getScene();
            this.parentScene.moveMap.stop();
            this.parentScene.stopAllActions();
            this.parentScene.playLayer.stopAllActions();
            this.parentScene.playLayer.setTouchEnabled(false);
            //parentScene.gameSceneMonster.MonsterAmature.pauseSchedulerAndActions();
            this.parentScene.playLayer.imManArmature.pauseSchedulerAndActions();
            this.parentScene.menuLayer.settingBtn.setTouchEnable(false);

            //add cocostudio json file to widget.
            this.addWidget(ccs.GUIReader.getInstance().widgetFromJsonFile(Json_GameSceneSetMenu_1));

            this.musicEffectSlider = this.getWidgetByName("musicEffect");
            this.musicVolumeSlider = this.getWidgetByName("musicVolume");
            var backGameBtn = this.getWidgetByName("backGame");
            var returnMainMenuBtn = this.getWidgetByName("returnMainMenu");

            this.musicEffectStatus = effectStatus;

            if(this.musicEffectStatus == 0){

                this.musicEffectSlider.setPercent(15);
            }else if(this.musicEffectStatus == 1){

                this.musicEffectSlider.setPercent(95);
            }
            this.musicVolumeSlider.setPercent(volumn);

            backGameBtn.addTouchEventListener(this.backGameBtn, this);
            returnMainMenuBtn.addTouchEventListener(this.returnMainMenuBtnFunc, this);
            this.musicEffectSlider.addEventListenerSlider(this.musicEffectSliderCallFunc, this);
            this.musicVolumeSlider.addEventListenerSlider(this.musicVolumeSliderCallFunc, this);
            return true;
        }

        return false;
    },
    //callback function of music effect slider.
    musicEffectSliderCallFunc:function(pSender, type){
        if(type == ccs.SliderEventType.percent_changed){
            if(this.musicEffectStatus == 0){
                this.musicEffectSlider.setPercent(95);
                this.musicEffectStatus=1;
            }else if(this.musicEffectStatus == 1){

                this.musicEffectSlider.setPercent(15);
                this.musicEffectStatus=0;
            }
        }

        this.parentScene.menuLayer.musicEffect = this.musicEffectStatus;
        //set audio state.
        AudioPlayer.getInstance().setBackgroundMusicPlay(this.musicEffectStatus);
        //AudioPlayer::sharedAudio()->setBackgroundMusicPlay(musicEffectStatus);
    },
    //callback function of music volume slider.
    musicVolumeSliderCallFunc:function(pSender, type){
        var voice = 0.0;
        if(type == ccs.SliderEventType.percent_changed){
            voice = this.musicVolumeSlider.getPercent();
            if(this.musicVolumeSlider.getPercent()<8){
                this.musicVolumeSlider.setPercent(8);
                voice=0.0;
            }else if(this.musicVolumeSlider.getPercent()>95){
                this.musicVolumeSlider.setPercent(95);
                voice=100.0;
            }
        }

        this.parentScene.menuLayer.musicVolume = this.musicVolumeSlider.getPercent();
        //set audio voice.
        //AudioPlayer::sharedAudio().setVolume(voice/100);
        AudioPlayer.getInstance().setVolume(voice/100);
    },
    //callback of backGame button.
    backGameBtn:function(pSender, type){
        if(ccs.TouchEventType.ended == type){
            this.parentScene.resumeSchedulerAndActions();
            this.parentScene.playLayer.imManArmature.resumeSchedulerAndActions();
            this.parentScene.playLayer.setTouchEnabled(true);

            var currentMovementId = this.parentScene.playLayer.imManArmature.getAnimation().getCurrentMovementID();
            cc.log("currentMovementId is %s", currentMovementId);
            //if(currentMovementId.compare("") !=0 && (currentMovementId.compare("Running")==0 || currentMovementId.compare("RuningJump")==0))
            //    this.parentScene.moveMap.move();
            if(currentMovementId != "" && (currentMovementId == "Running" || currentMovementId == "RuningJump"))
                this.parentScene.moveMap.move();

            this.parentScene.play();

            //this.parentScene.gameSceneMonster.MonsterAmature.resumeSchedulerAndActions();
            this.parentScene.menuLayer.settingBtn.setTouchEnable(true);

            //this.removeAllChildren();
            this.removeFromParent(true);
        }
    },
    //callback of return main menu button.
    returnMainMenuBtnFunc:function(pSender, type){
        var mainMenuScene =  new MainMenuScene();
        mainMenuScene.init();

        var mainMenuSceneTransition =  cc.TransitionFade.create(0.5, mainMenuScene, cc.WHITE);
        cc.Director.getInstance().replaceScene(mainMenuSceneTransition);
    }
});