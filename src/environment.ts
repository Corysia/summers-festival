import { Vector3 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes";
import { Scene } from "@babylonjs/core/scene";

export class Environment {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        // Load environment
        let ground = MeshBuilder.CreateBox("ground", { size: 24 }, this._scene);
        ground.scaling = new Vector3(1, 0.02, 1);
    }
}