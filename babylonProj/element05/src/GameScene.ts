//----------------------Ross-Lamont-------------------------------
//TOP OF CODE - IMPORTING BABYLONJS
import setSceneIndex from "./index";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    Vector4,
    HemisphericLight,
    SpotLight,
    MeshBuilder,
    Mesh,
    Light,
    Camera,
    Engine,
    StandardMaterial,
    Texture,
    Color3,
    Space,
    ShadowGenerator,
    PointLight,
    DirectionalLight,
    CubeTexture,
    Sprite,
    SpriteManager,
    SceneLoader,
    ActionManager,
    ExecuteCodeAction,
    AnimationPropertiesOverride,
    Sound,
  } from "@babylonjs/core";
  import * as GUI from"@babylonjs/gui";
  import HavokPhysics from "@babylonjs/havok";
  import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
  //----------------------------------------------------


  let initializedHavok;

  HavokPhysics().then((havok) => {
    initializedHavok = havok;
  });
  
  const havokInstance = await HavokPhysics();
  const havokPlugin = new HavokPlugin(true, havokInstance);
  globalThis.HK = await HavokPhysics();
  //-----------------------------------------------

    
  globalThis.HK = await HavokPhysics();
  //MIDDLE OF CODE - FUNCTIONS
  let keyDownMap: any[] = [];

  function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number) {
    let tempItem = { flag: false } 
    let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons) {
      let mesh = newMeshes[0];
      let skeleton = skeletons[0];
      skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
      skeleton.animationPropertiesOverride.enableBlending = true;
      skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
      skeleton.animationPropertiesOverride.loopMode = 1; 

      let walkRange: any = skeleton.getAnimationRange("YBot_Walk");
      // let runRange: any = skeleton.getAnimationRange("YBot_Run");
      // let leftRange: any = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
      // let rightRange: any = skeleton.getAnimationRange("YBot_RightStrafeWalk");
      // let idleRange: any = skeleton.getAnimationRange("YBot_Idle");

      let animating: boolean = false;

      scene.onBeforeRenderObservable.add(()=> {
        let keydown: boolean = false;
        if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
          mesh.position.z += 0.1;
          mesh.rotation.y = 0;
          keydown = true;
        }
        if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
          mesh.position.x -= 0.1;
          mesh.rotation.y = 3 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
          mesh.position.z -= 0.1;
          mesh.rotation.y = 2 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
          mesh.position.x += 0.1;
          mesh.rotation.y = Math.PI / 2;
          keydown = true;
        }

        if (keydown) {
          if (!animating) {
            animating = true;
            scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
          }
        } else {
          animating = false;
          scene.stopAnimation(skeleton);
        } 
        //collision 
        if (mesh.intersectsMesh(collider)){
          console.log("COLLIDED");
        }

      });
      // physicis colision 
      item = mesh;
      let playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE,{mass: 0},scene);
      playerAggregate.body.disablePreStep = false;
    });
    return item;
  }

  function actionManager(scene: Scene){
    scene.actionManager = new ActionManager(scene);

    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyDownTrigger,
          //parameters: 'w'
        },
        function(evt) {keyDownMap[evt.sourceEvent.key] = true; }
      )
    );
    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnKeyUpTrigger
        },
        function(evt) {keyDownMap[evt.sourceEvent.key] = false; }
      )
    );
    return scene.actionManager;
  } 

  //Create more detailed ground
  function createBox(scene, x: number, y: number, z: number){
    let box: Mesh = MeshBuilder.CreateIcoSphere("box",{ radius: 0.3}, scene);
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;
    const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.SPHERE, { mass: 1 }, scene);
    return box;
  }
  function createGoalPost(scene: Scene, x: number, y: number, z: number, distanceBetweenPosts: number) {
    // Create the main pole on the left
    let leftPole = MeshBuilder.CreateCylinder("goalPostLeftPole", { height: 4, diameter: 0.2 }, scene);
    leftPole.position = new Vector3(x - distanceBetweenPosts / 2, y + 2, z);

    // Create the main pole on the right
    let rightPole = MeshBuilder.CreateCylinder("goalPostRightPole", { height: 4, diameter: 0.2 }, scene);
    rightPole.position = new Vector3(x + distanceBetweenPosts / 2, y + 2, z);

    // Create the crossbar
    let crossbar = MeshBuilder.CreateCylinder("goalPostCrossbar", { height: 0.1, diameter: distanceBetweenPosts }, scene);
    crossbar.position = new Vector3(x, y + 4, z);

    // Create the goal post physics
    const leftPoleAggregate = new PhysicsAggregate(leftPole, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
    const rightPoleAggregate = new PhysicsAggregate(rightPole, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
    const crossbarAggregate = new PhysicsAggregate(crossbar, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);

    return { leftPole, rightPole, crossbar };
}
    
  function createGround(scene: Scene) {
    const ground: Mesh = MeshBuilder.CreateGround("ground", {height: 10, width: 10, subdivisions: 4});
    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    return ground;
  }

  //----------------------------------------------------------------------------------------------
  //Create Skybox
  function createSkybox(scene: Scene) {
    //Skybox
    const skybox = MeshBuilder.CreateBox("skyBox", {size:150}, scene);
	  const skyboxMaterial = new StandardMaterial("skyBox", scene);
	  skyboxMaterial.backFaceCulling = false;
	  skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox", scene);
	  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	  skyboxMaterial.specularColor = new Color3(0, 0, 0);
	  skybox.material = skyboxMaterial;
    return skybox;
  }
  



  function createAnyLight(scene: Scene, index: number, px: number, py: number, pz: number, colX: number, colY: number, colZ: number, mesh: Mesh) {
    // only spotlight, point and directional can cast shadows in BabylonJS
    switch (index) {
      case 1: //hemispheric light
        const hemiLight = new HemisphericLight("hemiLight", new Vector3(px, py, pz), scene);
        hemiLight.intensity = 0.1;
        return hemiLight;
        break;
      case 2: //spot light
        const spotLight = new SpotLight("spotLight", new Vector3(px, py, pz), new Vector3(0, -1, 0), Math.PI / 3, 10, scene);
        spotLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
        let shadowGenerator = new ShadowGenerator(1024, spotLight);
        shadowGenerator.addShadowCaster(mesh);
        shadowGenerator.useExponentialShadowMap = true;
        return spotLight;
        break;
      case 3: //point light
        const pointLight = new PointLight("pointLight", new Vector3(px, py, pz), scene);
        pointLight.diffuse = new Color3(colX, colY, colZ); //0.39, 0.44, 0.91
        shadowGenerator = new ShadowGenerator(1024, pointLight);
        shadowGenerator.addShadowCaster(mesh);
        shadowGenerator.useExponentialShadowMap = true;
        return pointLight;
        break;
    }
  }
 
  function createHemiLight(scene: Scene) {
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    return light;
  }

  //PREVIOUS METHODS
  // function createSpotLight(scene: Scene, px: number, py: number, pz: number) {
  //   var light = new SpotLight("spotLight", new Vector3(-1, 1, -1), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);
  //   light.diffuse = new Color3(0.39, 0.44, 0.91);
	//   light.specular = new Color3(0.22, 0.31, 0.79);
  //   return light;
  // }
  
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
  //----------------------------------------------------------
  
  //----------------------------------------------------------
  //BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      box?: Mesh;
      pole?: Mesh;
      crossbar?:Mesh;
      ground?: Mesh;
      importMesh?: any;
      actionManager?: any;
      skybox?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
      
    }
  
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    // initialising physics! wooo!!! 
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);

    //any further code goes here-----------




    //-------------------------------------

    that.ground = createGround(that.scene);
    that.box = createBox(that.scene, 2, 2, 2);
    that.importMesh = importPlayerMesh(that.scene, that.box, 0, 0);
    that.actionManager = actionManager(that.scene);
    that.skybox = createSkybox(that.scene);
    const goalPosts = createGoalPost(that.scene, 0, 0, -5, 4); // Adjust 4 to the desired distance

    

    that.crossbar = goalPosts.crossbar;
    
    //Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    return that;
  }