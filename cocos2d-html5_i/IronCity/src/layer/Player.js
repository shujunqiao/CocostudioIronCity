var arrActionType =
[
    "ACTION_RUN",
    "ACTION_RUN_JUMP",
    "ACTION_RUN_STOP",
    "ACTION_RUN_ATTACK",
    "ACTION_STAND_ATTACK",
    "ACTION_DEATH",
    "ACTION_STAND_JUMP"
];

//layer: player layer.
var Player = cc.Layer.extend
({
    isMouseDown:false,
    actionNum:null,
    imManArmature:null,
    armaturePosition:null,
    isAttack:false,
    _attackPos:null,
    _attackDir:null,

    monsterGroundAmount:0,
    monsterSkyAmount:0,
    touchTime:0,
    imManArmatureBrood:0,
    m_tBeginPos:null,
    s_tCurPos:null,
    playerBoundingBox:null,
    playerScale:0,
    playerX:0,
    playerY:0,
    //init function.
    init:function ()
    {
        this._super();
        this.setTouchEnabled(true);
        //this.setTouchMode(cc.TOUCH_ONE_BY_ONE);
        var size = cc.Director.getInstance().getWinSize();

        //add cocostudio json file to widget.
        ccs.ArmatureDataManager.getInstance().addArmatureFileInfo(Json_CMRun);
        ccs.ArmatureDataManager.getInstance().addArmatureFileInfo(Json_CMRunJump);
        ccs.ArmatureDataManager.getInstance().addArmatureFileInfo(Json_CMRunStop);
        ccs.ArmatureDataManager.getInstance().addArmatureFileInfo(Json_CMStandJump);
        ccs.ArmatureDataManager.getInstance().addArmatureFileInfo(Json_LaserRunAttack);
        ccs.ArmatureDataManager.getInstance().addArmatureFileInfo(Json_LaserStandAttack);
        ccs.ArmatureDataManager.getInstance().addArmatureFileInfo(Json_CMDead);

        this.playerX = 50.0;
        this.playerY = 70.0;
        this.playerScale = 0.6;
        this.imManArmatureBrood = 100;

        this.monsterGroundAmount = 0;
        this.monsterSkyAmount = 0;

        this.touchTime = 0;
        this.isAttack = false;
        this._attackPos = cc.p(0,0);
        this._attackDir = 0.0;
        this.CMRunningStop();
        this.actionNum = ACTION_TYPE.ACTION_RUN_STOP;
    },
    //callback function of runjump action.
    runJumpActionCallBack:function(sender, data){
        this.imManArmature.stopAllActions();
        this.imManArmature.removeFromParent(false);
        if(0xbebabebb == data)
        {
            this.CMRunning();
        }
        else
        {
            this.CMRunningStop();
        }
    },
    //callback function of standjump action.
    standJumpActionCallBack:function()
    {
        this.imManArmature.stopAllActions();
        this.imManArmature.removeFromParent(false);
        this.CMRunningStop();
    },
    //register touch dispatcher.
    registerWithTouchDispatcher:function(){
        cc.registerTargetedDelegate(0, false, this);
    },
    //callback function of menu close button.
    menuCloseCallback:function(){
        var splitCols = cc.MoveTo.create(1.0 ,cc.p(this.imManArmature.getPosition().x+300, this.imManArmature.getPosition().y));
        this.imManArmature.runAction(splitCols);
    },
    //change IronMan's speed.
    changeSpeed:function(t){
        this.imManArmature.getAnimation().setSpeedScale(2.0);
        GameScene.getScene().moveMap.setMovedSpeed(3);
    },
    //on touch began.
    onTouchBegan:function (touches, event) {
        this.m_tBeginPos = touches.getLocation();

        return true;
    },
    //on touch moved.
    onTouchMoved:function (touches, event) {
        this.touchTime++;
    },
    //on touch ended.
    onTouchEnded:function (touches, event) {
        if(this.isAttack){
            return;
        }
        if(this.touchTime>30)
        {
            this.touchTime = 0;
            return;
        }

        var touchLocation  = touches.getLocation();
        var setBtnLocation = GameScene.getScene().menuLayer.settingBtn.getPosition();
        var setBtnSize = GameScene.getScene().menuLayer.settingBtn.getSize();

        if(this.touchTime<6 && this.checkIfTouchNotInSetBtnArea(touchLocation,setBtnSize, setBtnLocation))
        {
            if(this.actionNum != ACTION_TYPE.ACTION_RUN && this.actionNum != ACTION_TYPE.ACTION_RUN_STOP)
            {
                return;
            }
            this.isAttack = true;
            this.imManArmature.stopAllActions();
            this.imManArmature.removeFromParent(false);
            if(this.actionNum == ACTION_TYPE.ACTION_RUN)
            {
                this.CMRunAttack(touchLocation);
            }
            else if(this.actionNum == ACTION_TYPE.ACTION_RUN_STOP)
            {
                this.CMStandAttack(touchLocation);
            }

            this.touchTime = 0;
            return;
        }

        var touchLocation = touches.getLocation();
        var nMoveX = touchLocation.x - this.m_tBeginPos.x;
        var nMoveY = touchLocation.y - this.m_tBeginPos.y;
        var radian = 10;

        if(nMoveX>10 && Math.abs(Math.tan(nMoveY/nMoveX))<Math.abs(Math.sqrt(3)/radian))
        {
            if(this.actionNum == ACTION_TYPE.ACTION_RUN)
            {
                if(GameScene.getScene().moveMap.getMoveSpeed()!=6)
                {
                    GameScene.getScene().moveMap.setMovedSpeed(6);
                    this.imManArmature.getAnimation().setSpeedScale(3.0);
                    this.schedule(this.changeSpeed,0.5, 0, 0.0);
                    return;
                }
            }
            this.imManArmature.stopAllActions();
            this.imManArmature.removeFromParent(false);
            this.CMRunning();
        }

        if(nMoveX<-10 && Math.abs(Math.tan(nMoveY/nMoveX))<Math.abs(Math.sqrt(3)/radian))
        {
            if(this.actionNum == ACTION_TYPE.ACTION_RUN_STOP)
                return;

            this.imManArmature.stopAllActions();
            this.imManArmature.removeFromParent(false);
            this.CMRunningStop();
        }

        this.touchTime = 0;

        if(nMoveY>10 && Math.abs(Math.tan(nMoveY/nMoveX))>Math.abs(Math.sqrt(3)/radian))
        {
            if(this.actionNum == ACTION_TYPE.ACTION_STAND_JUMP || this.actionNum == ACTION_TYPE.ACTION_RUN_JUMP)
                return;

            var armatureName = this.imManArmature.getName();
            this.imManArmature.stopAllActions();
            this.imManArmature.removeFromParent(false);

            if(armatureName == "CMRun")
            {
                this.CMRunJump();
                var jumpAction = cc.JumpTo.create(0.5,cc.p(this.imManArmature.getPosition().x,this.imManArmature.getPosition().y),100,1);
                var callBack;
                if(nMoveX<0)
                {
                    callBack = cc.CallFunc.create(this.runJumpActionCallBack, this, 0xbebabeba);
                }
                else
                {
                    callBack = cc.CallFunc.create(this.runJumpActionCallBack, this, 0xbebabebb);
                }
                var action = cc.Sequence.create(jumpAction,callBack);
                this.imManArmature.runAction(action);
            }

            if(armatureName == "CMRunStop")
            {
                this.CMStandJump();
                var jumpAction = cc.JumpTo.create(0.5,cc.p(this.imManArmature.getPositionX(),this.imManArmature.getPositionY()),200,1);
                var callBack = cc.CallFunc.create(this.standJumpActionCallBack, this, 0xbebabeba);
                var action = cc.Sequence.create(jumpAction,callBack);
                this.imManArmature.runAction(action);
            }
        }
    },
    //Running animation.
    CMRunning:function(){
        var armature = ccs.Armature.create("CMRun");
        armature.getAnimation().play("Running");
        armature.getAnimation().setSpeedScale(2.0);
        armature.setScale(this.playerScale);
        armature.setAnchorPoint(cc.p(0.5,0));
        armature.setPosition(cc.p(this.playerX+30, this.playerY));
        this.armaturePosition = armature.getPosition();
        this.addChild(armature);
        this.imManArmature = armature;

        this.actionNum = ACTION_TYPE.ACTION_RUN;
        if(GameScene.getScene() && GameScene.getScene().moveMap)
            GameScene.getScene().moveMap.move();
    },

    //Run jump animation.
    CMRunJump:function(){
        var armature = ccs.Armature.create("CMRunJump");
        armature.getAnimation().play("RuningJump");
        armature.getAnimation().setSpeedScale(1.5);
        armature.setScale(this.playerScale);
        armature.setAnchorPoint(cc.p(0.5,0));
        armature.setPosition(cc.p(this.playerX+20, this.playerY));
        this.armaturePosition = armature.getPosition();
        this.addChild(armature);
        this.imManArmature = armature;
        this.actionNum = ACTION_TYPE.ACTION_RUN_JUMP;
        GameScene.getScene().moveMap.setMovedSpeed(6);
        armature.getAnimation().setMovementEventCallFunc(this.amatureActionCallBack, this);
    },

    //Stand jump animation.
    CMStandJump:function(){
        var armature = ccs.Armature.create("CMStandJump");
        armature.getAnimation().play("StandJump");
        armature.getAnimation().setSpeedScale(1.5);
        armature.setScale(this.playerScale);
        armature.setAnchorPoint(cc.p(0.5,0));
        armature.setPosition(cc.p(this.playerX+20, this.playerY));
        this.armaturePosition = armature.getPosition();
        this.addChild(armature);
        this.imManArmature = armature;
        this.actionNum = ACTION_TYPE.ACTION_STAND_JUMP;
        if(GameScene.getScene() && GameScene.getScene().moveMap)
            GameScene.getScene().moveMap.stop();
    },

    //Running stop animation.
    CMRunningStop:function(){
        var armature = ccs.Armature.create("CMRunStop");
        armature.getAnimation().play("RunningStop");
        armature.getAnimation().setSpeedScale(1.5);
        armature.setScale(this.playerScale);
        armature.setAnchorPoint(cc.p(0.5,0));
        armature.setPosition(cc.p(this.playerX+50, this.playerY));
        this.armaturePosition = armature.getPosition();
        this.addChild(armature);
        this.imManArmature = armature;

        this.actionNum = ACTION_TYPE.ACTION_RUN_STOP;
        if(GameScene.getScene() && GameScene.getScene().moveMap)
            GameScene.getScene().moveMap.stop();
    },
    //Running attack animation.
    CMRunAttack:function(touch){
        var angle = this.getAngle(touch);
        var posHand = this.getPosHand(angle);

        var armature = ccs.Armature.create("LaserRunAttack");
        armature.getAnimation().play("RunningAttack");
        armature.getAnimation().setSpeedScale(2.0);
        armature.setScale(this.playerScale);
        armature.setAnchorPoint(cc.p(0.5,0));
        armature.setPosition(cc.p(this.playerX+40, this.playerY));
        this.armaturePosition = armature.getPosition();
        this.addChild(armature);
        this.imManArmature = armature;
        armature.getAnimation().setMovementEventCallFunc(this.setAttackEvent, this);

        this._attackPos = posHand;
        this._attackDir = angle;
    },
    //Stand attack animation.
    CMStandAttack:function(touch){
        var posHand = this.getPosHand(0.1);
        this._attackPos = posHand;
        var angle = this.getAngle(touch);

        var armature = ccs.Armature.create("LaserStandAttack");
        armature.getAnimation().play("StandAttack");
        armature.getAnimation().setSpeedScale(1.5);
        armature.setScale(this.playerScale);
        armature.setAnchorPoint(cc.p(0.5,0));
        armature.setPosition(cc.p(this.playerX, this.playerY));
        this.armaturePosition = armature.getPosition();
        this.addChild(armature);
        this.imManArmature = armature;
        armature.getAnimation().setMovementEventCallFunc(this.setAttackEvent, this);

        this._attackDir = angle;
    },
    //death animation.
    CMDeath:function(){
        this.setTouchEnabled(false);
        this.imManArmature.removeFromParent(true);
        var armature = null;
        armature = ccs.Armature.create("CMDead");
        armature.getAnimation().playByIndex(0.0, 1.0, 1.0,0.0, 1.0);
        armature.getAnimation().setSpeedScale(0.5);
        armature.setScale(this.playerScale);
        armature.setAnchorPoint(cc.p(0.5,0));
        armature.setPosition(cc.p(100, this.playerY-8));
        this.armaturePosition = armature.getPosition();
        this.addChild(armature);
        this.imManArmature = armature;
        this.actionNum = ACTION_TYPE.ACTION_DEATH;
        armature.getAnimation().setMovementEventCallFunc(this.Dead, this);
    },
    //CallBack of running jump animation.
    amatureActionCallBack:function(armature, movementType, armature){
        if (movementType == ccs.MovementEventType.loopComplete || movementType == ccs.MovementEventType.complete)
        {
            switch (this.actionNum)
            {
                case ACTION_TYPE.ACTION_RUN_JUMP:
                {
                    GameScene.getScene().moveMap.setMovedSpeed(3);
                }
                    break;
                default:
                    break;
            }
        }
    },
    //get an angle
    getAngle:function(touch){
        var posOrg = cc.p(135, 132);
        if(touch.x <= posOrg.x)
            return -1.57;   //up max->90 degree„Ä?
        if (touch.y == posOrg.y) {
            if (touch.x > posOrg.x) {
                return 0;
            }
        }

        var tan = (touch.y - posOrg.y)/(touch.x - posOrg.x);
        if (tan < -6) {
            tan = -6;    //down max->45 degree„Ä?
        }
        var angle = Math.atan(tan);
        return -angle;
    },
    //get IronMan's hand position.
    getPosHand:function(angle){
        var posH = cc.p(141, 141);
        return posH;
    },
    //callback function of attack animation.
    setAttackEvent:function(armature, movementType, movementID){
        if (movementType == ccs.MovementEventType.loopComplete || movementType == ccs.MovementEventType.complete)
        {
            //play audio and launch laser.
            AudioPlayer.getInstance().playEffect(g_ArrEffects.Effect_Attack_0);
            GameScene.getScene().laser.addLaser(this._attackPos, this._attackDir);
            this.isAttack = false;
            this.imManArmature.stopAllActions();
            this.imManArmature.removeFromParent(false);
            if(this.actionNum == ACTION_TYPE.ACTION_RUN)
            {
                this.CMRunning();
            }
            else if(this.actionNum == ACTION_TYPE.ACTION_RUN_STOP)
            {
                this.CMRunningStop();
            }
        }
    },
    //callback function of dead animation.
    Dead:function(armature, movementType, movementID){
        if (movementType == ccs.MovementEventType.loopComplete || movementType == ccs.MovementEventType.complete)
        {
            if(GameScene.getScene())
                GameScene.getScene().gameOver();
        }
    },
    //chech area of not in set button.
    checkIfTouchNotInSetBtnArea:function(touchPosition, setBtnSize, setBtnPosition){
        return true;
    },
    //get Amount of monster on ground.
    getMonsterGroundAmount:function(){
        return this.monsterGroundAmount;
    },
    //get Amount of monster in sky.
    getMonsterSkyAmount:function(){
        return this.monsterSkyAmount;
    },
    //add Amount of monster on ground.
    addMonsterGroundAmount:function(){
        this.monsterGroundAmount ++;
    },
    //add Amount of monster in sky.
    addMonsterSkyAmount:function(){
        this.monsterSkyAmount ++;
    },
    pause:function()
    {
        this.imManArmature.pauseSchedulerAndActions();
        this.imManArmature.unscheduleUpdate();
    },
    play:function()
    {
        this.imManArmature.resumeSchedulerAndActions();
        this.imManArmature.scheduleUpdate();
    }

});

var ACTION_TYPE = null;
var AddTypes = function(types){
    ACTION_TYPE = {};
    ACTION_TYPE.length = 0;
    for(var i=0; i<types.length; i++){
        ACTION_TYPE[types[i]] = ACTION_TYPE.length;
        ACTION_TYPE.length ++;
    }
};
AddTypes(arrActionType);