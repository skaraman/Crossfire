var Gravity3D = require('famous/physics/forces/Gravity3D');

function Powers(){

}
Powers.prototype.setSlowTime = function() {
    if(!game.slowTime){
        game.slowTime = true;
        slowTimeBarTimerNode = gameUI.addChild();
        game.slowTimeBarTimerNode = slowTimeBarTimerNode;
        slowTimeBarTimerNode.name = "slowTimeBarTimerNode";
        slowTimeBarTimerNode.setSizeMode('relative','absolute')
            .setAbsoluteSize(null,10)
            .setProportionalSize(0.9,null)
            .setAlign(0.5,0);
        slowTimeBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),130,1);
        slowTimeBarTimerNode.DOMElement = new DOMElement(slowTimeBarTimerNode);
        slowTimeBarTimerNode.DOMElement
            .setProperty('background-color','grey')
            .setProperty('opacity','0.5');
        slowTimeBarTimerNode.slowTimeBarTimerComponent = {
            id:null,
            node:null,
            startTime:null,
            done: function(node){
                if(node in node._updater._updateQueue)
                    FamousEngine._updateQueue.splice(node._updater._updateQueue.indexOf(node), 1);
                if(node._updateQueue && node._updateQueue.length)
                    node._updateQueue = [];
                if(node._nextUpdateQueue && node._nextUpdateQueue.length)
                    node._nextUpdateQueue = [];
                if(node.isMounted())node.dismount();
                delete game.slowTime;
                delete game.slowTimeBarTimerNode.DOMElement;
                for(q=0; q< game.activeEnemies.length; q++){
                    if(game.activeEnemies[q] != null){
                        veloArr1 = game.activeEnemies[q].sphere.velocity.toArray();
                        for(j=0; j< veloArr1.length; j++){
                            veloArr1[j] = Math.floor(veloArr1[j]*2);
                        }
                        game.activeEnemies[q].sphere.setVelocity(veloArr1[0],veloArr1[1],veloArr1[2]);
                        game.activeEnemies[q].slowed = false;
                    }
                }
            },
            onMount: function(node){
                this.id = node.addComponent(this);
                this.node = node;
            },
            onUpdate: function(time){
                if(this.startTime == null){
                    this.startTime = time;
                }
                else{
                    diffTimeST = time - this.startTime;
                    if(diffTimeST > 3000){
                        this.done(this.node);
                        return;
                    }
                    else {
                        percentageST = diffTimeST / 3000;
                        percentageST = 0.9 * (1 - percentageST)
                        this.node.setProportionalSize(percentageST,null);
                    }
                }
                for(g=0; g< game.activeEnemies.length; g++){
                    if(game.activeEnemies[g] != null && !game.activeEnemies[g].slowed){
                        veloArr2 = game.activeEnemies[g].sphere.velocity.toArray();
                        for(h=0; h< veloArr2.length; h++){
                            veloArr2[h] = Math.floor(veloArr2[h]/2);
                        }
                        game.activeEnemies[g].sphere.setVelocity(veloArr2[0],veloArr2[1],veloArr2[2])
                        game.activeEnemies[g].slowed = true;
                    }
                }
                this.node.requestUpdate(this.id);
            }
        }
        slowTimeBarTimerNode.addComponent(slowTimeBarTimerNode.slowTimeBarTimerComponent);
        slowTimeBarTimerNode.requestUpdate(slowTimeBarTimerNode.slowTimeBarTimerComponent.id);
    }else{
        game.slowTimeBarTimerNode.slowTimeBarTimerComponent.startTime = FamousEngine.getClock()._time;
    }
}
Powers.prototype.setInvincible = function(){
    if(!game.invincible){
        game.invincible = true;
        invincibleBarTimerNode = gameUI.addChild();
        game.invincibleBarTimerNode = invincibleBarTimerNode;
        invincibleBarTimerNode.name = "invincibleBarTimerNode";
        invincibleBarTimerNode.setSizeMode('relative','absolute')
            .setAbsoluteSize(null,10)
            .setProportionalSize(0.9,null)
            .setAlign(0.5,0);
        invincibleBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),100,1);
        invincibleBarTimerNode.DOMElement = new DOMElement(invincibleBarTimerNode);
        invincibleBarTimerNode.DOMElement
                .setProperty('background-color','blue')
                .setProperty('opacity','0.5');
        invincibleBarTimerNode.invincibleBarTimerComponent = {
            id:null,
            node:null,
            startTime:null,
            done: function(node){
                if(node.isMounted())node.dismount();
                for(k=0;k<FamousEngine._updateQueue.length;k++){
                    if(FamousEngine._updateQueue[k] == node){
                        FamousEngine._updateQueue.splice(i,1);
                        k--;
                        continue;
                    }
                }
                delete game.invincible;
                delete game.invincibleBarTimerNode.DOMElement;
            },
            onMount: function(node){
                this.id = node.addComponent(this);
                this.node = node;
            },
            onUpdate: function(time){
                if(this.startTime == null){
                    this.startTime = time;
                }
                else{
                    diffTimeI = time - this.startTime;
                    if(diffTimeI > 3000){
                        this.done(this.node);
                        return;
                    }
                    else {
                        percentageI = diffTimeI / 3000;
                        percentageI = 0.9 * (1 - percentageI)
                        this.node.setProportionalSize(percentageI,null);
                    }
                }
                this.node.requestUpdate(this.id);
            }
        }
        invincibleBarTimerNode.addComponent(invincibleBarTimerNode.invincibleBarTimerComponent);
        invincibleBarTimerNode.requestUpdate(invincibleBarTimerNode.invincibleBarTimerComponent.id);
    }else{
        game.invincibleBarTimerNode.invincibleBarTimerComponent.startTime = FamousEngine.getClock()._time;
    }
}
Powers.prototype.setWarp = function(){
    if(!game.warp){
        game.warp = true;
        warpBarTimerNode = gameUI.addChild();
        game.warpBarTimerNode = warpBarTimerNode;
        warpBarTimerNode.name = "warpBarTimerNode";
        warpBarTimerNode.setSizeMode('relative','absolute')
            .setAbsoluteSize(null,10)
            .setProportionalSize(0.9,null)
            .setAlign(0.5,0);
        warpBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),gameSize[1]-130,1);
        warpBarTimerNode.DOMElement = new DOMElement(warpBarTimerNode);
        warpBarTimerNode.DOMElement
                .setProperty('background-color','purple')
                .setProperty('opacity','0.5');
        warpBarTimerNode.warpBarTimerComponent = {
            id:null,
            node:null,
            startTime:null,
            done: function(node){
                if(node.isMounted())node.dismount();
                for(l=0;l<FamousEngine._updateQueue.length;l++){
                    if(FamousEngine._updateQueue[l] == node){
                        FamousEngine._updateQueue.splice(l,1);
                        l--;
                        continue;
                    }
                }
                delete game.warp;
                delete game.warpBarTimerNode.DOMElement;
                game.idle = true;
                game.previousPosition = null;
            },
            onMount: function(node){
                this.id = node.addComponent(this);
                this.node = node;
            },
            onUpdate: function(time){
                if(this.startTime == null){
                    this.startTime = time;
                }
                else{
                    diffTimeW = time - this.startTime;
                    if(diffTimeW > 5000){
                        this.done(this.node);
                        return;
                    }
                    else {
                        percentageW = diffTimeW / 5000;
                        percentageW = 0.9 * (1 - percentageW)
                        this.node.setProportionalSize(percentageW,null);
                    }
                }
                this.node.requestUpdate(this.id);
            }
        }
        warpBarTimerNode.addComponent(warpBarTimerNode.warpBarTimerComponent);
        warpBarTimerNode.requestUpdate(warpBarTimerNode.warpBarTimerComponent.id);
    }else{
        game.warpBarTimerNode.warpBarTimerComponent.startTime = FamousEngine.getClock()._time;
    }
}
Powers.prototype.setMagenetic = function(){
    if(!game.magnetic){
        game.magnetic = true;
        magneticBarTimerNode = gameUI.addChild();
        game.magneticBarTimerNode = magneticBarTimerNode;
        magneticBarTimerNode.name = "magneticBarTimerNode";
        magneticBarTimerNode.setSizeMode('relative','absolute')
            .setAbsoluteSize(null,10)
            .setProportionalSize(0.9,null)
            .setAlign(0.5,0);
        magneticBarTimerNode.setPosition(-(Math.floor((gameSize[0] * .9)/2)),gameSize[1]-100,1);
        magneticBarTimerNode.DOMElement = new DOMElement(magneticBarTimerNode);
        magneticBarTimerNode.DOMElement
                .setProperty('background-color','grey')
                .setProperty('opacity','0.4');
        magneticBarTimerNode.magneticBarTimerComponent = {
            id:null,
            node:null,
            startTime:null,
            done: function(node){
                if(node.isMounted())node.dismount();
                for(m=0;m<FamousEngine._updateQueue.length;m++){
                    if(FamousEngine._updateQueue[m] == node){
                        FamousEngine._updateQueue.splice(m,1);
                        m--;
                        continue;
                    }
                }
                delete game.magnetic;
                delete game.magneticBarTimerNode.DOMElement;
            },
            onMount: function(node){
                this.id = node.addComponent(this);
                this.node = node;
            },
            onUpdate: function(time){
                if(this.startTime == null){
                    this.startTime = time;
                }
                else{
                    diffTimeM = time - this.startTime;
                    if(diffTimeM > 5000){
                        this.done(this.node);
                        return;
                    }
                    else {
                        percentageM = diffTimeM / 5000;
                        percentageM = 0.9 * (1 - percentageM)
                        this.node.setProportionalSize(percentageM,null);
                    }
                }
                if(game.gravity)
                    game.gravity.update();
                gravity = new Gravity3D(game.boxNode.box, game.attractables, {
                    strength:10
                });
                game.gravity = gravity;

                this.node.requestUpdate(this.id);
            }
        }
        magneticBarTimerNode.addComponent(magneticBarTimerNode.magneticBarTimerComponent);
        magneticBarTimerNode.requestUpdate(magneticBarTimerNode.magneticBarTimerComponent.id);
    }else{
        game.magneticBarTimerNode.magneticBarTimerComponent.startTime = FamousEngine.getClock()._time;
    }
}

module.exports = Powers;
