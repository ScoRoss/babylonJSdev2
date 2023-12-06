//--------------------------------------------------
//TOP OF CODE - IMPORTING BABYLONJS
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    Vector4,
    HemisphericLight,
    MeshBuilder,
    Mesh,
    Light,
    Camera,
    Engine,
    StandardMaterial,
    Texture,
    SpotLight,
    Color3,
    DirectionalLight,
    ShadowGenerator,
    GroundMesh,
    Animation, 
    SceneLoader,
    CubeTexture,
    ShadowLight,
} from "@babylonjs/core"
import { shadowMapFragment } from "@babylonjs/core/Shaders/ShadersInclude/shadowMapFragment";
import { lightFragment } from "@babylonjs/core/Shaders/ShadersInclude/lightFragment";
//-----------------------------------------------------


//--------------------------------------
//MIDDLE OF CODE - FUNCTIONS
function createGround(scene: Scene) {
  const mat = new StandardMaterial("mat");
  const color = new Color3(0.22, 0.03, 0.89);
  mat.diffuseColor = color;
  let ground = MeshBuilder.CreateGround(
    "ground",
    { width: 30, height: 25 },
    scene,
  );
  ground.material = mat;

  ground.receiveShadows = true;
  return ground;
}


  function createBox(scene: Scene, px: number, py:number, pz:number, sx: number, sy: number, sz: number) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://www.babylonjs-playground.com/textures/sphereMap.png");
    mat.diffuseTexture = texture;
    let box = MeshBuilder.CreateBox("box",{size: 1}, scene);
    box.position = new Vector3(px, py, pz);
    box.scaling = new Vector3(sx, sy, sz);
    //box.position.y = 3;
    box.material = mat;
    return box;
  }

  //faced box function
  function createFacedBox(scene: Scene, px: number, py: number, pz: number) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://www.babylonjs-playground.com/textures/bloc.jpg");
    mat.diffuseTexture = texture;
    
    const faceUV = [];
    faceUV[0] = new Vector4(0.0, 0.0, 0.5, 1.0); //rear face
    faceUV[1] = new Vector4(0.25, 0, 0.5, 1.0); //front face
    faceUV[2] = new Vector4(0.5, 0.0, 0.5, 1.0); //right side
    faceUV[3] = new Vector4(0.75, 0, 0.5, 1.0); //left side

    
    

    let box = MeshBuilder.CreateBox("box", {faceUV: faceUV, wrap: true});
    box.material = mat;
    box.position = new Vector3(px, py, pz);
    
    
    return box;
  }

  
  function createLight(scene: Scene, mesh: Mesh) {
    const light = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene);
    light.position = new Vector3(10, 20, 10);
    light.shadowEnabled = true;
    let shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.addShadowCaster(mesh);
    shadowGenerator.useExponentialShadowMap = true;
 
    return light;
  }
 
  function createLightSphere(scene: Scene) {
    const mat = new StandardMaterial("light");
    const color = new Color3(1,1,0);
     mat.diffuseColor = color;
    var lightSphere = Mesh.CreateSphere("sphere", 10, 2, scene);
    lightSphere.material = mat;
    lightSphere.position = new Vector3(10, 20, 10);
    
    return lightSphere;
  }



  function createTorus(scene: Scene, px: number, py: number, pz: number) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://www.babylonjs-playground.com/textures/leopard_fur.JPG");
    mat.diffuseTexture = texture;
    var torus = Mesh.CreateTorus("torus", 4, 2, 30, false);
    torus.position = new Vector3(px, py, pz);
    const frameRate = 10;
    torus.material = mat;
 
    const xSlide = new Animation("xSlide", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
  const keyFrames = []; 

    keyFrames.push({
        frame: 0,
        value: 2
    });

    keyFrames.push({
        frame: frameRate,
        value: -2
    });

    keyFrames.push({
        frame: 2 * frameRate,
        value: 2
    });

    xSlide.setKeys(keyFrames);

    scene.beginDirectAnimation(torus, [xSlide], 0, 2 * frameRate, true);  
    
  }

//  function createShadow(scene: Scene) {
 //    const shadow = new ShadowGenerator(1024, light);
 //    shadow.getShadowMap().renderList.push(torus);
 //    shadow.useBlurExponentialShadowMap = true;
//    shadow.useKernelBlur = true;
 //    shadow.blurKernel = 64;
//   }
  


  function createSpotLight(scene: Scene, px: number, py: number, pz: number) {
    var light = new SpotLight("spotLight", new Vector3(-1, 1, -1), new Vector3(0, -1, 0), Math.PI / 2, 120, scene);
    light.diffuse = new Color3(1, 0, 0);
	  light.specular = new Color3(0, 1, 0);
    
    return light;
  }


  
  


  function createSphere(scene: Scene) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://www.babylonjs-playground.com/textures/lava/lavatile.jpg");
    mat.diffuseTexture = texture;
    let sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2, segments: 32 },
      scene,
    );
    sphere.position.y = 1;
    sphere.material = mat;
    return sphere;
  }

  
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 10,
      camTarget = new Vector3(0, 0, 0);
    let camera = new ArcRotateCamera(
      "camera1",
      camAlpha,
      camBeta,
      camDist,
      camTarget,
      scene,
    );
    camera.attachControl(true);
    return camera;
  }
  

//----------------------------------------------------------------


//BOTTOM OF CODE - MAIN RENDERING AREA 

  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      faceBox?: Mesh;
      torus?: Mesh;
      light?: Light;
      spotlight?: SpotLight;
      shadowGen?: ShadowGenerator;
      sphere?: Mesh;
      lightSphere?: Mesh;
      ground?: Mesh;
      camera?: Camera;
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
  
    //createBox(scene, posX, posY, posZ, scalX, scalY, scalZ)
    that.box = createBox(that.scene, 2, 5, 3, 3, 2, 1);
    that.box = createBox(that.scene, 2, 3, 3, 5, 2, 4);
    that.faceBox = createFacedBox(that.scene, 2, 2, 8)
    that.faceBox = createFacedBox(that.scene, 6, 6, 8)
    
    
    //sun();
    that.torus = createTorus(that.scene, -30, 3, 3);
    that.lightSphere = createLightSphere(that.scene);
    
   // that.spotlight = createSpotLight(that.scene, 0, 6, 0);
    that.sphere = createSphere(that.scene);
    that.ground = createGround(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    that.light = createLight(that.scene, that.box);
    return that;
  }

//----------------------------------------------------------------