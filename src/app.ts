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

class App {
    private scene: Scene;
    private canvas: HTMLCanvasElement;
    private engine: Engine;

    /**
     * Creates an instance of App.
     * @memberof App
     * @constructor
     * @description
     * 1. Create a canvas element
     * 2. Initialize babylon scene and engine
     * 3. Handle the browser's resize
     * 4. Hide/show the Inspector
     * 5. Start the game
     */
    constructor() {
        this.canvas = this.createCanvas();

        // initialize babylon scene and engine
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);

        // handle the browser's resize
        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            // keyCode 73 = I, need to use this because ev.key === "I" doesn't work on a Mac
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
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
     */
    private async main(): Promise<void> {
        await this.goToStart();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    /**
     * Start the game
     * @returns {Promise<void>}
     * @memberof App
     * @private
     * @method goToStart
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
     * this.goToStart();
     * @see https://doc.babylonjs.com/how_to/gui#simple-button
     */
    private async goToStart(): Promise<void> {
        console.log("goToStart");
        this.engine.displayLoadingUI();
        this.scene.detachControl();

        let scene = new Scene(this.engine);
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
            // this.goToCutScene();
            console.log("startButton");
            scene.detachControl();
        });

        await scene.whenReadyAsync();
        this.engine.hideLoadingUI();
        this.scene.dispose()
        this.scene = scene;
        // this.state = State.START;
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
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);
        return canvas;
    }
}
new App();