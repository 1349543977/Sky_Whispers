"use strict";
// ============================================================
// Game - Main game class
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const types_1 = require("../types");
const Renderer_1 = require("./Renderer");
const Camera_1 = require("./Camera");
const Input_1 = require("./Input");
const Scheduler_1 = require("./Scheduler");
const EventManager_1 = require("./EventManager");
const Scene_1 = require("./Scene");
const Tween_1 = require("./Tween");
// Scene imports
const BootScene_1 = require("../scenes/BootScene");
const MainScene_1 = require("../scenes/MainScene");
const SocialScene_1 = require("../scenes/SocialScene");
const ShopScene_1 = require("../scenes/ShopScene");
const CodexScene_1 = require("../scenes/CodexScene");
const SettingsScene_1 = require("../scenes/SettingsScene");
class Game {
    constructor() {
        this.paused = false;
        this.initialized = false;
        this.renderer = new Renderer_1.Renderer();
        this.camera = new Camera_1.Camera(this.renderer.width, this.renderer.height);
        this.input = new Input_1.Input();
        this.scheduler = new Scheduler_1.Scheduler();
        this.sceneManager = new Scene_1.SceneManager(this.renderer, this.input);
        this.eventManager = EventManager_1.EventManager.getInstance();
    }
    async init() {
        if (this.initialized)
            return;
        console.log('[Game] Initializing Sky Whispers...');
        // Register scenes
        this.registerScenes();
        // Setup game loop
        this.scheduler.setUpdateCallback((dt) => this.update(dt));
        this.scheduler.setFixedUpdateCallback((dt) => this.fixedUpdate(dt));
        this.scheduler.setRenderCallback(() => this.render());
        // Setup lifecycle handlers
        this.setupLifecycle();
        this.initialized = true;
        this.eventManager.emit(types_1.GameEvent.GameInit);
        console.log('[Game] Initialization complete');
    }
    async run() {
        await this.init();
        // Switch to boot scene
        await this.sceneManager.switchTo(types_1.SceneName.Boot);
        // Start game loop
        this.scheduler.start();
        console.log('[Game] Running...');
    }
    registerScenes() {
        this.sceneManager.register(new BootScene_1.BootScene(this.renderer, this.input));
        this.sceneManager.register(new MainScene_1.MainScene(this.renderer, this.input));
        this.sceneManager.register(new SocialScene_1.SocialScene(this.renderer, this.input));
        this.sceneManager.register(new ShopScene_1.ShopScene(this.renderer, this.input));
        this.sceneManager.register(new CodexScene_1.CodexScene(this.renderer, this.input));
        this.sceneManager.register(new SettingsScene_1.SettingsScene(this.renderer, this.input));
    }
    setupLifecycle() {
        wx.onShow(() => {
            if (this.paused) {
                this.paused = false;
                this.scheduler.resume();
                this.eventManager.emit(types_1.GameEvent.GameResume);
                console.log('[Game] Resumed');
            }
        });
        wx.onHide(() => {
            this.paused = true;
            this.scheduler.pause();
            this.eventManager.emit(types_1.GameEvent.GamePause);
            console.log('[Game] Paused');
        });
    }
    update(dt) {
        if (this.paused)
            return;
        this.camera.update(dt);
        Tween_1.Tween.update(dt * 1000); // Tween expects ms
        this.sceneManager.update(dt);
    }
    fixedUpdate(dt) {
        if (this.paused)
            return;
        this.sceneManager.fixedUpdate(dt);
    }
    render() {
        if (this.paused)
            return;
        this.sceneManager.render();
        this.renderer.render();
    }
    getRenderer() {
        return this.renderer;
    }
    getCamera() {
        return this.camera;
    }
    getInput() {
        return this.input;
    }
    getSceneManager() {
        return this.sceneManager;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map