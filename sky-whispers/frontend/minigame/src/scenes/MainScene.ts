// ============================================================
// MainScene - Core island view
// ============================================================

import { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { Input } from '../core/Input';
import { SceneName, WeatherType, GameEvent, Island as IslandData, Plant as PlantData, WeatherSprite as SpriteData } from '../types';
import { EventManager } from '../core/EventManager';
import { Island } from '../entities/Island';
import { Plant } from '../entities/Plant';
import { WeatherSprite } from '../entities/WeatherSprite';
import { Windmill } from '../entities/Windmill';
import { Cloud, CloudVariant } from '../entities/Cloud';
import { RainEffect } from '../entities/RainEffect';
import { SnowEffect } from '../entities/SnowEffect';
import { ThunderEffect } from '../entities/ThunderEffect';
import { FogEffect } from '../entities/FogEffect';
import { WeatherSystem } from '../systems/WeatherSystem';
import { GrowthSystem } from '../systems/GrowthSystem';
import { CoinSystem } from '../systems/CoinSystem';
import { StepSystem } from '../systems/StepSystem';
import { SpriteSpawnSystem } from '../systems/SpriteSpawnSystem';
import { TabBar } from '../ui/TabBar';
import { CoinDisplay } from '../ui/CoinDisplay';
import { WeatherWidget } from '../ui/WeatherWidget';
import { StepWidget } from '../ui/StepWidget';
import { ToastManager } from '../ui/Toast';
import { ApiClient } from '../services/ApiClient';
import { WxService } from '../services/WxService';
import { StorageService } from '../services/StorageService';
import { LAYERS, ANIMATION } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { hexToRgb, lerpColor, colorToString } from '../utils/color';

export class MainScene extends Scene {
  private apiClient: ApiClient;
  private wxService: WxService;
  private storageService: StorageService;

  // Systems
  private weatherSystem!: WeatherSystem;
  private growthSystem!: GrowthSystem;
  private coinSystem!: CoinSystem;
  private stepSystem!: StepSystem;
  private spriteSpawnSystem!: SpriteSpawnSystem;

  // Entities
  private island: Island | null = null;
  private plants: Plant[] = [];
  private sprites: WeatherSprite[] = [];
  private windmill: Windmill | null = null;
  private clouds: Cloud[] = [];

  // Weather effects
  private rainEffect: RainEffect | null = null;
  private snowEffect: SnowEffect | null = null;
  private thunderEffect: ThunderEffect | null = null;
  private fogEffect: FogEffect | null = null;
  private currentWeatherType: WeatherType = WeatherType.Sunny;

  // Sky transition state
  private skyTransitionProgress: number = 1;
  private skyTransitionDuration: number = ANIMATION.SKY_TRANSITION_DURATION;
  private previousSkyTop: string = DesignTokens.colors.skySunnyTop;
  private previousSkyBottom: string = DesignTokens.colors.skySunnyBottom;
  private targetSkyTop: string = DesignTokens.colors.skySunnyTop;
  private targetSkyBottom: string = DesignTokens.colors.skySunnyBottom;

  // UI
  private tabBar!: TabBar;
  private coinDisplay!: CoinDisplay;
  private weatherWidget!: WeatherWidget;
  private stepWidget!: StepWidget;
  private toastManager!: ToastManager;

  constructor(renderer: Renderer, input: Input) {
    super(SceneName.Main, renderer, input);
    this.storageService = new StorageService();
    this.apiClient = new ApiClient('', this.storageService);
    this.wxService = new WxService();
  }

  async onLoad(): Promise<void> {
    // Initialize systems
    this.weatherSystem = new WeatherSystem(this.apiClient, this.wxService);
    this.growthSystem = new GrowthSystem(this.weatherSystem);
    this.coinSystem = new CoinSystem();
    this.stepSystem = new StepSystem(this.wxService, this.apiClient);
    this.spriteSpawnSystem = new SpriteSpawnSystem(this.weatherSystem, this.apiClient);

    // Initialize UI
    this.initUI();

    // Load game data
    await this.loadGameData();

    // Initialize systems
    await this.weatherSystem.init();
    await this.stepSystem.init();
    await this.spriteSpawnSystem.init();

    // Setup event listeners
    this.setupEventListeners();

    // Initialize weather effects
    this.initWeatherEffects();

    // Spawn initial clouds
    this.spawnClouds();

    this.loaded = true;
  }

  private initUI(): void {
    const w = this.renderer.width;
    const h = this.renderer.height;

    this.coinDisplay = new CoinDisplay(12, 12);
    this.weatherWidget = new WeatherWidget(w - 102, 12);
    this.stepWidget = new StepWidget(w - 122, 44);
    this.toastManager = new ToastManager(w);

    this.tabBar = new TabBar(
      [
        { id: 'island', label: '岛屿', icon: '🏝️', activeIcon: '🏝️' },
        { id: 'social', label: '好友', icon: '👥', activeIcon: '👥', badge: 0 },
        { id: 'shop', label: '商店', icon: '🛒', activeIcon: '🛒' },
        { id: 'codex', label: '图鉴', icon: '📖', activeIcon: '📖' },
        { id: 'settings', label: '设置', icon: '⚙️', activeIcon: '⚙️' },
      ],
      w,
      h,
      (tabId) => this.handleTabChange(tabId),
    );
  }

  private async loadGameData(): Promise<void> {
    try {
      // Load island data
      const islandResponse = await this.apiClient.getIsland();
      if (islandResponse.code === 0) {
        this.createIsland(islandResponse.data);
      }

      // Load user data for coins
      const userResponse = await this.apiClient.getUser();
      if (userResponse.code === 0) {
        this.coinSystem.init(
          userResponse.data.coins,
          islandResponse.data?.windmill_level ?? 1,
          0,
        );
        this.coinDisplay.setCoins(userResponse.data.coins);
      }
    } catch (err) {
      console.error('[MainScene] Load game data failed:', err);
      this.toastManager.show({ text: '加载数据失败，请重试' });
    }
  }

  private createIsland(data: IslandData): void {
    const w = this.renderer.width;
    const islandX = (w - 280) / 2;
    const islandY = this.renderer.height * 0.35;
    this.island = new Island(data, islandX, islandY);

    // Create windmill
    this.windmill = new Windmill(
      islandX + 200,
      islandY - 20,
      data.windmill_level,
      0,
    );
  }

  private setupEventListeners(): void {
    this.eventManager.on(GameEvent.WeatherUpdated, (data) => {
      this.weatherWidget.setWeatherData(data);
      this.updateWeatherEffects(data.weather_type);
    });

    this.eventManager.on(GameEvent.CoinCollected, ({ amount }) => {
      this.coinDisplay.setCoins(this.coinSystem.getCoins());
    });

    this.eventManager.on(GameEvent.CoinEarned, ({ amount }) => {
      this.coinDisplay.setCoins(this.coinSystem.getCoins());
    });

    this.eventManager.on(GameEvent.WindPowerChanged, ({ windPower }) => {
      this.stepWidget.setWindPower(windPower);
      this.windmill?.setWindPower(windPower);
      this.coinSystem.setWindPower(windPower);
    });

    this.eventManager.on(GameEvent.StepsUpdated, ({ steps }) => {
      this.stepWidget.setSteps(steps);
    });
  }

  private initWeatherEffects(): void {
    const w = this.renderer.width;
    const h = this.renderer.height;
    const groundY = h * 0.7;

    this.rainEffect = new RainEffect(w, h, groundY);
    this.snowEffect = new SnowEffect(w, h);
    this.thunderEffect = new ThunderEffect(w, h);
    this.fogEffect = new FogEffect(w, h);

    // Initially all effects are off
    this.rainEffect.setActive(false);
    this.snowEffect.setActive(false);
    this.thunderEffect.setActive(false);
    this.fogEffect.setActive(false);
  }

  private updateWeatherEffects(weatherType: WeatherType): void {
    if (this.currentWeatherType === weatherType) return;

    // Start sky transition
    this.previousSkyTop = this.getCurrentSkyTopColor();
    this.previousSkyBottom = this.getCurrentSkyBottomColor();
    this.targetSkyTop = this.getSkyTopColorForWeather(weatherType);
    this.targetSkyBottom = this.getSkyBottomColorForWeather(weatherType);
    this.skyTransitionProgress = 0;

    // Deactivate all effects
    this.rainEffect?.setActive(false);
    this.snowEffect?.setActive(false);
    this.thunderEffect?.setActive(false);
    this.fogEffect?.setActive(false);

    // Activate appropriate effect
    switch (weatherType) {
      case WeatherType.Rainy:
        this.rainEffect?.setActive(true);
        break;
      case WeatherType.Snowy:
        this.snowEffect?.setActive(true);
        break;
      case WeatherType.Thunderstorm:
        this.rainEffect?.setActive(true);
        this.thunderEffect?.setActive(true);
        break;
      case WeatherType.Foggy:
        this.fogEffect?.setActive(true);
        break;
      case WeatherType.Cloudy:
        // Just clouds, no special effect
        break;
      case WeatherType.Windy:
        // Wind increases cloud speed - handled in cloud update
        break;
      default:
        break;
    }

    this.currentWeatherType = weatherType;
  }

  private spawnClouds(): void {
    const w = this.renderer.width;
    const count = 3 + Math.floor(Math.random() * 3);
    this.clouds = [];

    for (let i = 0; i < count; i++) {
      this.clouds.push(
        new Cloud(
          Math.random() * w,
          30 + Math.random() * 80,
          ANIMATION.CLOUD_DRIFT_SPEED * (0.5 + Math.random()),
          'normal',
          w,
        ),
      );
    }
  }

  private handleTabChange(tabId: string): void {
    switch (tabId) {
      case 'social':
        // Navigate to social scene
        break;
      case 'shop':
        // Navigate to shop scene
        break;
      case 'codex':
        // Navigate to codex scene
        break;
      case 'settings':
        // Navigate to settings scene
        break;
      default:
        break;
    }
  }

  update(dt: number): void {
    // Update sky transition
    if (this.skyTransitionProgress < 1) {
      this.skyTransitionProgress = Math.min(
        1,
        this.skyTransitionProgress + dt / this.skyTransitionDuration,
      );
    }

    // Update systems
    this.weatherSystem.update(dt);
    this.growthSystem.update(dt);
    this.coinSystem.update(dt);
    this.spriteSpawnSystem.update(dt);

    // Update entities
    this.island?.update(dt);
    this.windmill?.update(dt);

    for (const plant of this.plants) {
      plant.update(dt);
    }
    for (const sprite of this.sprites) {
      sprite.update(dt);
    }
    for (const cloud of this.clouds) {
      cloud.update(dt);
    }

    // Update weather effects
    this.rainEffect?.update(dt);
    this.snowEffect?.update(dt);
    this.thunderEffect?.update(dt);
    this.fogEffect?.update(dt);

    // Update UI
    this.coinDisplay.update(dt);
    this.weatherWidget.update(dt);
    this.stepWidget.update(dt);
    this.toastManager.update(dt);
    this.tabBar.update(dt);
  }

  fixedUpdate(dt: number): void {
    // Fixed timestep updates for physics/growth
  }

  render(): void {
    const w = this.renderer.width;
    const h = this.renderer.height;

    // Sky background
    this.renderSkyBackground(w, h);

    // Clouds (behind island)
    for (const cloud of this.clouds) {
      cloud.render(this.renderer);
    }

    // Island
    this.island?.render(this.renderer);

    // Plants
    for (const plant of this.plants) {
      plant.render(this.renderer);
    }

    // Sprites
    for (const sprite of this.sprites) {
      sprite.render(this.renderer);
    }

    // Windmill
    this.windmill?.render(this.renderer);

    // Weather effects
    this.rainEffect?.render(this.renderer);
    this.snowEffect?.render(this.renderer);
    this.thunderEffect?.render(this.renderer);
    this.fogEffect?.render(this.renderer);

    // HUD
    this.coinDisplay.render(this.renderer);
    this.weatherWidget.render(this.renderer);
    this.stepWidget.render(this.renderer);

    // Tab bar
    this.tabBar.render(this.renderer);

    // Toasts
    this.toastManager.render(this.renderer);
  }

  private renderSkyBackground(w: number, h: number): void {
    const topColor = this.getCurrentSkyTopColor();
    const bottomColor = this.getCurrentSkyBottomColor();

    this.renderer.drawGradientRect(0, 0, w, h, topColor, bottomColor, true, LAYERS.BACKGROUND);
  }

  private getSkyTopColorForWeather(weatherType: WeatherType): string {
    switch (weatherType) {
      case WeatherType.Sunny:
        return DesignTokens.colors.skySunnyTop;
      case WeatherType.Cloudy:
        return DesignTokens.colors.skyCloudyTop;
      case WeatherType.Rainy:
        return DesignTokens.colors.skyRainyTop;
      case WeatherType.Snowy:
        return DesignTokens.colors.skySnowyTop;
      case WeatherType.Thunderstorm:
        return DesignTokens.colors.skyThunderTop;
      case WeatherType.Foggy:
        return DesignTokens.colors.skyFoggyTop;
      default:
        return DesignTokens.colors.skySunnyTop;
    }
  }

  private getSkyBottomColorForWeather(weatherType: WeatherType): string {
    switch (weatherType) {
      case WeatherType.Sunny:
        return DesignTokens.colors.skySunnyBottom;
      case WeatherType.Cloudy:
        return DesignTokens.colors.skyCloudyBottom;
      case WeatherType.Rainy:
        return DesignTokens.colors.skyRainyBottom;
      case WeatherType.Snowy:
        return DesignTokens.colors.skySnowyBottom;
      case WeatherType.Thunderstorm:
        return DesignTokens.colors.skyThunderBottom;
      case WeatherType.Foggy:
        return DesignTokens.colors.skyFoggyBottom;
      default:
        return DesignTokens.colors.skySunnyBottom;
    }
  }

  private getCurrentSkyTopColor(): string {
    if (this.skyTransitionProgress >= 1) return this.targetSkyTop;
    const from = hexToRgb(this.previousSkyTop);
    const to = hexToRgb(this.targetSkyTop);
    const lerped = lerpColor(from, to, this.skyTransitionProgress);
    return colorToString(lerped);
  }

  private getCurrentSkyBottomColor(): string {
    if (this.skyTransitionProgress >= 1) return this.targetSkyBottom;
    const from = hexToRgb(this.previousSkyBottom);
    const to = hexToRgb(this.targetSkyBottom);
    const lerped = lerpColor(from, to, this.skyTransitionProgress);
    return colorToString(lerped);
  }

  onUnload(): void {
    this.weatherSystem.destroy();
    this.stepSystem.destroy();
    this.spriteSpawnSystem.destroy();
  }
}
