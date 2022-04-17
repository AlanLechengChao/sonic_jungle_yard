<template>
<div id="canvasContainer">
    
    <button id="start" @click="connect()">start audio</button>
</div>
<div id="info">
    <label for="master">master volume</label>
    <br>
    <input type="range" name="master" v-model="master" min="0" max="0.3" step="0.001" @input="trigger()">
    <br>
    <!-- <b>just drag</b> -->
    <!-- <p>{{this.master}}</p> -->
    
</div>

</template>

<script>
import p5 from "p5";
// import * as Tone from "tone";
import SoundObject from "@/components/SoundObject.js";
import { el } from '@elemaudio/core';
// import WebRenderer from '@elemaudio/web-renderer-lite';
import {core, ctx} from '@/main.js';
// export const ctx = new (window.AudioContext || window.webkitAudioContext)();
// export const core = new WebRenderer();

export default {
data() {
    return {
    width: 1000,
    height: 600,
    soundObjs: [],
    prevMouseX: 0,
    prevMouseY: 0,
    plucking: false,
    out: el.const(0),
    master: 0.02,
    sketch: null
    }
},
    methods: {
        async connect() {
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }
            let c = document.getElementById('canvasContainer');
            c.removeChild(c.querySelector('button'));
            let p5inst = new p5(this.sketch, 'canvasContainer');
        },
        trigger() {
            this.master = parseFloat(this.master);
            this.out = el.const(0);
            this.soundObjs.forEach((e) => {
                
                e.env = el.adsr(0.02, 2, 0.05, 1, el.mul(el.train(e.freq/1000), e.gate));
                // console.log(e.env);
                this.out = el.add(this.out, el.mul(e.env, el.cycle(e.freq)));
            });
            this.out = el.mul(this.master, this.out);
            core.render(this.out,this.out);
        }
    },
    mounted() {
        
        const v = this;
        core.on('load', function() {
            console.log('core loaded');
            // let out = el.const(0);
            // v.soundObjs.forEach((e) => {
            //     v.out = el.add(v.out, el.mul(0.01, el.cycle(e.freq)));
            // })
            core.render(v.out,v.out);
        });
        this.sketch = function(s) {
            s.preload = () => {
                for (let i = 0; i < 8; i++){
                    v.soundObjs.push(new SoundObject(s, s.random(100,v.width-100),s.random(100,v.height-100)));
                }
                v.soundObjs.forEach(element => {
                    element.initPoints();
                });
                
            }
            s.setup = () => {
                s.createCanvas(v.width, v.height);
                s.colorMode(s.HSB);
            }
            s.draw = () => {
                s.background(200, 40, 96);
                let mouseOnCounter = 0;

                s.stroke(0);
                // if (v.plucking) s.line(v.prevMouseX,v.prevMouseY,s.mouseX, s.mouseY, 10);
                v.soundObjs.forEach((element,i) => {
                    if(v.plucking && element.intersection(v.prevMouseX,v.prevMouseY,s.mouseX, s.mouseY)){ 
                        element.oscillate(1);
                        if(!element.noteOn) {
                            element.noteOn = true;
                            v.trigger();
                        }
                    }
                    else {
                        element.oscillate(0);
                        if(element.noteOn) {
                            element.noteOn = false;
                            v.trigger();
                        }
                    }
                    mouseOnCounter += element.drawVisual();
                });
            
                // core.render(v.out,v.out);

                if (mouseOnCounter) document.body.style.cursor = 'pointer';
                else document.body.style.cursor = 'default';
                
            }
            s.mouseDragged = () => {
                let dragging = v.soundObjs.every(element => {
                    if (element.point1.mouseOn) {
                        element.point1.setCoord([s.mouseX, s.mouseY]);
                        element.updatePoints();
                        // if(!element.noteOn) {
                        //     element.noteOn = true;
                        //     v.trigger();
                        // }
                        return false
                    }
                    else if (element.point2.mouseOn) {
                        element.point2.setCoord([s.mouseX, s.mouseY]);
                        element.updatePoints();
                        // if(!element.noteOn) {
                        //     element.noteOn = true;
                        //     v.trigger();
                        // }
                        return false
                    }
                    else {
                        // if(element.noteOn) {
                        //     element.noteOn = false;
                        //     v.trigger();
                        // }
                        return true
                        }
                })
                v.plucking = dragging;
            }
            s.mouseMoved = () => {
                v.prevMouseX = s.mouseX;
                v.prevMouseY = s.mouseY;
            }
        }
        
}
}
</script>

<style scoped>

#canvasContainer {
    position: absolute;
    top: calc(50% - v-bind(height + "px")/2);
    left: calc(50% - v-bind(width + "px")/2);
    margin: 0;
    width: v-bind(width + "px");
    height: v-bind(height + "px");
    z-index: 99;
    border: 5px solid white;
    border-radius: 5px;
    box-shadow: 0px 20px 20px silver;
}

#canvasContainer > canvas {
    z-index: 100;

}

#start {
    border-radius: 5px;
    border: none;
    background-color: blue;
    color: aliceblue;
    cursor: pointer;
    width: 100px;
    font-size: 1em;
    font-family: monospace;
    padding: 0.4em;
}

#info {
    margin: 2em;
}
</style>