"use strict";
// ============================================================
// Scene - Scene management with stack-based navigation
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneManager = exports.Scene = void 0;
const types_1 = require("../types");
const EventManager_1 = require("./EventManager");
const types_2 = require("../types");
const constants_1 = require("../utils/constants");
class Scene {
    constructor(name, renderer, input) {
        this.active = false;
        this.loaded = false;
        this.name = name;
        this.renderer = renderer;
        this.input = input;
        this.eventManager = EventManager_1.EventManager.getInstance();
    }
    get sceneName() {
        return this.name;
    }
    get isActive() {
        return this.active;
    }
    get isLoaded() {
        return this.loaded;
    }
    onEnter() {
        this.active = true;
    }
    onExit() {
        this.active = false;
    }
    onPause() {
        this.active = false;
    }
    onResume() {
        this.active = true;
    }
}
exports.Scene = Scene;
class SceneManager {
    constructor(renderer, input) {
        this.scenes = new Map();
        this.stack = [];
        this.transitionAlpha = 0;
        this.isTransitioning = false;
        this.transitionCallback = null;
        this.renderer = renderer;
        this.input = input;
        this.eventManager = EventManager_1.EventManager.getInstance();
    }
    register(scene) {
        this.scenes.set(scene.sceneName, scene);
    }
    async switchTo(name) {
        const target = this.scenes.get(name);
        if (!target) {
            console.error(`[SceneManager] Scene "${name}" not found`);
            return;
        }
        // Exit current scene
        const currentName = this.getCurrentScene();
        if (currentName) {
            const current = this.scenes.get(currentName);
            current === null || current === void 0 ? void 0 : current.onExit();
            current === null || current === void 0 ? void 0 : current.onUnload();
        }
        // Load target scene if needed
        if (!target.isLoaded) {
            await target.onLoad();
        }
        // Enter target scene
        target.onEnter();
        // Replace stack
        this.stack = [name];
        this.eventManager.emit(types_2.GameEvent.SceneChange, {
            from: currentName !== null && currentName !== void 0 ? currentName : types_1.SceneName.Boot,
            to: name,
        });
    }
    async push(name) {
        const target = this.scenes.get(name);
        if (!target) {
            console.error(`[SceneManager] Scene "${name}" not found`);
            return;
        }
        // Pause current scene
        const currentName = this.getCurrentScene();
        if (currentName) {
            const current = this.scenes.get(currentName);
            current === null || current === void 0 ? void 0 : current.onPause();
        }
        // Load target scene if needed
        if (!target.isLoaded) {
            await target.onLoad();
        }
        // Push and enter
        this.stack.push(name);
        target.onEnter();
        this.eventManager.emit(types_2.GameEvent.ScenePush, name);
    }
    pop() {
        if (this.stack.length <= 1) {
            console.warn('[SceneManager] Cannot pop the last scene');
            return;
        }
        const currentName = this.stack.pop();
        const current = this.scenes.get(currentName);
        current === null || current === void 0 ? void 0 : current.onExit();
        current === null || current === void 0 ? void 0 : current.onUnload();
        // Resume previous scene
        const previousName = this.getCurrentScene();
        if (previousName) {
            const previous = this.scenes.get(previousName);
            previous === null || previous === void 0 ? void 0 : previous.onResume();
        }
        this.eventManager.emit(types_2.GameEvent.ScenePop, currentName);
    }
    getCurrentScene() {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
    }
    getCurrent() {
        var _a;
        const name = this.getCurrentScene();
        return name ? (_a = this.scenes.get(name)) !== null && _a !== void 0 ? _a : null : null;
    }
    async switchWithTransition(sceneName, type = 'fade') {
        if (this.isTransitioning)
            return;
        this.isTransitioning = true;
        const fadeOutDuration = 300;
        const startTime = Date.now();
        return new Promise((resolve) => {
            const fadeOut = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / fadeOutDuration, 1);
                this.transitionAlpha = progress;
                if (progress < 1) {
                    requestAnimationFrame(fadeOut);
                }
                else {
                    // Switch scene at peak
                    this.switchTo(sceneName);
                    // Fade in new scene
                    const fadeInStart = Date.now();
                    const fadeInDuration = 400;
                    const fadeIn = () => {
                        const elapsed = Date.now() - fadeInStart;
                        const progress = Math.min(elapsed / fadeInDuration, 1);
                        this.transitionAlpha = 1 - progress;
                        if (progress < 1) {
                            requestAnimationFrame(fadeIn);
                        }
                        else {
                            this.transitionAlpha = 0;
                            this.isTransitioning = false;
                            resolve();
                        }
                    };
                    requestAnimationFrame(fadeIn);
                }
            };
            requestAnimationFrame(fadeOut);
        });
    }
    update(dt) {
        const scene = this.getCurrent();
        if (scene && scene.isActive) {
            scene.update(dt);
        }
    }
    fixedUpdate(dt) {
        const scene = this.getCurrent();
        if (scene && scene.isActive) {
            scene.fixedUpdate(dt);
        }
    }
    render() {
        const scene = this.getCurrent();
        if (scene && scene.isActive) {
            scene.render();
        }
        // Draw transition overlay if transitioning
        if (this.transitionAlpha > 0) {
            this.renderer.setAlpha(this.transitionAlpha, constants_1.LAYERS.OVERLAY, (ctx) => {
                ctx.fillStyle = '#FAFBFD';
                ctx.fillRect(0, 0, this.renderer.width, this.renderer.height);
            });
        }
    }
}
exports.SceneManager = SceneManager;
//# sourceMappingURL=Scene.js.map