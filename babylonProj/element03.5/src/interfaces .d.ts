import {
    Scene,
    Mesh,
    HemisphericLight,
    PointLight,
    SpotLight,
    DirectionalLight,
    Camera,
    ShadowGenerator,
  } from "@babylonjs/core";
  
  export interface SceneData {
    scene: Scene;
    box: Mesh;
    lightBulb: PointLight;
    lightDirectional?: DirectionalLight;
    lightSpot: SpotLight;
    lightHemispheric: HemisphericLight;
    sphere: Mesh;
    ground: Mesh;
    camera: Camera;
    shadowGenerator: ShadowGenerator;
  }
  