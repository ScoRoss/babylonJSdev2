import { Engine } from "@babylonjs/core";
import MenuScene from "./MenuScene";
import GameScene from "./GameScene";
import './main.css';
const CanvasName = "renderCanvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;

canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

let scene;
let scenes: any[] = [];

let eng = new Engine(canvas, true, {}, true);
scenes[0] = MenuScene(eng);
scenes[1] = GameScene(eng);

scene = scenes[0].scene;
setSceneIndex(0);

export default function setSceneIndex(i: number){
    
    eng.runRenderLoop(() => {
        scenes[i].scene.render();
    });   

}

