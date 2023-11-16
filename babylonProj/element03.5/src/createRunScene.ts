import { SceneData } from "./interfaces ";

import { createxSlide, createySlide, createxRotate, createyRotate, createV3scaling,  createColorShift, frameRate } from "./animations";


export default function createRunScene(runScene: SceneData) {
  runScene.sphere.position.y = -2;    

  runScene.box.animations.push(createxSlide(frameRate));
  runScene.box.animations.push(createySlide(frameRate));
  runScene.box.animations.push(createxRotate(frameRate));
  runScene.box.animations.push(createyRotate(frameRate));
  runScene.box.animations.push(createV3scaling(frameRate));
  runScene.box.animations.push(createColorShift(frameRate));
  runScene.scene.beginAnimation(runScene.box, 0, 2 * frameRate, true);
}                                   