"use strict";
// ============================================================
// Sky Whispers (云端气象局) - Type Definitions
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEvent = exports.SceneName = exports.FriendshipStatus = exports.GiftType = exports.ItemType = exports.Rarity = exports.PlantGrowthStage = exports.WeatherType = void 0;
// --- Enums ---
var WeatherType;
(function (WeatherType) {
    WeatherType["Sunny"] = "sunny";
    WeatherType["Cloudy"] = "cloudy";
    WeatherType["Rainy"] = "rainy";
    WeatherType["Snowy"] = "snowy";
    WeatherType["Thunderstorm"] = "thunderstorm";
    WeatherType["Foggy"] = "foggy";
    WeatherType["Windy"] = "windy";
})(WeatherType || (exports.WeatherType = WeatherType = {}));
var PlantGrowthStage;
(function (PlantGrowthStage) {
    PlantGrowthStage[PlantGrowthStage["Seed"] = 0] = "Seed";
    PlantGrowthStage[PlantGrowthStage["Sprout"] = 1] = "Sprout";
    PlantGrowthStage[PlantGrowthStage["Growing"] = 2] = "Growing";
    PlantGrowthStage[PlantGrowthStage["Mature"] = 3] = "Mature";
})(PlantGrowthStage || (exports.PlantGrowthStage = PlantGrowthStage = {}));
var Rarity;
(function (Rarity) {
    Rarity["Common"] = "common";
    Rarity["Rare"] = "rare";
    Rarity["Epic"] = "epic";
    Rarity["Legendary"] = "legendary";
})(Rarity || (exports.Rarity = Rarity = {}));
var ItemType;
(function (ItemType) {
    ItemType["Skin"] = "skin";
    ItemType["Effect"] = "effect";
    ItemType["Prop"] = "prop";
    ItemType["Pass"] = "pass";
})(ItemType || (exports.ItemType = ItemType = {}));
var GiftType;
(function (GiftType) {
    GiftType["RainCloud"] = "rain_cloud";
    GiftType["Breeze"] = "breeze";
    GiftType["Sunlight"] = "sunlight";
    GiftType["Snowflake"] = "snowflake";
})(GiftType || (exports.GiftType = GiftType = {}));
var FriendshipStatus;
(function (FriendshipStatus) {
    FriendshipStatus["Pending"] = "pending";
    FriendshipStatus["Accepted"] = "accepted";
    FriendshipStatus["Blocked"] = "blocked";
})(FriendshipStatus || (exports.FriendshipStatus = FriendshipStatus = {}));
var SceneName;
(function (SceneName) {
    SceneName["Boot"] = "boot";
    SceneName["Main"] = "main";
    SceneName["Social"] = "social";
    SceneName["Shop"] = "shop";
    SceneName["Codex"] = "codex";
    SceneName["Settings"] = "settings";
})(SceneName || (exports.SceneName = SceneName = {}));
// --- Event Types ---
var GameEvent;
(function (GameEvent) {
    // Lifecycle
    GameEvent["GameInit"] = "game:init";
    GameEvent["GamePause"] = "game:pause";
    GameEvent["GameResume"] = "game:resume";
    GameEvent["SceneChange"] = "scene:change";
    GameEvent["ScenePush"] = "scene:push";
    GameEvent["ScenePop"] = "scene:pop";
    // Weather
    GameEvent["WeatherUpdated"] = "weather:updated";
    GameEvent["WeatherEffectStart"] = "weather:effect_start";
    GameEvent["WeatherEffectStop"] = "weather:effect_stop";
    // Plant
    GameEvent["PlantPlanted"] = "plant:planted";
    GameEvent["PlantWatered"] = "plant:watered";
    GameEvent["PlantGrew"] = "plant:grew";
    GameEvent["PlantMatured"] = "plant:matured";
    GameEvent["PlantHarvested"] = "plant:harvested";
    // Sprite
    GameEvent["SpriteSpawned"] = "sprite:spawned";
    GameEvent["SpriteCaught"] = "sprite:caught";
    GameEvent["SpriteFed"] = "sprite:fed";
    GameEvent["SpriteHappinessChanged"] = "sprite:happiness_changed";
    // Coin
    GameEvent["CoinEarned"] = "coin:earned";
    GameEvent["CoinSpent"] = "coin:spent";
    GameEvent["CoinCollected"] = "coin:collected";
    // Step
    GameEvent["StepsUpdated"] = "steps:updated";
    GameEvent["WindPowerChanged"] = "wind_power:changed";
    // Social
    GameEvent["FriendListLoaded"] = "social:friend_list_loaded";
    GameEvent["GiftSent"] = "social:gift_sent";
    GameEvent["GiftReceived"] = "social:gift_received";
    GameEvent["GiftClaimed"] = "social:gift_claimed";
    GameEvent["IslandVisited"] = "social:island_visited";
    // Shop
    GameEvent["ItemPurchased"] = "shop:item_purchased";
    // UI
    GameEvent["ToastShow"] = "ui:toast_show";
    GameEvent["DialogShow"] = "ui:dialog_show";
    GameEvent["DialogClose"] = "ui:dialog_close";
    GameEvent["TabChanged"] = "ui:tab_changed";
    GameEvent["LoadingStart"] = "ui:loading_start";
    GameEvent["LoadingEnd"] = "ui:loading_end";
})(GameEvent || (exports.GameEvent = GameEvent = {}));
//# sourceMappingURL=index.js.map