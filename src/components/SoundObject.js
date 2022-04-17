import p5 from "p5";

import { el } from '@elemaudio/core';
import { core, ctx } from '@/main.js';


function l2f(length) {
    return 88000 * 1/length
}



class Point {
    constructor(sketch, x, y) {
        this.s = sketch;
        this.coord = [x,y];
        this.r = 16;
        this.mouseOn = false;
        this.locked = false;
    }
    setCoord(coord) {
        this.coord = coord;
    }
    updateMouse(mX, mY) {
        if (this.s.dist(mX, mY, this.coord[0], this.coord[1]) < this.r) {
            this.mouseOn = true;
        }else {
            this.mouseOn = false;
        }
    }

    drawPoint() {
        this.s.push();
        this.s.stroke(30);
        if (this.mouseOn) this.s.fill(180,80,80);
        else this.s.fill(255);
        this.s.circle(this.coord[0],this.coord[1],this.r);
        this.s.pop();
    }
}


export default class SoundObject {
    constructor(sketch, x, y) {
        this.s = sketch;
        this.initCoord = [x,y];
        this.point1 = new Point(sketch);
        this.point2 = new Point(sketch);
        this.quadPoint = [0,0];
        this.quadOsc = [0,0];
        this.k = 0;
        this.length = 0;
        this.freq = 0;
        this.gate = 0;
        this.voiceNode = null;
        this.ropeColor = [10,81,86];
        this.noteOn = false;
        this.env = null;
    }
    initPoints() {
        this.point1.setCoord(this.initCoord.map(e => this.s.random(e-100,e+100)));
        this.point2.setCoord(this.initCoord.map(e => this.s.random(e - 100, e + 100)));
        this.length = this.s.dist(this.point1.coord[0], this.point1.coord[1], this.point2.coord[0], this.point2.coord[1]);
        this.freq = l2f(this.length);
        // this.voiceNode = el.mul(this.gate, el.cycle(this.freq));
        this.k = (this.point1.coord[0] - this.point2.coord[0]) / (this.point2.coord[1] - this.point1.coord[1]);
        this.quadPoint = this.quadPoint.map((e,i) => (this.point1.coord[i] + this.point2.coord[i]) / 2);
    }
    intersection(pMX,pMY,mX,mY) {
        if (
            this.s.max(mX,pMX) < this.s.min(this.point1.coord[0], this.point2.coord[0]) || 
            this.s.max(mY, pMY) < this.s.min(this.point1.coord[1], this.point2.coord[1]) ||
            this.s.max(this.point1.coord[0], this.point2.coord[0]) < this.s.min(mX, pMX) ||
            this.s.max(this.point1.coord[1], this.point2.coord[1]) < this.s.min(mY, pMY)
        ) return false;
        
        if ( 
            Math.sign(p5.Vector.cross(this.s.createVector(pMX, this.point1.coord[0]), this.s.createVector(pMY, this.point1.coord[1]))) ==
            Math.sign(p5.Vector.cross(this.s.createVector(mX, this.point1.coord[0]), this.s.createVector(mY, this.point1.coord[1]))) ||
            Math.sign(p5.Vector.cross(this.s.createVector(pMX, this.point2.coord[0]), this.s.createVector(pMY, this.point2.coord[1]))) ==
            Math.sign(p5.Vector.cross(this.s.createVector(mX, this.point2.coord[0]), this.s.createVector(mY, this.point2.coord[1])))
        ) return false;
        return true
    }

    updatePoints() {
        this.length = this.s.dist(this.point1.coord[0], this.point1.coord[1], this.point2.coord[0], this.point2.coord[1]);
        this.freq = l2f(this.length);
        this.k = (this.point1.coord[0] - this.point2.coord[0]) / (this.point2.coord[1] - this.point1.coord[1]);
        this.quadPoint = this.quadPoint.map((e, i) => (this.point1.coord[i] + this.point2.coord[i]) / 2);
    }
    oscillate(amp) {
        this.gate = amp;
        // this.voiceNode = el.mul(this.gate, el.cycle(this.freq));
        let osc = this.gate * 20 * this.s.sin(this.s.millis()/this.length*2);
        let brightness = this.s.map(Math.abs(osc), 0, 10, 30, 100);
        // this.ropeColor[2] = brightness;
        if (Math.abs(this.k) < 1){
            this.quadOsc[0] = this.quadPoint[0] + osc;
            this.quadOsc[1] = this.quadPoint[1] + this.k * osc;
        }else {
            this.quadOsc[0] = this.quadPoint[0] + osc/this.k;
            this.quadOsc[1] = this.quadPoint[1] + osc;
        }
    }
    drawVisual() {
        
        this.s.push();
        
        this.s.strokeWeight(4);
        this.s.stroke(this.ropeColor[0],this.ropeColor[1],this.ropeColor[2]);
        this.s.noFill();
        this.s.beginShape();
        this.s.vertex(this.point1.coord[0], this.point1.coord[1]);
        this.s.quadraticVertex(this.quadOsc[0], this.quadOsc[1], this.point2.coord[0], this.point2.coord[1]);
        this.s.endShape();
        this.point1.drawPoint();
        this.s.push();
        this.s.strokeWeight(1);
        this.s.text(`${this.freq.toFixed(1)}`, this.point1.coord[0], this.point1.coord[1]+ 20);
        this.s.pop();
        this.point1.updateMouse(this.s.mouseX, this.s.mouseY);
        this.point2.drawPoint();
        this.point2.updateMouse(this.s.mouseX, this.s.mouseY);
        this.s.pop();
        return (this.point1.mouseOn || this.point2.mouseOn) ? 1 : 0
    }
}
