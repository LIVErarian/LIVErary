import { AnimatedSprite, Texture } from 'pixi.js';

import type { Direction } from '@/types/socket/socket.types';

// 캐릭터의 파츠 (순서대로 정의해야 함)
export type PartType = 'body' | 'pants' | 'shirt' | 'hair';

// 캐릭터 설정값
export interface PartConfig {
  sheetTexture: Texture; // 해당 부위의 스프라이트 시트 텍스처
  sitSheetTexture?: Texture; // 앉기용 텍스쳐
  tint?: number; // 색상 (0xFFFFFF 등), 없으면 원본 색
}

// 클래스 내부에서 관리하는 실제 레이어 객체 구조
export interface CharacterLayer {
  sprite: AnimatedSprite;
  walkTextures: Record<Direction, Texture[]>;
  sitTextures: Record<Direction, Texture[]>;
}

// 전체 파츠 구성을 나타내는 타입
export type CharacterParts = Record<PartType, PartConfig>;
