// ============================================================
// Sky Whispers (云端气象局) - Game Entry Point
// ============================================================

import { Game } from './core/Game';

const game = new Game();

game.run().catch((err) => {
  console.error('[SkyWhispers] Fatal error:', err);
});

export default game;
