import { Level } from './Level';
import { Chaos } from './Levels/Chaos/Chaos';
import { Test } from './Levels/Test';

export const levelIDS = ['Chaos', 'Test'] as const;
export type LevelID = (typeof levelIDS)[number];

export class LevelGenerator {
  public static createLevel(id: LevelID, gui: dat.GUI): Level {
    switch (id) {
      case 'Chaos':
        return new Chaos(gui);
      case 'Test':
        return new Test(gui);
      default:
        return new Chaos(gui);
    }
  }
}
