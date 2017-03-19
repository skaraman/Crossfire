'use strict';
var Transitionable = require('famous/transitions/Transitionable');
var Node = require('famous/core/Node');
var DOMElement = require('famous/dom-renderables/DOMElement');
function Framedata() {
  var ms = (1/60)*300 // "ms":ms= 1 frame @ 60FPS
  this.framedata = {
    'astro': {
      'loop': {
        'frames': [
          { 'x': 80, "y": 120, "ms": ms},
          { 'x': 160, "y": 120, "ms": ms},
          { 'x': 240, "y": 120, "ms": ms},
          { 'x': 320, "y": 120, "ms": ms},
          { 'x': 400, "y": 120, "ms": ms},
          { 'x': 480, "y": 120, "ms": ms},
          { 'x': 560, "y": 120, "ms": ms},
          { 'x': 0, "y": 240, "ms": ms},
          { 'x': 80, "y": 240, "ms": ms},
          { 'x': 160, "y": 240, "ms": ms},
          { 'x': 240, "y": 240, "ms": ms},
          { 'x': 320, "y": 240, "ms": ms},
          { 'x': 400, "y": 240, "ms": ms},
          { 'x': 480, "y": 240, "ms": ms},
          { 'x': 560, "y": 240, "ms": ms},
        ],
        'frameIterator': 0,
        'msTimer': 0,
        'looping': true
      }
    }
  };
};


Framedata.prototype.addAnimationComponent = function addAnimationComponent(char){
  var myComponent = {
    id: null,
    node: null,
    done: function(node) {
        node.framedata.active.frameIterator = 0;
        node.framedata.active.msTimer = 0;
        node.framedata.active = null;
        node.animationTransitionable.halt();
    },
    onMount: function (node) {
        this.id = node.addComponent(this);
        this.node = node;
    },
    onReceive: function (event, payload) {
      var framedata = this.node.framedata;
      if (framedata[event]) {
        if(!framedata.active){
          framedata.active = framedata[event];
          framedata.active.event = event;
          framedata.active.frameIterator = 0;
          if((typeof payload.looping) != 'undefined')
            framedata.active.looping = payload.looping;
          if((typeof payload.interruptable) != 'undefined')
            framedata.active.interruptable = payload.interruptable;
        }
        if((typeof framedata.active.interruptable) != 'undefined'){
          if(framedata.active.interruptable == false){
            payload.interrupt = false;
          }
        }
        if (framedata.active.frameIterator < 1 || payload.interrupt) {
          if(payload.interrupt){
            if(this.node.animationTransitionable)
              this.node.animationTransitionable.halt();
            framedata.active.frameIterator = 0;
          }
          framedata.active = framedata[event];
          framedata.active.event = event;
          if((typeof payload.interruptable) != 'undefined')
            framedata.active.interruptable = payload.interruptable;
          var frames = framedata.active.frames;
          var duration=0;
          for(x=0; x < frames.length; x++){
            duration += frames[x].ms;
          }
          framedata.active.duration = duration;
          this.node.animationTransitionable = new Transitionable(0);
          this.node.requestUpdate(this.id);
          this.node.animationTransitionable.from(0).to(
            duration,
            'linear',
            duration,
            null,
            this.done,
            this.node);
        }
      }
    },
    onUpdate: function() {
      var framedata = this.node.framedata;
      if(framedata.active){
        var animation = framedata.active;
        var frames = animation.frames;
        var transition = this.node.animationTransitionable;
        var grace = 2;
        var ratio = 1
        if(this.node.ratio) ratio = this.node.ratio;
        if(transition._state < 1){
          animation.frameIterator = 0;
          animation.msTimer = 0;
        }
        if(animation.frameIterator < frames.length){
          if(transition._state <
            (animation.msTimer +
               frames[animation.frameIterator].ms + grace)
          && transition._state >= (animation.msTimer - grace)
          && animation != null) {
            this.node.DOMElement.setProperty(
              'background-position','-' +
              (frames[animation.frameIterator].x*ratio)
              + 'px ' + '-' +
              (frames[animation.frameIterator].y*ratio) + 'px')
            animation.msTimer += frames[animation.frameIterator].ms;
            animation.frameIterator++;
            forceMove = transition.get();
            this.node.requestUpdate(this.id);
          }
          else if(transition.isActive()) {
            forceMove = transition.get();
            this.node.requestUpdate(this.id);
          }
        }else if(animation.frameIterator >= frames.length){
          if(transition.isActive()){
            transition.halt();
          }
          if(animation.looping){
            animation.frameIterator = 0;
            transition.from(0).to(
              framedata.active.duration,
              'linear',
              framedata.active.duration,
              null,
              this.done,
              this.node);
            this.node.requestUpdate(this.id);
          }else{
            framedata.active = null;
          }
        }
      }
    }
  }
  char.addComponent(myComponent);
}


module.exports = new Framedata();
