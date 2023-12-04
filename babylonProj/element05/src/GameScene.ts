//-----------------------------------------------------
import setSceneIndex from "./index";
//Ross Lamont
//TOP OF CODE - IMPORTING BABYLONJS
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
  } from "@babylonjs/core";
  import HavokPhysics from "@babylonjs/havok";
  import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
  import { AdvancedDynamicTexture, Button } from "@babylonjs/gui/2D";

  let sceneData;
  //----------------------------------------------------
  
  //----------------------------------------------------
  //Initialisation of Physics (Havok)
  let initializedHavok;
  HavokPhysics().then((havok) => {
    initializedHavok = havok;
  });

  const havokInstance = await HavokPhysics();
  const havokPlugin = new HavokPlugin(true, havokInstance);

  globalThis.HK = await HavokPhysics();
  //-----------------------------------------------------
  function resetGame() {
    // Reset the ball position
    if (sceneData.sphere) {
      sceneData.sphere.position = new Vector3(2, 2, 2); // Set the initial position
    }
    // MOVED CODE UP HERE BECAUSE MAKING IT GLOBAL WOULD HAVE MADE IT WORK IF IT WAS A THING THAT ACTUALLY WORKED EH ???? 
    // Clear any goal-related flags
    //goalScored = false;
  
    console.log("Game reset!");
  }

  //MIDDLE OF CODE - FUNCTIONS
  let score = 0;
  let keyDownMap: any[] = [];
  let currentSpeed: number = 0.1;
  let walkingSpeed: number = 0.1;
  let runningSpeed: number = 0.4;

  function importPlayerMesh(scene: Scene, collider: Mesh, x: number, y: number) {
    let tempItem = { flag: false } 
    let item: any = SceneLoader.ImportMesh("", "./models/", "dummy3.babylon", scene, function(newMeshes, particleSystems, skeletons, animationGroups, ) {
      let mesh = newMeshes[0];
      let skeleton = skeletons[0];
      skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
      skeleton.animationPropertiesOverride.enableBlending = true;
      skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
      skeleton.animationPropertiesOverride.loopMode = 1; 

      //adapted from: www.babylonjs-playground.com/#LL5BIQ#0
      //another good playground for this is: www.babylonjs-playground.com/#AHQEIB#17
      let idleRange: any = skeleton.getAnimationRange("YBot_Idle");
      let walkRange: any = skeleton.getAnimationRange("YBot_Walk");
      // let runRange: any = skeleton.getAnimationRange("YBot_Run");
      //let leftRange: any = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
      //let rightRange: any = skeleton.getAnimationRange("YBot_RightStrafeWalk");

      //MOVE THESE IF YOU WANT TO TRIGGER ANYWHERE
      //let runAnim: any = scene.beginWeightedAnimation(skeleton, runRange.from, runRange.to, 1.0, true);
      //let leftAnim: any = scene.beginWeightedAnimation(skeleton, leftRange.from, leftRange.to, 1.0, true);
      //let rightAnim: any = scene.beginWeightedAnimation(skeleton, rightRange.from, rightRange.to, 1.0, true);

      //Speed and Rotation Variables
      let speed: number = 0.03;
      let speedBackward: number = 0.01;
      let rotationSpeed = 0.05;

      //Animation Variables
      let idleAnim: any;
      let walkAnim: any;
      let animating: boolean = false;

      scene.onBeforeRenderObservable.add(()=> {
        let keydown: boolean = false;
        if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
          mesh.moveWithCollisions(mesh.forward.scaleInPlace(speed));                
          //Previous code
          //mesh.position.z += 0.01;
          //mesh.rotation.y = 0;
          keydown = true;
        }
        if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
          mesh.rotate(Vector3.Up(), -rotationSpeed);
          //Previous code
          //mesh.position.x -= 0.01;
          //mesh.rotation.y = 3 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
          mesh.moveWithCollisions(mesh.forward.scaleInPlace(-speedBackward));
          //Previous code
          //mesh.position.z -= 0.01;
          //mesh.rotation.y = 2 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
          mesh.rotate(Vector3.Up(), rotationSpeed);
          //Previous code
          //mesh.position.x += 0.01;
          //mesh.rotation.y = Math.PI / 2;
          keydown = true;
        }

        let isPlaying: boolean = false;
        if (keydown && !isPlaying) {
          if (!animating) {
              idleAnim = scene.stopAnimation(skeleton);
              walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
              animating = true;
          }
          if (animating) {
            //walkAnim = scene.beginWeightedAnimation(skeleton, walkRange.from, walkRange.to, 1.0, true);
            isPlaying = true;
          }
        } else {
          if (animating && !keydown) {
            walkAnim = scene.stopAnimation(skeleton);
            idleAnim = scene.beginWeightedAnimation(skeleton, idleRange.from, idleRange.to, 1.0, true);
            animating = false;
            isPlaying = false;
          }

        }

        //collision
        if (mesh.intersectsMesh(collider)) {
          console.log("COLLIDED");
        }
      });

      //physics collision
      item = mesh;
      let playerAggregate = new PhysicsAggregate(item, PhysicsShapeType.CAPSULE, { mass: 0 }, scene);
      playerAggregate.body.disablePreStep = false;

    });
    return item;
  }
  // GOAL POST 
function createGoalpost(scene: Scene, position: Vector3): Mesh {
    const goalpostHeight = 2;
    const goalpostWidth = 0.1;
    const goalpostColor = new Color3(1, 1, 1); // Adjust color as needed

    const goalpost = MeshBuilder.CreateBox("goalpost", { height: goalpostHeight, width: goalpostWidth, depth: goalpostWidth }, scene);
    goalpost.position = position;
    goalpost.material = new StandardMaterial("goalpostMaterial", scene);
    goalpost.material.diffuseColor = goalpostColor;

    // Add physics to the goalpost if needed
    const goalpostPhysics = new PhysicsAggregate(goalpost, PhysicsShapeType.BOX, { mass: 0 }, scene);

    return goalpost;
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
// BALL TO KICK INTO GOAL 
  function createSphere(scene: Scene, x: number, y: number, z: number, scale: number = 1) {
    const mat = new StandardMaterial("mat");
    const texture = new Texture("https://static.vecteezy.com/system/resources/thumbnails/007/686/503/small/black-and-white-panoramic-texture-football-background-ball-vector.jpg");
    mat.diffuseTexture = texture;
    let sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 * scale });
  
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    sphere.material = mat;
    const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1 }, scene);
    
    return sphere;
  }
    // COPY OF PITCH PULLED OFFLINE AFTER MY FIRST ATTEMPT FELL TO BITS 
  function createGround(scene: Scene, size: number = 10, width: number = 10, rotationAngle: number = 0) {
    const groundMat = new StandardMaterial("groundMat");
    groundMat.diffuseTexture = new Texture("https://t4.ftcdn.net/jpg/04/40/51/03/360_F_440510369_R1T9gwH1ZkpSBCjYDg47X2AhfL0AOOWf.jpg");
    groundMat.diffuseTexture.hasAlpha = true;

    const ground: Mesh = MeshBuilder.CreateGround("ground", { height: size, width: width, subdivisions: 4 }, scene);
    ground.material = groundMat;

    // Rotate the ground by the specified angle (in radians)
    ground.rotate(Vector3.Up(), rotationAngle);

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

  //fence around pitch
  function createFence1(scene: Scene) {
        // Create a fence
        const mat = new StandardMaterial("mat");
        const texture = new Texture("https://ichef.bbci.co.uk/news/624/mcs/media/images/59704000/jpg/_59704491_compositeadvertswithburger.jpg");
         mat.diffuseTexture = texture;
        const fenceHeight = 1;
        const fenceWidth = 0.1;
        const fenceColor = new Color3(0.5, 0.5, 0.5);

        const fence1 = MeshBuilder.CreateBox("fence1", { height: fenceHeight, width: fenceWidth, depth: 25 }, scene);
        fence1.position = new Vector3(-7.55, fenceHeight / 2, 0);
        fence1.material = new StandardMaterial("fenceMaterial", scene);
        fence1.material.diffuseColor = fenceColor;
        const fence1Physics = new PhysicsAggregate(fence1, PhysicsShapeType.BOX, { mass: 0 }, scene);
    return fence1;
  }

  function createFence2(scene: Scene) {
    // Create a fence
    const fenceHeight = 1;
    const fenceWidth = 0.1;
    const fenceColor = new Color3(0.5, 0.5, 0.5);

    const fence2 = MeshBuilder.CreateBox("fence2", { height: fenceHeight, width: fenceWidth, depth: 25 }, scene);
    fence2.position = new Vector3(7.55, fenceHeight / 2, 0);
    fence2.material = new StandardMaterial("fenceMaterial", scene);
    const fence2Physics = new PhysicsAggregate(fence2, PhysicsShapeType.BOX, { mass: 0 }, scene);
    fence2.material.diffuseColor = fenceColor;
return fence2;
}

function createFence3(scene: Scene) {
  // Create a fence
  const fenceHeight = 1;
  const fenceWidth = 0.1;
  const fenceColor = new Color3(0.5, 0.5, 0.5);
   
  const fence3 = MeshBuilder.CreateBox("fence3", { height: fenceHeight, width: 15, depth: fenceWidth }, scene);
  fence3.position = new Vector3(0, fenceHeight / 2, 12.55);
  fence3.material = new StandardMaterial("fenceMaterial", scene);
  const fence3Physics = new PhysicsAggregate(fence3, PhysicsShapeType.BOX, { mass: 0 }, scene);
  fence3.material.diffuseColor = fenceColor;

return fence3;
}

function createFence4(scene: Scene) {
  // Create a fence
  const fenceHeight = 1;
  const fenceWidth = 0.1;
  const fenceColor = new Color3(0.5, 0.5, 0.5);

  const fence4 = MeshBuilder.CreateBox("fence4", { height: fenceHeight, width: 15, depth: fenceWidth }, scene);
        fence4.position = new Vector3(0, fenceHeight / 2, -12.55);
        fence4.material = new StandardMaterial("fenceMaterial", scene);
        fence4.material.diffuseColor = fenceColor;
        const fence4Physics = new PhysicsAggregate(fence4, PhysicsShapeType.BOX, { mass: 0 }, scene);
return fence4;
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
// Function to create a reset button goes here 



function createResetButton(scene: Scene) {
  const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

  const resetButton = Button.CreateSimpleButton("resetButton", "Reset Game");
  resetButton.width = "150px";
  resetButton.height = "40px";
  resetButton.color = "white";
  resetButton.background = "green";
  resetButton.verticalAlignment = 0; // Top
  resetButton.horizontalAlignment = 0; // Right
  resetButton.paddingTop = "10px";
  resetButton.paddingRight = "10px";

  resetButton.onPointerUpObservable.add(() => {
    setSceneIndex(0);
    // Call your reset function here
    //resetGame();
  });

  guiTexture.addControl(resetButton);
}



//function for reset button end here 
  //PREVIOUS METHODS SHADOWS STILL WONT WORK BECAUSE THIS IS STUPID 
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
// junk code for testing this house fire of a shit heap 
  //----------------------------------------------------------


  //BOTTOM OF CODE - MAIN RENDERING AREA FOR YOUR SCENE
  export default function createStartScene(engine: Engine) {
    interface SceneData {
      scene: Scene;
      sphere?: Mesh;
      ground?: Mesh;
      fence1?: Mesh;
      fence2?: Mesh;
      fence3?: Mesh;
      fence4?: Mesh;
      importMesh?: any;
      actionManager?: any;
      skybox?: Mesh;
      light?: Light;
      hemisphericLight?: HemisphericLight;
      camera?: Camera;
    }
    sceneData = { scene: new Scene(engine) };
    let that: SceneData = { scene: new Scene(engine) };
    that.scene.debugLayer.show();
    // Initialise physics
    that.scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);
    //----------------------------------------------------------
  
    that.sphere = createSphere(that.scene, 2, 2, 2, 0.5);
    that.ground = createGround(that.scene, 15, 25, Math.PI / 2);
  
    that.ground.receiveShadows = true;
  
    that.importMesh = importPlayerMesh(that.scene, that.sphere, 0, 0);
    that.actionManager = actionManager(that.scene);
    const arenaWidth = 25; // Adjust this based on if you resize arena size

    const leftGoalpostPosition = new Vector3(-0.05 * arenaWidth, 1, -0.45 * arenaWidth);
    const rightGoalpostPosition = new Vector3(0.05 * arenaWidth, 1, -0.45 * arenaWidth);
    
  
    const leftGoalpost = createGoalpost(that.scene, leftGoalpostPosition);
    const rightGoalpost = createGoalpost(that.scene, rightGoalpostPosition);
    let goalScored = false;

    const newGoalpost1Position = new Vector3(-leftGoalpostPosition.x, 1, -leftGoalpostPosition.z);
    const newGoalpost2Position = new Vector3(-rightGoalpostPosition.x, 1, -rightGoalpostPosition.z);
    
    const newGoalpostWidth = 0.1;
    const newGoalpostDepth = 0.1;

    // creating the second goal post 
    const newGoalpost1 = createGoalpost(that.scene, newGoalpost1Position);
    const newGoalpost2 = createGoalpost(that.scene, newGoalpost2Position);
  
    // Check for goal between the posts
    that.scene.onBeforeRenderObservable.add(() => {
      if (that.sphere && !goalScored && isBallBetweenPosts(that.sphere, leftGoalpost, rightGoalpost)) {
        goalScored = true;
        showGoalPopup();
      }
    });
  
    // Function to check if the ball is between the goalposts
    function isBallBetweenPosts(ball: Mesh, leftPost: Mesh, rightPost: Mesh): boolean {
      return (
        ball.position.x > leftPost.position.x &&
        ball.position.x < rightPost.position.x &&
        Math.abs(ball.position.z - leftPost.position.z) < 1
      );
    }
  
    // Function to show the goal popup
    function showGoalPopup() {
      // Adjust this part based on how you want to display the popup
      alert("SCORE!!!!!! YA DANCER!!!");
    }
    
//GUI SCORE 

    createResetButton(sceneData.scene);
    sceneData = { scene: new Scene(engine) };
    // resetButton.onPointerUpObservable.add(() => {
    //   console.log("Button clicked!");
    //   // Call your reset function here
    //   resetGame();
    // });
    that.skybox = createSkybox(that.scene);
    // Scene Lighting & Camera
    that.hemisphericLight = createHemiLight(that.scene);
    that.camera = createArcRotateCamera(that.scene);
  
    // Fence
    that.fence1 = createFence1(that.scene);
    that.fence2 = createFence2(that.scene);
    that.fence3 = createFence3(that.scene);
    that.fence4 = createFence4(that.scene);
  
    return that;
  }
  //----------------------------------------------------
  