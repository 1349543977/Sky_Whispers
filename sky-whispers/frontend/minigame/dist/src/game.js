"use strict";
// ============================================================
// Sky Whispers (云端气象局) - Game Entry Point
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = require("./core/Game");
const game = new Game_1.Game();
game.run().catch((err) => {
    console.error('[SkyWhispers] Fatal error:', err);
});
exports.default = game;
//# sourceMappingURL=game.js.map