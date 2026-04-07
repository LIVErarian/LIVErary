import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { BOOK_TALK_ZONE_IDS } from '@/features/room/bookTalkRoomSlots';
import { useBookTalkRoomStore } from '@/store/useBookTalkRoomStore';
import { MAP_DATA } from '../map/mapAssets';
import { getMapProps, parseMapZones } from '../utils/mapParser';

import type {
  FloorType,
  MapButtonConfig,
  MapCollisionConfig,
  MapZoneRuntime,
  TiledMap,
} from '@/types/game/map.types';

import { contentFont } from '@/styles/global.css.ts';

export class MapManager {
  private _viewport: Viewport;

  // 맵 관련 시각적 요소
  private _bgSprite: Sprite | null = null;
  private _mapButtonsContainer: Container | null = null;
  private _bookTalkRoomInfoContainer: Container | null = null;
  private _bookTalkRoomInfoTextMap: Map<string, Text> = new Map();
  private _bookTalkRoomInfoSnapshot: string = '';

  // 맵 데이터
  public currentFloorId: string = '';
  public currentFloorType: FloorType | null = null;
  public worldWidth: number = 0;
  public worldHeight: number = 0;

  // 충돌 및 존 데이터
  private _collisionGrid: number[] | null = null;
  private _collisionCols: number = 0;
  private _collisionRows: number = 0;
  private _collisionTileWidth: number = 0;
  private _collisionTileHeight: number = 0;

  public mapZones: MapZoneRuntime[] = [];

  private readonly DEFAULT_WIDTH = 1440;
  private readonly DEFAULT_HEIGHT = 810;

  constructor(viewport: Viewport) {
    this._viewport = viewport;
  }

  /**
   * 맵 변경 및 리소스 로드
   */
  public async changeMap(
    floor: FloorType,
  ): Promise<{ width: number; height: number }> {
    const mapConfig = MAP_DATA[floor];
    if (!mapConfig) throw new Error(`Invalid Map: ${floor}`);

    // texture 이미지 가져오기
    const texture = Assets.get(mapConfig.imgAlias);

    let tiledData: TiledMap | null = null;
    if (mapConfig.jsonAlias) {
      tiledData = Assets.get(mapConfig.jsonAlias);
    }

    // 맵 속성 계산
    const mapProps = getMapProps(tiledData);

    this.worldWidth = mapProps.width ?? texture.width ?? this.DEFAULT_WIDTH;
    this.worldHeight = mapProps.height ?? texture.height ?? this.DEFAULT_HEIGHT;
    this.currentFloorId = mapConfig.floorId;
    this.currentFloorType = floor;

    // 배경 스프라이트 갱신
    if (!this._bgSprite) {
      this._bgSprite = new Sprite(texture);
      this._viewport.addChildAt(this._bgSprite, 0);
    } else {
      this._bgSprite.texture = texture;
    }

    this._bgSprite.width = this.worldWidth;
    this._bgSprite.height = this.worldHeight;

    // 각 요소 업데이트
    this.updateCollision(mapProps.collision);
    this.updateMapButtons(mapConfig.buttons);

    const parsedZones = parseMapZones(tiledData, mapConfig.zones);
    this.updateMapZones(parsedZones);
    this.updateBookTalkRoomInfoOverlay(floor);

    return { width: this.worldWidth, height: this.worldHeight };
  }

  private updateCollision(collision?: MapCollisionConfig) {
    if (!collision) {
      this._collisionGrid = null;
      this._collisionCols = 0;
      this._collisionRows = 0;
      this._collisionTileWidth = 0;
      this._collisionTileHeight = 0;
      return;
    }

    this._collisionGrid = collision.grid;
    this._collisionCols = collision.width;
    this._collisionRows = collision.height;
    this._collisionTileWidth = collision.tileWidth;
    this._collisionTileHeight = collision.tileHeight;
  }

  public isWallTile(tileX: number, tileY: number) {
    if (!this._collisionGrid) return false;
    if (
      tileX < 0 ||
      tileY < 0 ||
      tileX >= this._collisionCols ||
      tileY >= this._collisionRows
    ) {
      return true;
    }

    const index = tileY * this._collisionCols + tileX;
    return this._collisionGrid[index] === 1;
  }

  public isColliding(
    nextX: number,
    nextY: number,
    playerW: number,
    playerH: number,
  ) {
    if (!this._collisionGrid) return false;

    const hitboxWidth = playerW * 0.4;
    const hitboxHeight = playerH * 0.35;
    const halfW = hitboxWidth / 2;
    const left = nextX - halfW;
    const right = nextX + halfW;
    const top = nextY - hitboxHeight;
    const bottom = nextY;

    const tileLeft = Math.floor(left / this._collisionTileWidth);
    const tileRight = Math.floor(right / this._collisionTileWidth);
    const tileTop = Math.floor(top / this._collisionTileHeight);
    const tileBottom = Math.floor(bottom / this._collisionTileHeight);

    for (let ty = tileTop; ty <= tileBottom; ty += 1) {
      for (let tx = tileLeft; tx <= tileRight; tx += 1) {
        if (this.isWallTile(tx, ty)) return true;
      }
    }

    return false;
  }

  private updateMapButtons(buttons?: MapButtonConfig[]) {
    if (this._mapButtonsContainer) {
      this._viewport.removeChild(this._mapButtonsContainer);
      this._mapButtonsContainer.destroy({ children: true });
      this._mapButtonsContainer = null;
    }

    if (!buttons || buttons.length === 0) return;

    const container = new Container();
    buttons.forEach((buttonConfig) => {
      const buttonWidth = buttonConfig.width * this.worldWidth;
      const buttonHeight = buttonConfig.height * this.worldHeight;
      const buttonX = buttonConfig.x * this.worldWidth;
      const buttonY = buttonConfig.y * this.worldHeight;

      const button = new Graphics();
      button.rect(0, 0, buttonWidth, buttonHeight).fill({
        color: 0x000000,
        alpha: 0.001,
      });

      if (import.meta.env.DEV) {
        button.rect(0, 0, buttonWidth, buttonHeight).stroke({
          width: 2,
          color: 0xffffff,
          alpha: 0.6,
        });
      }

      button.x = buttonX;
      button.y = buttonY;
      button.eventMode = 'static';
      button.cursor = 'pointer';
      button.on('pointertap', () =>
        console.log(`[MapManager] button clicked: ${buttonConfig.id}`),
      );

      container.addChild(button);
    });

    this._mapButtonsContainer = container;
    this._viewport.addChild(container);
  }

  private updateMapZones(zones?: MapZoneRuntime[]) {
    this.mapZones = zones ?? [];
  }

  /**
   * 3층 독서 모임 공간에서만 Pixi 레이어에 룸 정보 라벨을 생성한다.
   * (요구사항: React UI 오버레이가 아니라 맵 위에 직접 표시)
   */
  public updateBookTalkRoomInfoOverlay(floor: FloorType) {
    if (this._bookTalkRoomInfoContainer) {
      this._viewport.removeChild(this._bookTalkRoomInfoContainer);
      this._bookTalkRoomInfoContainer.destroy({ children: true });
      this._bookTalkRoomInfoContainer = null;
      this._bookTalkRoomInfoTextMap.clear();
      this._bookTalkRoomInfoSnapshot = '';
    }

    if (floor !== 'bookTalkFloor') return;

    const container = new Container();
    this._bookTalkRoomInfoContainer = container;
    this._viewport.addChild(container);

    BOOK_TALK_ZONE_IDS.forEach((zoneId) => {
      const zone = this.mapZones.find((entry) => entry.id === zoneId);
      if (!zone) return;

      const cardWidth = 176;
      const cardHeight = 40;

      // VISUAL 레이어가 존재하면 해당 좌표/크기 사용, 없으면 INTERACTION 좌표로 폴백
      const baseX = zone.visual ? zone.visual.x : zone.x;
      const baseY = zone.visual ? zone.visual.y : zone.y;
      const baseWidth = zone.visual ? zone.visual.width : zone.width;
      const baseHeight = zone.visual ? zone.visual.height : zone.height;

      // 그려진 구역(방 전체)의 가로 중앙에 배치
      const labelLeftX = Math.round(baseX + baseWidth / 2 - cardWidth / 2);

      // 세로 위치 조정: 방의 중앙에서 살짝 위쪽으로 배치하여 테이블/캐릭터를 가리지 않도록 함
      const labelTopY = Math.round(
        baseY + baseHeight / 2 - cardHeight / 2 - 30,
      );

      const labelBackground = new Graphics();
      labelBackground.roundRect(0, 0, cardWidth, cardHeight, 7).fill({
        color: 0x4a2619,
        alpha: 0.9,
      });
      labelBackground.stroke({
        width: 1.5,
        color: 0xc58346,
        alpha: 0.95,
      });
      labelBackground.x = labelLeftX;
      labelBackground.y = labelTopY;

      const labelText = new Text({
        text: '',
        style: {
          fill: 0xddd3b9,
          fontFamily: contentFont,
          fontSize: 11,
          fontWeight: 'normal',
          lineHeight: 14,
          align: 'left',
        },
      });
      labelText.anchor.set(0, 0.5);
      labelText.x = labelLeftX + 8;
      labelText.y = labelTopY + cardHeight / 2;

      this._bookTalkRoomInfoTextMap.set(zoneId, labelText);
      container.addChild(labelBackground);
      container.addChild(labelText);
    });

    this.refreshBookTalkRoomInfoOverlay();
  }

  /**
   * 추천 룸 배열 값이 변경될 때만 라벨 텍스트를 갱신한다.
   * 매 프레임 호출하지만 스냅샷 비교로 실제 변경 시에만 repaint 한다.
   */
  public refreshBookTalkRoomInfoOverlay() {
    if (!this._bookTalkRoomInfoContainer) return;

    const { recommendedRooms, room4Room } = useBookTalkRoomStore.getState();
    const snapshot = JSON.stringify([
      ...recommendedRooms.map((room) => ({
        roomId: room.roomId,
        title: room.title,
        currentCount: room.currentCount,
        maxUser: room.maxUser,
      })),
      // room-4 전용 정보도 스냅샷에 포함해 갱신을 감지한다.
      room4Room
        ? {
            roomId: room4Room.roomId,
            title: room4Room.title,
            currentCount: room4Room.currentCount,
            maxUser: room4Room.maxUser,
          }
        : null,
    ]);

    if (snapshot === this._bookTalkRoomInfoSnapshot) return;
    this._bookTalkRoomInfoSnapshot = snapshot;

    BOOK_TALK_ZONE_IDS.forEach((zoneId, index) => {
      const labelText = this._bookTalkRoomInfoTextMap.get(zoneId);
      if (!labelText) return;

      // room-4는 추천 배열 대신 전용 상태로 표시한다.
      if (zoneId === 'room-4') {
        if (!room4Room) {
          labelText.text = '방 생성하기';
          return;
        }

        const title =
          room4Room.title.length > 12
            ? `${room4Room.title.slice(0, 12)}...`
            : room4Room.title;
        labelText.text = `${title}\n${room4Room.currentCount} / ${room4Room.maxUser}`;
        return;
      }

      const room = recommendedRooms[index];
      if (!room) {
        labelText.text = '배정된 방 없음';
        return;
      }

      const title =
        room.title.length > 12 ? `${room.title.slice(0, 12)}...` : room.title;
      labelText.text = `${title}\n${room.currentCount} / ${room.maxUser}`;
    });
  }

  // 카테고리 배경 변경
  public updateBackgroundTexture(alias: string) {
    if (this._bgSprite) {
      try {
        const texture = Assets.get(alias);
        this._bgSprite.texture = texture;
      } catch (error) {
        console.error(`[MapManager] 배경 변경 실패 (${alias}):`, error);
      }
    }
  }
}
