// ============================================================
// Timer Utilities
// ============================================================

export class Timer {
  private elapsed: number = 0;
  private duration: number;
  private callback: () => void;
  private recurring: boolean;
  private active: boolean = true;

  constructor(duration: number, callback: () => void, recurring: boolean = false) {
    this.duration = duration;
    this.callback = callback;
    this.recurring = recurring;
  }

  update(dt: number): void {
    if (!this.active) return;
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.callback();
      if (this.recurring) {
        this.elapsed -= this.duration;
      } else {
        this.active = false;
      }
    }
  }

  get progress(): number {
    return Math.min(this.elapsed / this.duration, 1);
  }

  get isActive(): boolean {
    return this.active;
  }

  reset(): void {
    this.elapsed = 0;
    this.active = true;
  }

  cancel(): void {
    this.active = false;
  }
}

export class TimerManager {
  private timers: Timer[] = [];

  addTimer(duration: number, callback: () => void, recurring: boolean = false): Timer {
    const timer = new Timer(duration, callback, recurring);
    this.timers.push(timer);
    return timer;
  }

  update(dt: number): void {
    for (let i = this.timers.length - 1; i >= 0; i--) {
      this.timers[i].update(dt);
      if (!this.timers[i].isActive) {
        this.timers.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.timers = [];
  }

  removeTimer(timer: Timer): void {
    const idx = this.timers.indexOf(timer);
    if (idx !== -1) {
      this.timers.splice(idx, 1);
    }
  }
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDuration(ms: number): string {
  if (ms < 60000) {
    return `${Math.ceil(ms / 1000)}秒`;
  }
  if (ms < 3600000) {
    return `${Math.floor(ms / 60000)}分钟`;
  }
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (minutes === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${minutes}分钟`;
}

export function now(): number {
  return Date.now();
}

export function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}
