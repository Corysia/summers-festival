// @ts-check
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { AdvancedDynamicTexture, Button, Control  } from "@babylonjs/gui";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

enum State { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 }
class App {
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    private _state: State = State.START;
    private _gameScene: Scene;
    private _cutScene: Scene;

    /**
     * Creates an instance of App.
     * @memberof App
     * @constructor
     * @description
     * 1. Create a canvas element
     * 2. Initialize babylon scene and engine
     * 3. Hide/show the Inspector
     * 4. Start the game
     */
    constructor() {
        console.debug("constructor");
        this._canvas = this.createCanvas();

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            // keyCode 73 = I, need to use this because ev.key === "I" doesn't work on a Mac
            console.log(ev.shiftKey, ev.ctrlKey, ev.altKey, ev.keyCode, ev.key)
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        this.main().catch((err) => {
            console.error(err);
        });
    }

    /**
     * Start the game
     * @returns {Promise<void>}
     * @memberof App
     * @private
     * @method main
     * @description
     * 1. Go to the start screen
     * 2. Run the render loop
     * 3. Handle the browser's resize
     */
    private async main(): Promise<void> {
        console.debug("main");
        await this._goToStart();

        this._engine.runRenderLoop(() => {
            switch (this._state) {
                case State.START:
                    this._scene.render();
                    break;
                case State.CUTSCENE:
                    this._scene.render();
                    break;
                case State.GAME:
                    this._scene.render();
                    break;
                case State.LOSE:
                    this._scene.render();
                    break;
                default:
                    break;
            }
        });

        // handle the browser's resize
        window.addEventListener("resize", () => {
            this._engine.resize();
        });
    }

    /**
     * Start the game
     * @returns {Promise<void>}
     * @memberof App
     * @private
     * @method _goToStart
     * @description
     * 1. Create a new scene
     * 2. Create a camera
     * 3. Create a fullscreen UI
     * 4. Create a button
     * 5. Add a click event to the button
     * 6. Dispose the current scene
     * 7. Set the new scene as the current scene
     * 8. Set the state to START
     * 9. Run the render loop
     * @example
     * this._goToStart();
     * @see https://doc.babylonjs.com/how_to/gui#simple-button
     */
    private async _goToStart(): Promise<void> {
        console.debug("goToStart");
        this._engine.displayLoadingUI();
        this._scene.detachControl();

        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        // create a fullscreen UI
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        // create a button
        const startButton = Button.CreateSimpleButton("start", "Start Game");
        startButton.width = 0.2;
        startButton.height = "40px";
        startButton.color = "white";
        // button1.top = "-14px%";
        startButton.thickness = 0;
        startButton.verticalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER | Control.VERTICAL_ALIGNMENT_CENTER;
        startButton.cornerRadius = 20;
        startButton.background = "green";
        guiMenu.addControl(startButton);

        startButton.onPointerUpObservable.add(() => {
            this._goToCutScene();
            console.debug("startButton pressed");
            scene.detachControl();
        });

        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        this._scene.dispose()
        this._scene = scene;
        this._state = State.START;
    }

    
    /**
     * Show the cut scene
     * @description
     * 1. Create a new scene
     * 2. Create a camera
     * 3. Create a fullscreen UI
     * 4. Create a button
     * 5. Add a click event to the button
     * 6. Dispose the current scene
     * 7. Set the new scene as the current scene
     * 8. Set the state to START
     * 9. Run the render loop
     * @private
     * @async
     * @returns {Promise<void>}
     */
    private async _goToCutScene(): Promise<void> {
        console.debug("goToCutScene");
        this._engine.displayLoadingUI();
        //--SETUP SCENE--
        // Don't detect any inputs from this ui while the game is loading
        this._scene.detachControl();
        this._cutScene = new Scene(this._engine);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._cutScene);
        camera.setTarget(Vector3.Zero());
        this._cutScene.clearColor = new Color4(0, 0, 0, 1);

         //--GUI--
        const cutScene = AdvancedDynamicTexture.CreateFullscreenUI("cutscene");

        //--PROGRESS DIALOGUE--
        const next = Button.CreateSimpleButton("next", "NEXT");
        next.color = "white";
        next.thickness = 0;
        next.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        next.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        next.width = "64px";
        next.height = "64px";
        next.top = "-3%";
        next.left = "-12%";
        cutScene.addControl(next);

        next.onPointerUpObservable.add(() => {
            console.debug("next pressed");
            this._goToGame();
        })

        //--WHEN SCENE IS FINISHED LOADING--
        await this._cutScene.whenReadyAsync();
        this._engine.hideLoadingUI();
        this._scene.dispose();
        this._state = State.CUTSCENE;
        this._scene = this._cutScene;

        //--START LOADING AND SETTING UP THE GAME DURING THIS SCENE--
        var finishedLoading = false;
        await this._setUpGame().then(res =>{
            finishedLoading = true;
        });
    }

    /**
     * Display the losing screen
     * @returns {Promise<void>}
     * @memberof App
     * @private
     * @method goToLose
     * @description
     * 1. Create a new scene
     * 2. Create a camera
     * 3. Create a fullscreen UI
     * 4. Create a button
     * 5. Add a click event to the button
     * 6. Dispose the current scene
     * 7. Set the new scene as the current scene
     * 8. Set the state to START
     * 9. Run the render loop
     * @example
     * this._goToLose();
     */
    private async _goToLose(): Promise<void> {
        console.debug("goToLose");
        this._engine.displayLoadingUI();
    
        //--SCENE SETUP--
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());
    
        //--GUI--
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const mainBtn = Button.CreateSimpleButton("mainmenu", "MAIN MENU");
        mainBtn.width = 0.2;
        mainBtn.height = "40px";
        mainBtn.color = "white";
        guiMenu.addControl(mainBtn);
        //this handles interactions with the start button attached to the scene
        mainBtn.onPointerUpObservable.add(() => {
            console.debug("mainBtn pressed");
            this._goToStart();
        });
    
        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI(); //when the scene is ready, hide loading
        //lastly set the current state to the lose state and set the scene to the lose scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.LOSE;
    }
    /**
     * Create a canvas element and append it to the DOM
     * @returns {HTMLCanvasElement}
     * @memberof App
     * @private
     * @method createCanvas
     * @description
     * 1. Create a canvas element
     * 2. Set the canvas element's width and height to 100%
     * 3. Set the canvas element's id to "gameCanvas"
     * 4. Append the canvas element to the DOM
     * @example
     * this.createCanvas();
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
     */
    private createCanvas(): HTMLCanvasElement {
        console.debug("createCanvas");
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);
        return canvas;
    }

    private async _setUpGame() {
        console.debug("setupGame");
        let scene = new Scene(this._engine);
        this._gameScene = scene;
    }

    private async _goToGame(){
        console.debug("goToGame");
        //--SETUP SCENE--
        this._scene.detachControl();
        let scene = this._gameScene;
        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better
        let camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());
    
        //--GUI--
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        // Don't detect any inputs from this ui while the game is loading
        scene.detachControl();
    
        //create a simple button
        const loseBtn = Button.CreateSimpleButton("lose", "LOSE");
        loseBtn.width = 0.2
        loseBtn.height = "40px";
        loseBtn.color = "white";
        loseBtn.top = "-14px";
        loseBtn.thickness = 0;
        loseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        playerUI.addControl(loseBtn);
    
        //this handles interactions with the start button attached to the scene
        loseBtn.onPointerDownObservable.add(() => {
            console.debug("loseBtn pressed");
            this._goToLose();
            scene.detachControl(); //observables disabled
        });
    
        //temporary scene objects
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
    
        //get rid of start scene, switch to gamescene and change states
        this._scene.dispose();
        this._state = State.GAME;
        this._scene = scene;
        this._engine.hideLoadingUI();
        //the game is ready, attach control back
        this._scene.attachControl();
    }

}
new App();