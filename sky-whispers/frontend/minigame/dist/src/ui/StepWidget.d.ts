import { Renderer } from '../core/Renderer';
export declare class StepWidget {
    private x;
    private y;
    private steps;
    private windPower;
    private maxWindPower;
    private width;
    private height;
    private progressBar;
    constructor(x: number, y: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private formatSteps;
    setSteps(steps: number): void;
    setWindPower(power: number): void;
    setPosition(x: number, y: number): void;
}
//# sourceMappingURL=StepWidget.d.ts.map