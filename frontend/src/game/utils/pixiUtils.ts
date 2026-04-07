import { Rectangle, Texture } from 'pixi.js';

import type { Direction } from '@/types/socket/socket.types';

/**
 * 스프라이트 시트를 행(row)과 열(col)로 나누어 방향별 텍스처 배열로 반환합니다.
 * 가정: 행 순서는 DOWN(0) -> LEFT(1) -> RIGHT(2) -> UP(3) 순서여야 합니다.
 */
export const parseSpriteSheet = (
  texture: Texture,
  cols: number,
  rows: number,
): Record<Direction, Texture[]> => {
  const frameWidth = texture.width / cols;
  const frameHeight = texture.height / rows;
  const result: Record<Direction, Texture[]> = {
    DOWN: [],
    LEFT: [],
    RIGHT: [],
    UP: [],
  };

  const directions: Direction[] = ['DOWN', 'LEFT', 'RIGHT', 'UP'];

  for (let r = 0; r < rows; r++) {
    // rows가 4보다 클 경우를 대비해 안전하게 undefined 체크
    const dir = directions[r];
    if (!dir) continue;

    for (let c = 0; c < cols; c++) {
      const frame = new Texture({
        source: texture.source,
        frame: new Rectangle(
          c * frameWidth,
          r * frameHeight,
          frameWidth,
          frameHeight,
        ),
      });
      result[dir].push(frame);
    }
  }

  return result;
};
