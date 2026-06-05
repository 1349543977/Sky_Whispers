"use strict";
// ============================================================
// WeatherSprite - Cute weather-themed creature with Cloud Whisper aesthetic
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherSprite = void 0;
const types_1 = require("../types");
const constants_1 = require("../utils/constants");
const math_1 = require("../utils/math");
/** Weather-themed color palette per condition */
const WEATHER_PALETTE = {
    [types_1.WeatherType.Rainy]: {
        body: '#7EB5D6',
        bodyEnd: '#5A94B8',
        accent: '#A8D4EC',
        glow: 'rgba(126, 181, 214, 0.3)',
    },
    [types_1.WeatherType.Snowy]: {
        body: '#C8D0DC',
        bodyEnd: '#A3AEBF',
        accent: '#E8EDF2',
        glow: 'rgba(200, 208, 220, 0.3)',
    },
    [types_1.WeatherType.Sunny]: {
        body: '#F2C57C',
        bodyEnd: '#E5A84D',
        accent: '#F7DBA0',
        glow: 'rgba(242, 197, 124, 0.3)',
    },
    [types_1.WeatherType.Thunderstorm]: {
        body: '#90A4AE',
        bodyEnd: '#78909C',
        accent: '#F7DBA0',
        glow: 'rgba(247, 219, 160, 0.3)',
    },
    [types_1.WeatherType.Windy]: {
        body: '#8CC6A5',
        bodyEnd: '#6BA886',
        accent: '#B0DCC2',
        glow: 'rgba(140, 198, 165, 0.3)',
    },
    [types_1.WeatherType.Cloudy]: {
        body: '#A3AEBF',
        bodyEnd: '#7B8AA0',
        accent: '#C8D0DC',
        glow: 'rgba(163, 174, 191, 0.3)',
    },
    [types_1.WeatherType.Foggy]: {
        body: '#B0BEC5',
        bodyEnd: '#90A4AE',
        accent: '#CFD8DC',
        glow: 'rgba(176, 190, 197, 0.3)',
    },
};
class WeatherSprite {
    constructor(data, type, x, y) {
        this.time = 0;
        this.floatOffset = 0;
        this.heartParticles = [];
        this.sparkleTrails = [];
        this.width = 32;
        this.height = 32;
        this.lastTrailTime = 0;
        this.data = data;
        this.type = type;
        this.x = x;
        this.y = y;
        this.baseY = y;
    }
    update(dt) {
        this.time += dt * 1000;
        this.floatOffset = Math.sin(this.time * constants_1.ANIMATION.SPRITE_FLOAT_SPEED) * constants_1.ANIMATION.SPRITE_FLOAT_AMPLITUDE;
        this.y = this.baseY + this.floatOffset;
        // Update heart particles
        for (let i = this.heartParticles.length - 1; i >= 0; i--) {
            const p = this.heartParticles[i];
            p.y += p.vy * dt;
            p.x += p.vx * dt;
            p.alpha -= dt * 0.8;
            if (p.alpha <= 0) {
                this.heartParticles.splice(i, 1);
            }
        }
        // Update sparkle trail particles
        for (let i = this.sparkleTrails.length - 1; i >= 0; i--) {
            const s = this.sparkleTrails[i];
            s.life -= dt * 1000;
            s.alpha = Math.max(0, s.life / s.maxLife) * 0.6;
            if (s.life <= 0) {
                this.sparkleTrails.splice(i, 1);
            }
        }
        // Emit sparkle trail periodically
        if (this.time - this.lastTrailTime > 200) {
            this.lastTrailTime = this.time;
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            this.sparkleTrails.push({
                x: cx + (Math.random() - 0.5) * 10,
                y: cy + (Math.random() - 0.5) * 6,
                alpha: 0.6,
                life: 600,
                maxLife: 600,
                size: 1.5 + Math.random() * 1.5,
            });
            // Cap trail particles
            if (this.sparkleTrails.length > 8) {
                this.sparkleTrails.shift();
            }
        }
    }
    render(renderer) {
        var _a;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const palette = (_a = WEATHER_PALETTE[this.type.weather_condition]) !== null && _a !== void 0 ? _a : WEATHER_PALETTE[types_1.WeatherType.Sunny];
        // Sparkle trail behind sprite
        this.renderSparkleTrail(renderer, palette);
        // Pulsing glow effect around sprite
        const glowPulse = 0.2 + Math.sin(this.time * 0.003) * 0.08;
        renderer.drawRadialGlow(cx, cy, 0, this.width / 2 + 10, palette.glow.replace(/[\d.]+\)$/, `${glowPulse})`), palette.glow.replace(/[\d.]+\)$/, '0)'), constants_1.LAYERS.EFFECTS);
        // Soft shadow beneath sprite
        renderer.drawSoftShadow(cx, this.y + this.height + 4, this.width / 2 - 2, 4, 4, 'rgba(26, 39, 56, 0.08)', constants_1.LAYERS.ENTITIES);
        // Organic rounded body with gradient
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                const bodyGradient = ctx.createRadialGradient(cx - 3, cy - 4, 0, cx, cy, this.width / 2);
                bodyGradient.addColorStop(0, palette.accent);
                bodyGradient.addColorStop(0.6, palette.body);
                bodyGradient.addColorStop(1, palette.bodyEnd);
                ctx.fillStyle = bodyGradient;
                ctx.beginPath();
                ctx.ellipse(cx, cy, this.width / 2, this.height / 2 + 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
        });
        // Small limbs (feet)
        this.renderLimbs(renderer, cx, cy, palette);
        // Face
        this.renderFace(renderer, cx, cy);
        // Weather-themed accessory
        this.renderAccessory(renderer, cx, cy, palette);
        // Level badge with gradient
        this.renderLevelBadge(renderer, cx, cy);
        // Heart particles
        this.renderHeartParticles(renderer);
    }
    /** Render small feet/limbs beneath the body */
    renderLimbs(renderer, cx, cy, palette) {
        const footY = cy + this.height / 2 - 1;
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.fillStyle = palette.bodyEnd;
                // Left foot
                ctx.beginPath();
                ctx.ellipse(cx - 6, footY, 4, 3, -0.15, 0, Math.PI * 2);
                ctx.fill();
                // Right foot
                ctx.beginPath();
                ctx.ellipse(cx + 6, footY, 4, 3, 0.15, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
        });
    }
    /** Render the sprite's face with expressive eyes and mouth */
    renderFace(renderer, cx, cy) {
        // Eyes - white with gradient
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                // Left eye white
                const eyeGradient = ctx.createRadialGradient(cx - 5, cy - 4, 0, cx - 5, cy - 3, 4);
                eyeGradient.addColorStop(0, '#FFFFFF');
                eyeGradient.addColorStop(1, '#F0F3F7');
                ctx.fillStyle = eyeGradient;
                ctx.beginPath();
                ctx.ellipse(cx - 5, cy - 3, 4, 4.5, 0, 0, Math.PI * 2);
                ctx.fill();
                // Right eye white
                const eyeGradient2 = ctx.createRadialGradient(cx + 5, cy - 4, 0, cx + 5, cy - 3, 4);
                eyeGradient2.addColorStop(0, '#FFFFFF');
                eyeGradient2.addColorStop(1, '#F0F3F7');
                ctx.fillStyle = eyeGradient2;
                ctx.beginPath();
                ctx.ellipse(cx + 5, cy - 3, 4, 4.5, 0, 0, Math.PI * 2);
                ctx.fill();
                // Pupils with highlight
                ctx.fillStyle = '#2C3E50';
                ctx.beginPath();
                ctx.arc(cx - 4.5, cy - 2.5, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx + 5.5, cy - 2.5, 2, 0, Math.PI * 2);
                ctx.fill();
                // Eye highlights
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.beginPath();
                ctx.arc(cx - 5.5, cy - 4, 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx + 4.5, cy - 4, 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
        });
        // Mouth based on happiness
        const happiness = (0, math_1.clamp)(this.data.happiness, 0, 100);
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.strokeStyle = '#2C3E50';
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                if (happiness > 60) {
                    // Happy mouth - curved smile
                    ctx.beginPath();
                    ctx.arc(cx, cy + 2, 5, 0.15 * Math.PI, 0.85 * Math.PI);
                    ctx.stroke();
                    // Blush cheeks
                    ctx.fillStyle = 'rgba(255, 150, 150, 0.2)';
                    ctx.beginPath();
                    ctx.ellipse(cx - 9, cy + 1, 3, 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(cx + 9, cy + 1, 3, 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                else if (happiness > 30) {
                    // Neutral mouth
                    ctx.beginPath();
                    ctx.moveTo(cx - 3, cy + 4);
                    ctx.lineTo(cx + 3, cy + 4);
                    ctx.stroke();
                }
                else {
                    // Sad mouth
                    ctx.beginPath();
                    ctx.arc(cx, cy + 8, 4, 1.15 * Math.PI, 1.85 * Math.PI);
                    ctx.stroke();
                }
                ctx.restore();
            },
        });
    }
    /** Render weather-themed accessory on top of the sprite */
    renderAccessory(renderer, cx, cy, palette) {
        const topY = cy - this.height / 2;
        switch (this.type.weather_condition) {
            case types_1.WeatherType.Rainy: {
                // Rain drop on head with glow
                renderer.drawRadialGlow(cx, topY - 4, 0, 8, 'rgba(126, 181, 214, 0.2)', 'rgba(126, 181, 214, 0)', constants_1.LAYERS.EFFECTS);
                renderer.addCommand({
                    layer: constants_1.LAYERS.ENTITIES,
                    draw: (ctx) => {
                        ctx.save();
                        const dropGradient = ctx.createRadialGradient(cx - 1, topY - 5, 0, cx, topY - 4, 5);
                        dropGradient.addColorStop(0, constants_1.COLORS.WATER_LIGHT);
                        dropGradient.addColorStop(1, constants_1.COLORS.RAIN);
                        ctx.fillStyle = dropGradient;
                        ctx.beginPath();
                        ctx.moveTo(cx, topY - 9);
                        ctx.bezierCurveTo(cx - 4, topY - 4, cx - 4, topY - 1, cx, topY);
                        ctx.bezierCurveTo(cx + 4, topY - 1, cx + 4, topY - 4, cx, topY - 9);
                        ctx.fill();
                        // Highlight
                        ctx.fillStyle = 'rgba(255,255,255,0.4)';
                        ctx.beginPath();
                        ctx.arc(cx - 1, topY - 5, 1.2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    },
                });
                break;
            }
            case types_1.WeatherType.Snowy: {
                // Snowflake sparkle on head
                renderer.drawSparkle(cx, topY - 5, 5, '#E8EDF2', 0.8, constants_1.LAYERS.ENTITIES);
                renderer.drawSparkle(cx, topY - 5, 3, '#FAFBFD', 0.5, constants_1.LAYERS.EFFECTS);
                break;
            }
            case types_1.WeatherType.Sunny: {
                // Mini sun on head with glow
                renderer.drawRadialGlow(cx, topY - 3, 0, 10, 'rgba(242, 197, 124, 0.25)', 'rgba(242, 197, 124, 0)', constants_1.LAYERS.EFFECTS);
                renderer.addCommand({
                    layer: constants_1.LAYERS.ENTITIES,
                    draw: (ctx) => {
                        ctx.save();
                        const sunGradient = ctx.createRadialGradient(cx, topY - 4, 0, cx, topY - 3, 6);
                        sunGradient.addColorStop(0, '#FFE882');
                        sunGradient.addColorStop(1, '#F2C57C');
                        ctx.fillStyle = sunGradient;
                        ctx.beginPath();
                        ctx.arc(cx, topY - 3, 5, 0, Math.PI * 2);
                        ctx.fill();
                        // Sun rays
                        ctx.strokeStyle = '#F7DBA0';
                        ctx.lineWidth = 1;
                        ctx.lineCap = 'round';
                        for (let i = 0; i < 6; i++) {
                            const angle = (i / 6) * Math.PI * 2 + this.time * 0.001;
                            ctx.beginPath();
                            ctx.moveTo(cx + Math.cos(angle) * 6, topY - 3 + Math.sin(angle) * 6);
                            ctx.lineTo(cx + Math.cos(angle) * 8, topY - 3 + Math.sin(angle) * 8);
                            ctx.stroke();
                        }
                        ctx.restore();
                    },
                });
                break;
            }
            case types_1.WeatherType.Thunderstorm: {
                // Lightning bolt with glow
                renderer.drawRadialGlow(cx, topY - 4, 0, 8, 'rgba(247, 219, 160, 0.25)', 'rgba(247, 219, 160, 0)', constants_1.LAYERS.EFFECTS);
                renderer.addCommand({
                    layer: constants_1.LAYERS.ENTITIES,
                    draw: (ctx) => {
                        ctx.save();
                        ctx.fillStyle = '#FFF9C4';
                        ctx.shadowColor = 'rgba(247, 219, 160, 0.5)';
                        ctx.shadowBlur = 4;
                        ctx.beginPath();
                        ctx.moveTo(cx + 1, topY - 10);
                        ctx.lineTo(cx - 3, topY - 3);
                        ctx.lineTo(cx, topY - 3);
                        ctx.lineTo(cx - 1, topY + 1);
                        ctx.lineTo(cx + 3, topY - 5);
                        ctx.lineTo(cx, topY - 5);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    },
                });
                break;
            }
            case types_1.WeatherType.Windy: {
                // Wind swirl lines
                renderer.addCommand({
                    layer: constants_1.LAYERS.ENTITIES,
                    draw: (ctx) => {
                        ctx.save();
                        ctx.strokeStyle = palette.accent;
                        ctx.lineWidth = 1.5;
                        ctx.lineCap = 'round';
                        ctx.globalAlpha = 0.7;
                        for (let i = 0; i < 3; i++) {
                            const offsetY = -4 + i * 4;
                            const wave = Math.sin(this.time * 0.004 + i) * 2;
                            ctx.beginPath();
                            ctx.moveTo(cx + this.width / 2 + 2, cy + offsetY);
                            ctx.quadraticCurveTo(cx + this.width / 2 + 6 + wave, cy + offsetY - 1, cx + this.width / 2 + 10, cy + offsetY);
                            ctx.stroke();
                        }
                        ctx.restore();
                    },
                });
                break;
            }
            default:
                break;
        }
    }
    /** Render level badge with gradient background */
    renderLevelBadge(renderer, cx, cy) {
        const badgeX = cx + this.width / 2 - 8;
        const badgeY = cy + this.width / 2 - 4;
        renderer.fillGradientRoundRect(badgeX, badgeY, 18, 13, 6, '#3D4F65', '#2A3A4E', true, constants_1.LAYERS.ENTITIES);
        // Badge border glow
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                const r = 6;
                const x = badgeX;
                const y = badgeY;
                const w = 18;
                const h = 13;
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            },
        });
        renderer.drawText(`Lv${this.data.level}`, badgeX + 9, badgeY + 6.5, '#FAFBFD', 7, 'center', 'middle', constants_1.LAYERS.ENTITIES);
    }
    /** Render sparkle trail particles behind the sprite */
    renderSparkleTrail(renderer, palette) {
        for (const s of this.sparkleTrails) {
            renderer.drawSparkle(s.x, s.y, s.size, palette.accent, s.alpha, constants_1.LAYERS.EFFECTS);
        }
    }
    /** Render floating heart particles */
    renderHeartParticles(renderer) {
        for (const p of this.heartParticles) {
            renderer.drawHeart(p.x, p.y, p.size, '#FF6B6B', p.alpha, constants_1.LAYERS.EFFECTS);
        }
    }
    emitHearts() {
        const cx = this.x + this.width / 2;
        const cy = this.y;
        for (let i = 0; i < 3; i++) {
            this.heartParticles.push({
                x: cx + (Math.random() - 0.5) * 16,
                y: cy - 8 - Math.random() * 8,
                alpha: 1,
                vy: -30 - Math.random() * 20,
                vx: (Math.random() - 0.5) * 10,
                size: 3 + Math.random() * 2,
            });
        }
    }
    containsPoint(px, py) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = px - cx;
        const dy = py - cy;
        return dx * dx + dy * dy <= (this.width / 2 + 4) * (this.width / 2 + 4);
    }
    getData() {
        return this.data;
    }
    updateData(data) {
        this.data = data;
    }
    getType() {
        return this.type;
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
}
exports.WeatherSprite = WeatherSprite;
//# sourceMappingURL=WeatherSprite.js.map