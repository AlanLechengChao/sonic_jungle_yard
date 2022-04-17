import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import * as Tone from "tone"
import p5 from "p5"

import { el } from '@elemaudio/core';
import WebRenderer from '@elemaudio/web-renderer-lite';

export const ctx = new (window.AudioContext || window.webkitAudioContext)();
export const core = new WebRenderer();


// core.on('load', function() {
//   core.render(el.cycle(440), el.cycle(440));
// });

(async function main() {
    let node = await core.initialize(ctx, {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
    });

    node.connect(ctx.destination);
})();

const app = createApp(App)


app.use(router)

app.mount('#app')


function setup() {
    createCanvas(500,500);
    background(220);
}