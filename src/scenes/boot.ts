import Phaser from "phaser";
import { makeTextures } from "../textures.ts";
import { loadSounds } from "../sounds.ts";

/** Runs once: draws every texture and synthesizes every sound, then shows the title. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create(): void {
    makeTextures(this);
    loadSounds(this);
    this.scene.start("title");
  }
}
