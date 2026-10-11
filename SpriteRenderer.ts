export interface SpriteActionConfig {
  imageUrl: string;
  totalFrames: number;
  frameWidth: number;
  frameHeight: number;
  fps: number;
  loop?: boolean;
}

export interface SpriteAnimationState {
  currentAction: string;
  currentFrame: number;
  timer: number;
}

export class SpriteRenderer {
  private configs: Record<string, SpriteActionConfig>;

  constructor(configs: Record<string, SpriteActionConfig>) {
    this.configs = configs;
  }

  /**
   * Advances the animation state based on delta time.
   */
  getNextState(
    currentState: SpriteAnimationState,
    deltaTime: number
  ): SpriteAnimationState {
    const config = this.configs[currentState.currentAction];
    if (!config) return currentState;

    const nextState = { ...currentState };
    nextState.timer += deltaTime;
    const frameDuration = 1 / config.fps;

    if (nextState.timer >= frameDuration) {
      const framesToAdvance = Math.floor(nextState.timer / frameDuration);
      nextState.timer %= frameDuration;
      nextState.currentFrame = (nextState.currentFrame + framesToAdvance) % config.totalFrames;

      if (config.loop === false && nextState.currentFrame < currentState.currentFrame) {
        nextState.currentFrame = config.totalFrames - 1;
      }
    }
    return nextState;
  }

  /**
   * Draws the sprite to the canvas using preloaded images.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    state: SpriteAnimationState,
    x: number,
    y: number,
    width: number,
    height: number,
    loadedImages: Record<string, HTMLImageElement | null>
  ) {
    const config = this.configs[state.currentAction];
    if (!config) return;

    const img = loadedImages[config.imageUrl];

    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback: draw a colored placeholder box if spritesheet is missing
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x, y, width, height);
      return;
    }

    const framesPerRow = Math.max(1, Math.floor(img.naturalWidth / config.frameWidth));
    const sourceX = (state.currentFrame % framesPerRow) * config.frameWidth;
    const sourceY = Math.floor(state.currentFrame / framesPerRow) * config.frameHeight;

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      config.frameWidth,
      config.frameHeight,
      x,
      y,
      width,
      height
    );
  }
}
