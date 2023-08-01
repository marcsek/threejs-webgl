import { Level } from './Level';
import { Chaos } from './Levels/Chaos/Chaos';
import { Noise } from './Levels/Noise/Noise';
import { Terrain } from './Levels/Terrain/Terrain';

export const levelIDS = ['Chaos', 'Noise', 'Terrain'] as const;
export type LevelID = typeof levelIDS[number];

export class LevelGenerator {
  public static createLevel(id: LevelID, gui: dat.GUI, pmrem: THREE.PMREMGenerator): Level {
    switch (id) {
      case 'Chaos':
        return new Chaos(gui);
      case 'Noise':
        return new Noise(gui);
      case 'Terrain':
        return new Terrain(gui, pmrem);
      default:
        return new Chaos(gui);
    }
  }
}
