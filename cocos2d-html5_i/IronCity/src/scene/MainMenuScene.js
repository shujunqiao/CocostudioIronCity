//png
var Png_MainMenuSceneBK     = "res/iphone/MainMenuSceneBK.png";
var Png_StartBtn             = "res/iphone/StartBtn.png";
var Png_StartBtnPush        = "res/iphone/StartBtnPush.png";
//music
var mp3_music_background    = "res/music/music_background.mp3";
//ui
var UI_GameSceneLayer_1    = "res/MainMenuLayer_1.json";
//scene
var Scene_GameScene     = "res/MainMenuScene.json";
//preload
var MainMenuScene_resources =
[
    {src:mp3_music_background},
    {src:Png_MainMenuSceneBK},
    {src:Png_StartBtn},
    {src:Png_StartBtnPush},
    {src:UI_GameSceneLayer_1},
    {src:Scene_GameScene}
];
//scene: main menu.
var MainMenuScene = cc.Scene.extend
({
    mainMenu:null,      //menu layer.
    onEnter:function ()
    {
        this._super();

        //add cocostudio scene to game
        var gameSceneNode = ccs.SceneReader.getInstance().createNodeWithSceneFile(Scene_GameScene);
        this.addChild(gameSceneNode);

        var pAudio =gameSceneNode.getComponent("Audio");
        pAudio.playBackgroundMusic(pAudio.getFile(), pAudio.isLoop());

        var gameComRender =  gameSceneNode.getChildByTag(1);
        var gameSceneComponent = gameComRender.getComponent("mainMenuLayer");
        var uiLayer = gameSceneComponent.getNode();
        var startButton = uiLayer.getWidgetByName("startButton");
        startButton.setTouchEnabled(true);
        startButton.addTouchEventListener(this.startBtnCallFunc ,this);
    },
    //click btn of start.
    startBtnCallFunc:function(pSender)
    {
        console.log("click btn.");
        //preload resources and relpaceScene
        cc.LoaderScene.preload(GameScene_resources, function ()
        {
            // initial gameScene
            var gameScene = new GameScene();
            gameScene.init();
            // set gameScene transition animation
            var gameSceneTransition = cc.TransitionFade.create(0.5, gameScene, cc.white());
            cc.Director.getInstance().replaceScene(gameSceneTransition);
        }, this);
    }
});

