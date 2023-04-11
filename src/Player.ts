import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { Scene } from "@babylonjs/core/scene";

export class Player extends TransformNode {
    public camera;
    public scene: Scene;
    private _input;

    // Player visual
    public mesh: Mesh;

    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        shadowGenerator.addShadowCaster(assets.mesh); // the player will cast a shadow

        this._input = input; // the input manager
    }

    private _setupPlayerCamera() {
        let camera4 = new ArcRotateCamera("arc", -Math.PI/2, Math.PI/2, 40, new Vector3(0, 3, 0), this.scene);
    }
}