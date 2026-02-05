import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  Ticker,
} from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { roomApi } from '@/api/room.api';
import playerMSheetImg from '@/assets/characters/basic_male.png';
import { findRecommendedRoomByZone } from '@/features/room/bookTalkRoomMatcher';
import {
  BOOK_TALK_ZONE_IDS,
  isBookTalkZone,
} from '@/features/room/bookTalkRoomSlots';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookTalkRoomStore } from '@/store/useBookTalkRoomStore';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';
import { useSocketStore } from '@/store/useSocketStore';
import { throttle } from '@/utils/throttle';
import { MAP_DATA } from '../map/mapAssets';
import { Player } from '../player/Player';

import type {
  FloorType,
  MapButtonConfig,
  MapCollisionConfig,
  MapZoneAction,
  MapZoneConfig,
} from '@/types/map.types';
import type {
  Direction,
  MoveBroadcast,
  MoveRequest,
} from '@/types/socket.types';

import { contentFont } from '@/styles/global.css';
import { palette } from '@/styles/theme.css';

export class GameApp {
  private _app: Application;
  private _viewport!: Viewport;
  private _player!: Player;
  private _keys: { [key: string]: boolean } = {};
  private _lookingDirection: Direction = 'DOWN';
  private _otherPlayers: Map<string, Player> = new Map();
  private _myId: string = '';
  private _isPrevMoving: boolean = false;
  private _isDestroyed: boolean = false;
  // leaveRoom 중복 호출 방지용 플래그
  private _isLeavingRoom: boolean = false;
  private _isInteractPressed: boolean = false;
  private _suppressZoneTriggers: Map<string, Set<'enter' | 'exit'>> = new Map();
  private _bgSprite: Sprite | null = null;
  private _mapButtonsContainer: Container | null = null;
  private _bookTalkRoomInfoContainer: Container | null = null;
  private _bookTalkRoomInfoTextMap: Map<string, Text> = new Map();
  private _bookTalkRoomInfoSnapshot: string = '';
  private _mapZones: Array<
    MapZoneConfig & { absX: number; absY: number; absW: number; absH: number }
  > = [];
  private _activeZoneIds: Set<string> = new Set();
  private _collisionGrid: number[] | null = null;
  private _collisionCols: number = 0;
  private _collisionRows: number = 0;
  private _collisionTileWidth: number = 0;
  private _collisionTileHeight: number = 0;
  private _worldWidth: number = 960;
  private _worldHeight: number = 640;
  private _currentFloorId: string = '';
  // 이동 브로드캐스트 채널 ID (회의실은 roomId, 그 외는 floorId)
  private _movementChannelId: string = '';
  private _sendMoveThrottled: (payload: MoveRequest) => void;

  private readonly MOVE_SPEED = 4;
  private readonly DEFAULT_WIDTH = 1440;
  private readonly DEFAULT_HEIGHT = 810;
  private readonly DEFAULT_PLAYER_SCALE = 2;
  private readonly MY_ROOM_PLAYER_SCALE = 5;
  private readonly MY_ROOM_SPEED_MULTIPLIER = 2;
  private readonly CONFERENCE_ENTRY_SPAWN = { x: 0.88, y: 0.5 };

  constructor() {
    this._app = new Application();

    // 스로틀링
    this._sendMoveThrottled = throttle((payload: MoveRequest) => {
      // 내 방이면 전송 중단
      if (this._currentFloorId === MAP_DATA.myRoom.floorId) return;

      const { isConnected, sendMove } = useSocketStore.getState();
      if (isConnected) {
        sendMove(payload);
      }
    }, 50);
  }

  // Getter
  public get canvas() {
    return this._app.canvas;
  }

  public async init(container: HTMLDivElement) {
    if (this._isDestroyed) return;

    // 로그인한 내 ID
    const user = useAuthStore.getState().user;
    if (user && user.userId) {
      this._myId = user.userId;
    } else {
      // 로그인 안 된 상태면 임시 ID
      this._myId = `guest_${Math.floor(Math.random() * 1000)}`;
    }

    await this._app.init({
      background: palette.background,
      resizeTo: container,
      antialias: false,
      autoDensity: true,
      resolution: window.devicePixelRatio,
    });

    if (this._isDestroyed) {
      this._app.destroy({ removeView: true }, { children: true });
      return;
    }

    container.innerHTML = '';
    container.appendChild(this._app.canvas);

    this.createViewport();

    // 이미 로드된 에셋인지 확인
    if (!Assets.cache.has('playerSheet')) {
      Assets.add({ alias: 'playerSheet', src: playerMSheetImg });
      await Assets.load('playerSheet');
    }

    // 초기 맵 로드
    await this.changeMap('myRoom');

    this.createPlayer(user?.nickname);
    this.addEventHandlers();

    this._app.ticker.add(this.update, this);
  }

  public async changeMap(floor: FloorType) {
    const mapConfig = MAP_DATA[floor];
    if (!mapConfig) return;

    // 이전 채널 ID를 보관해 exit 전송에 사용한다.
    const prevMovementChannelId = this._movementChannelId;
    const prevFloorId = this._currentFloorId;
    this._worldWidth = mapConfig.width ?? this.DEFAULT_WIDTH;
    this._worldHeight = mapConfig.height ?? this.DEFAULT_HEIGHT;
    this._currentFloorId = mapConfig.floorId;
    // 회의실은 roomId 채널로, 나머지는 floorId 채널로 구독한다.
    this._movementChannelId = this.getMovementChannelId(
      floor,
      mapConfig.floorId,
    );

    // 플레이어 위치 설정
    const spawnPoint = useGameStore.getState().spawnPoint;

    // 플레이어 위치 및 방향 초기화
    if (this._player) {
      // floor에 따른 캐릭터 크기 변경
      this._player.setScaleFactor(
        this.getPlayerScaleForFloorId(this._currentFloorId),
      );

      if (spawnPoint) {
        // spanwPoint 있는 경우 spawnPoint로 위치 초기화
        this._player.x = this._viewport.worldWidth * spawnPoint.x;
        this._player.y = this._viewport.worldHeight * spawnPoint.y;

        // null로 초기화해야 다음 이동에 영향 x
        useGameStore.getState().setSpawnPoint(null);
      } else {
        if (floor === 'myRoom') {
          this._player.x = this._worldWidth / 2;
          this._player.y = this._worldHeight / 2;
        } else if (floor === 'bookConcert') {
          this._player.x = this._worldWidth / 2;
          this._player.y = this._worldHeight;
        } else {
          // 기본 엘리베이터 위치
          this._player.x = this._worldWidth * 0.38;
          this._player.y = this._worldHeight * 0.25;
        }
      }
      // 아래쪽 보는 애니메이션으로 자동 세팅
      this._lookingDirection = 'DOWN';
      this._player.setAnimation('DOWN', false);
    }

    const { subscribeMove, unsubscribeMove, isConnected, sendEnter } =
      useSocketStore.getState();

    // 기존 데이터 정리 및 구독 해제
    // 기존 채널을 정리하면서 이전 채널 ID로 exit를 보낸다.
    unsubscribeMove({
      sendExit: true,
      exitFloorId: prevMovementChannelId || prevFloorId,
    });
    this.clearOtherPlayers();

    // 내 방이 아니고 연결되어 있을 때만 구독
    if (floor !== 'myRoom' && isConnected) {
      const movementChannelId = this._movementChannelId;
      if (!movementChannelId) return;
      // 구독 시작 로그를 실제 로직 호출 직전에 남기기
      console.log(
        `[GameApp] ${floor}(${movementChannelId}) 구독 프로세스 시작`,
      );

      // await를 사용하여 순서 보장
      await subscribeMove(movementChannelId, (moves) => {
        this.updateOtherPlayers(moves);
      });

      // 플레이어가 존재할 때만 위치 전송
      if (useSocketStore.getState().isConnected && this._player) {
        // 서버에는 floorId 필드에 "채널 ID"를 전달한다.
        sendEnter({
          floorId: movementChannelId,
          x: this._player.x,
          y: this._player.y,
          direction: this._lookingDirection,
        });
      }
    } else if (floor === 'myRoom') {
      console.log('내 방: 위치 공유 안 함');
    }

    // 맵 변경
    if (this._viewport) {
      this._viewport.resize(
        this._app.screen.width,
        this._app.screen.height,
        this._worldWidth,
        this._worldHeight,
      );
      this._viewport.clamp({ direction: 'all' });
    }

    const texture = await Assets.load(mapConfig.img);
    if (!this._bgSprite) {
      this._bgSprite = new Sprite(texture);
      this._viewport.addChildAt(this._bgSprite, 0);
    } else {
      this._bgSprite.texture = texture;
    }

    this._bgSprite.width = this._worldWidth;
    this._bgSprite.height = this._worldHeight;

    this.updateMapButtons(mapConfig);
    this.updateMapZones(mapConfig);
    this.updateBookTalkRoomInfoOverlay(floor);
    this.updateCollision(mapConfig);

    // 중앙 정렬 로직
    const screenWidth = this._viewport.screenWidth;
    const screenHeight = this._viewport.screenHeight;
    if (this._worldWidth < screenWidth || this._worldHeight < screenHeight) {
      this._viewport.moveCenter(this._worldWidth / 2, this._worldHeight / 2);
    } else {
      if (this._player) {
        this._viewport.moveCenter(this._player.x, this._player.y);
        this._viewport.follow(this._player);
      } else {
        this._viewport.moveCenter(this._worldWidth / 2, this._worldHeight / 2);
      }
    }

    // 맵 바뀌면 다른 유저 지우기
    this.clearOtherPlayers();
  }

  private updateMapButtons(mapConfig: { buttons?: MapButtonConfig[] }) {
    if (this._mapButtonsContainer) {
      this._viewport.removeChild(this._mapButtonsContainer);
      this._mapButtonsContainer.destroy({ children: true });
      this._mapButtonsContainer = null;
    }

    if (!mapConfig.buttons || mapConfig.buttons.length === 0) return;

    const container = new Container();
    mapConfig.buttons.forEach((buttonConfig) => {
      const buttonWidth = buttonConfig.width * this._worldWidth;
      const buttonHeight = buttonConfig.height * this._worldHeight;
      const buttonX = buttonConfig.x * this._worldWidth;
      const buttonY = buttonConfig.y * this._worldHeight;

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
      button.on('pointertap', () => this.handleMapButtonClick(buttonConfig));

      container.addChild(button);
    });

    this._mapButtonsContainer = container;
    this._viewport.addChild(container);
  }

  private handleMapButtonClick(button: MapButtonConfig) {
    console.log(`[GameApp] map button clicked: ${button.id}`);
  }

  private updateMapZones(mapConfig: { zones?: MapZoneConfig[] }) {
    this._activeZoneIds.clear();
    this._mapZones = (mapConfig.zones ?? []).map((zone) => ({
      ...zone,
      absX: zone.x * this._worldWidth,
      absY: zone.y * this._worldHeight,
      absW: zone.width * this._worldWidth,
      absH: zone.height * this._worldHeight,
    }));
  }

  /**
   * 3층 독서 모임 공간에서만 Pixi 레이어에 룸 정보 라벨을 생성한다.
   * (요구사항: React UI 오버레이가 아니라 맵 위에 직접 표시)
   */
  private updateBookTalkRoomInfoOverlay(floor: FloorType) {
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
      const zone = this._mapZones.find((entry) => entry.id === zoneId);
      if (!zone) return;

      // 각 zone의 좌상단 기준으로 약간 오른쪽/아래에 고정 배치
      const labelLeftX = Math.round(zone.absX + 20);
      const labelTopY = Math.round(zone.absY + 20);
      const cardWidth = 176;
      const cardHeight = 40;

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
  private refreshBookTalkRoomInfoOverlay() {
    if (!this._bookTalkRoomInfoContainer) return;

    const { recommendedRooms, room4Room } = useBookTalkRoomStore.getState();
    const snapshot = JSON.stringify(
      [
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
      ],
    );

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

  private updateCollision(mapConfig: { collision?: MapCollisionConfig }) {
    const collision = mapConfig.collision;
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

  private isWallTile(tileX: number, tileY: number) {
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

  private isColliding(nextX: number, nextY: number) {
    if (!this._collisionGrid) return false;

    const hitboxWidth = this._player.playerWidth * 0.4;
    const hitboxHeight = this._player.playerHeight * 0.35;
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

  private movePlayerToPosition(
    position:
      | 'zoneCenter'
      | 'screenCenter'
      | 'zoneFrontAbove'
      | 'zoneFrontBelow',
    zone?: MapZoneConfig,
    suppressNextTrigger?: 'enter' | 'exit',
  ) {
    if (!this._player) return;

    if (position === 'screenCenter') {
      this._player.x = this._worldWidth / 2;
      this._player.y = this._worldHeight / 2;
    } else if (zone) {
      const zoneX = zone.absX ?? zone.x * this._worldWidth;
      const zoneY = zone.absY ?? zone.y * this._worldHeight;
      const zoneW = zone.absW ?? zone.width * this._worldWidth;
      const zoneH = zone.absH ?? zone.height * this._worldHeight;
      const centerX = zoneX + zoneW / 2;
      const centerY = zoneY + zoneH / 2;
      const offsetY = this._worldHeight * 0.05;

      if (position === 'zoneCenter') {
        /**
         * 독서모임 4개 룸은 중앙 스폰 시 충돌 타일에 걸릴 수 있어
         * 룸 내부 이동 가능한 지점으로 하드코딩 스폰한다.
         */
        const hardcodedEntryByZone: Record<string, { x: number; y: number }> = {
          'room-1': { x: zoneX + zoneW * 0.5, y: zoneY + zoneH * 0.78 },
          'room-2': { x: zoneX + zoneW * 0.5, y: zoneY + zoneH * 0.78 },
          'room-3': { x: zoneX + zoneW * 0.5, y: zoneY + zoneH * 0.68 },
          'room-4': { x: zoneX + zoneW * 0.5, y: zoneY + zoneH * 0.68 },
        };

        const hardcoded = hardcodedEntryByZone[zone.id];
        this._player.x = hardcoded?.x ?? centerX;
        this._player.y = hardcoded?.y ?? centerY;
      } else if (position === 'zoneFrontBelow') {
        this._player.x = centerX;
        this._player.y = zoneY + zoneH + offsetY;
      } else if (position === 'zoneFrontAbove') {
        this._player.x = centerX;
        this._player.y = zoneY - offsetY;
      }
    }

    if (zone && suppressNextTrigger) {
      const existing = this._suppressZoneTriggers.get(zone.id) ?? new Set();
      existing.add(suppressNextTrigger);
      this._suppressZoneTriggers.set(zone.id, existing);
    }

    this._viewport.moveCenter(this._player.x, this._player.y);
    this.sendMyPosition(false);
  }

  private handleZoneAction(action?: MapZoneAction, zone?: MapZoneConfig) {
    if (!action) return;

    if (action.type === 'moveConfirm') {
      useModalStore.getState().openModal('move', {
        title: action.title,
        message: action.message,
        onConfirm: () => {
          useGameStore.getState().setCurrentFloor(action.targetFloor);
        },
      });
    }

    // 회의실 출구 인터랙션용: 퇴장 확인 후 STOMP + HTTP 모두 보낸다.
    if (action.type === 'leaveRoomConfirm') {
      useModalStore.getState().openModal('entrance', {
        title: action.title || '퇴장 확인',
        message: action.message,
        onConfirm: async () => {
          if (this._isLeavingRoom) return;
          this._isLeavingRoom = true;

          try {
            const roomId = useGameStore.getState().roomId;
            if (roomId) {
              useSocketStore.getState().sendLeaveRoom({ roomId });
              await roomApi.leaveRoom({ roomId });
            }

            useGameStore.getState().setRoomId(null);
            useGameStore.getState().setSpawnPoint({ x: 0.5, y: 0.5 });
            useGameStore.getState().setCurrentFloor('bookTalkFloor');
          } catch (error: unknown) {
            console.error('회의실 퇴장 실패:', error);
            const apiError = error as {
              response?: { data?: { message?: string } };
            };
            alert(
              apiError?.response?.data?.message ??
                '퇴장 처리에 실패했습니다. 잠시 후 다시 시도해주세요.',
            );
          } finally {
            this._isLeavingRoom = false;
          }
        },
      });
    }

    if (action.type === 'confirm') {
      useModalStore.getState().openModal('entrance', {
        title: action.title,
        message: action.message,
      });
    }

    if (action.type === 'openModal') {
      useModalStore.getState().openModal(action.modalType);
    }

    if (action.type === 'confirmReposition') {
      // 이동 후 즉시 재충돌 방지
      const suppressFor = (
        position:
          | 'zoneCenter'
          | 'screenCenter'
          | 'zoneFrontAbove'
          | 'zoneFrontBelow',
        context: 'confirm' | 'cancel',
      ): 'enter' | 'exit' | undefined => {
        if (position === 'zoneCenter') {
          return context === 'cancel' ? 'enter' : undefined;
        }
        if (position === 'screenCenter') {
          return 'exit';
        }
        return 'exit';
      };

      const { room4Room } = useBookTalkRoomStore.getState();
      // room-4가 비어있으면 입장 대신 방 생성 모달을 띄운다.
      if (zone?.id === 'room-4' && !room4Room) {
        useModalStore.getState().openModal('createRoom');
        this.movePlayerToPosition(
          action.cancelPosition,
          zone,
          suppressFor(action.cancelPosition, 'confirm'),
        );
        return;
      }

      // 모달 열기
      useModalStore.getState().openModal('entrance', {
        title: action.title,
        message: action.message,

        // 확인 버튼 클릭 시 로직
        onConfirm: async () => {
          console.log('📍 이동 위치 확인:', action.confirmPosition); // 디버깅용 로그

          // 방 입장시
          if (action.confirmPosition === 'zoneCenter') {
            console.log(`🚪 [${zone?.id}] 방 입장 로직 실행`);

            /**
             * 서버가 입장을 거절하거나(room full / 권한 없음 등),
             * 타겟 roomId를 찾지 못한 경우에는 사용자를 즉시 zone 바깥으로 되돌린다.
             */
            const bounceOutFromZone = () => {
              this.movePlayerToPosition(
                action.cancelPosition,
                zone,
                suppressFor(action.cancelPosition, 'confirm'),
              );
            };

            try {
              let targetRoomId: string | null = null;

              /**
               * 독서 모임 공간(room-1 ~ room-4)은
               * 이미 프론트에서 받아둔 추천 방 배열을 인덱스 기준으로 사용한다.
               * - room-1 -> recommendedRooms[0]
               * - room-2 -> recommendedRooms[1]
               * - room-3 -> recommendedRooms[2]
               * - room-4 -> recommendedRooms[3]
               */
              if (zone?.id && isBookTalkZone(zone.id)) {
                /**
                 * 독서모임 4개 존은 "추천 배열 인덱스"로만 방을 결정한다.
                 * 서버에서 받은 추천 순서를 곧 화면 배치 순서로 취급한다.
                 * (요구사항: category 기반 recommend 배열을 4개 존에 배정)
                 */
                const { recommendedRooms, room4Room } =
                  useBookTalkRoomStore.getState();
                // room-4는 전용 방, 나머지는 추천 배열 인덱스로 매핑한다.
                const targetRoom =
                  zone.id === 'room-4' && room4Room
                    ? room4Room
                    : findRecommendedRoomByZone(zone.id, recommendedRooms);
                targetRoomId = targetRoom?.roomId ?? null;
              } else {
                // 기존 흐름 유지: 북콘서트/독서실 등은 roomType 기반으로 첫 방 1개 선택
                let targetType: 'TALK' | 'READING' | 'CONCERT' | undefined;
                if (zone?.id?.includes('room-')) targetType = 'TALK';
                else if (zone?.id?.includes('concert')) targetType = 'CONCERT';
                else if (zone?.id?.includes('reading')) targetType = 'READING';

                const response = await roomApi.getRoomList({
                  size: 50,
                  roomType: targetType,
                });
                const roomList = response.content || [];
                /**
                 * 비-독서모임 존은 기존 정책을 유지한다.
                 * 같은 타입 방 중 첫 번째 roomId를 사용한다.
                 */
                targetRoomId = roomList[0]?.roomId ?? null;
              }

              if (targetRoomId) {
                console.log('접속할 방 ID:', targetRoomId);

                /**
                 * 1) REST 입장 API 호출 (/api/room/{roomId}/join)
                 * 2) 성공 시 roomId 저장
                 * 3) GameSidebar의 useWebRTC가 roomId 변화를 감지하여
                 *    STOMP joinRoom + 시그널링 절차를 시작한다.
                 */
                await roomApi.joinRoom({ roomId: targetRoomId });

                /**
                 * roomId 저장은 "RTC 연결 시작 스위치" 역할이다.
                 * GameSidebar의 useWebRTC(roomId, userId)가 이 변화를 감지해
                 * STOMP /app/joinRoom -> offer/answer 교환을 시작한다.
                 */
                useGameStore.getState().setRoomId(targetRoomId);
                /**
                 * 방 입장 성공 시에는 룸 내부 화면(회의실)로 전환한다.
                 * 실제 맵 변경은 GamePage의 floor 변경 effect가 담당한다.
                 */
                useGameStore
                  .getState()
                  .setSpawnPoint(this.CONFERENCE_ENTRY_SPAWN);
                useGameStore.getState().setCurrentFloor('conferenceFloor');
              } else {
                alert('현재 입장 가능한 방이 없습니다.');
                bounceOutFromZone();
              }
            } catch (error: unknown) {
              console.error('방 입장 처리 중 오류:', error);
              /**
               * Axios 에러 응답(message)이 있으면 우선 노출하고,
               * 없으면 공통 메시지로 폴백한다.
               */
              const apiError = error as {
                response?: { data?: { message?: string } };
              };
              const message =
                apiError?.response?.data?.message ??
                '방에 입장하지 못했습니다.';
              alert(message);
              bounceOutFromZone();
            }
          }

          // 방에서의 zone 이동 확인 (퇴장 API는 사이드바 "나가기" 버튼에서 처리)
          else {
            this.movePlayerToPosition(
              action.confirmPosition,
              zone,
              suppressFor(action.confirmPosition, 'confirm'),
            );
          }
        },

        // 취소 버튼 로직
        onCancel: () =>
          this.movePlayerToPosition(
            action.cancelPosition,
            zone,
            suppressFor(action.cancelPosition, 'cancel'),
          ),
      });
    }
  }

  private createViewport() {
    this._viewport = new Viewport({
      screenWidth: this._app.screen.width,
      screenHeight: this._app.screen.height,
      worldWidth: this._worldWidth,
      worldHeight: this._worldHeight,
      events: this._app.renderer.events,
    });
    this._viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clamp({ direction: 'all' });
    this._app.stage.addChild(this._viewport);
  }

  private addEventHandlers() {
    window.addEventListener('keydown', (e) => (this._keys[e.key] = true));
    window.addEventListener('keyup', (e) => (this._keys[e.key] = false));
  }

  private createPlayer(nickname?: string) {
    const startX = this._worldWidth / 2;
    const startY = this._worldHeight;
    const sheetTexture = Assets.get('playerSheet');

    const displayName = nickname || 'Me';

    // 클릭 콜백: 내 프로필 열기
    const handleMyClick = () => {
      useModalStore.getState().openModal('profile');
    };

    this._player = new Player(
      startX,
      startY,
      displayName,
      sheetTexture,
      this._myId,
      handleMyClick,
    );
    this._player.setScaleFactor(
      this.getPlayerScaleForFloorId(this._currentFloorId),
    );
    this._viewport.addChild(this._player);
    this._viewport.follow(this._player);
  }

  private update(ticker: Ticker) {
    if (!this._player) return;

    if (this._currentFloorId === MAP_DATA.bookTalkFloor.floorId) {
      this.refreshBookTalkRoomInfoOverlay();
    }

    const isModalOpen = useModalStore.getState().currentModal !== null;
    if (isModalOpen) {
      if (this._isPrevMoving) {
        this._player.setAnimation(this._lookingDirection, false);
        this.sendMyPosition(false);
        this._isPrevMoving = false;
      }
      this._isInteractPressed = false;
      return;
    }

    let dx = 0;
    let dy = 0;

    // 이동 로직
    if (this._keys['ArrowUp'] || this._keys['w'] || this._keys['W']) {
      dy -= 1;
      this._lookingDirection = 'UP';
    }
    if (this._keys['ArrowDown'] || this._keys['s'] || this._keys['S']) {
      dy += 1;
      this._lookingDirection = 'DOWN';
    }
    if (this._keys['ArrowLeft'] || this._keys['a'] || this._keys['A']) {
      dx -= 1;
      this._lookingDirection = 'LEFT';
    }
    if (this._keys['ArrowRight'] || this._keys['d'] || this._keys['D']) {
      dx += 1;
      this._lookingDirection = 'RIGHT';
    }

    const isMoving = dx !== 0 || dy !== 0;
    this._player.setAnimation(this._lookingDirection, isMoving);

    // 이동 처리
    if (isMoving) {
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }
      const moveSpeed = this.getMoveSpeedForFloorId(this._currentFloorId);
      const stepX = dx * moveSpeed * ticker.deltaTime;
      const stepY = dy * moveSpeed * ticker.deltaTime;
      const nextX = this._player.x + stepX;
      const nextY = this._player.y + stepY;

      if (this._collisionGrid) {
        const candidateX = this.isColliding(nextX, this._player.y)
          ? this._player.x
          : nextX;
        const candidateY = this.isColliding(candidateX, nextY)
          ? this._player.y
          : nextY;
        this._player.x = candidateX;
        this._player.y = candidateY;
      } else {
        this._player.x = nextX;
        this._player.y = nextY;
      }

      const marginX = this._player.playerWidth / 2;
      const marginY = this._player.playerHeight;
      this._player.x = Math.max(
        marginX,
        Math.min(this._player.x, this._worldWidth - marginX),
      );
      this._player.y = Math.max(
        marginY,
        Math.min(this._player.y, this._worldHeight),
      );

      // 이동 브로드캐스트도 채널 ID(roomId/floorId)에 맞춘다.
      const payload: MoveRequest = {
        floorId: this._movementChannelId,
        x: this._player.x,
        y: this._player.y,
        direction: this._lookingDirection,
        isMoving: true,
        clientTs: Date.now(),
      };

      this._sendMoveThrottled(payload);
    } else if (this._isPrevMoving) {
      // 멈춘 순간에는 즉시 전송
      this.sendMyPosition(false);
    }
    this._isPrevMoving = isMoving;

    if (this._mapZones.length > 0) {
      let interactableZone: MapZoneConfig | null = null;
      for (const zone of this._mapZones) {
        const inside =
          this._player.x >= zone.absX &&
          this._player.x <= zone.absX + zone.absW &&
          this._player.y >= zone.absY &&
          this._player.y <= zone.absY + zone.absH;

        const triggers = Array.isArray(zone.trigger)
          ? zone.trigger
          : zone.trigger
            ? [zone.trigger]
            : ['enter'];

        if (triggers.includes('interact')) {
          if (inside && !interactableZone) {
            interactableZone = zone;
          }
          continue;
        }

        const wasInside = this._activeZoneIds.has(zone.id);

        if (inside && !wasInside) {
          this._activeZoneIds.add(zone.id);
          if (triggers.includes('enter')) {
            const suppressed = this._suppressZoneTriggers.get(zone.id);
            if (suppressed?.has('enter')) {
              suppressed.delete('enter');
              if (suppressed.size === 0)
                this._suppressZoneTriggers.delete(zone.id);
            } else {
              this.handleZoneAction(zone.enterAction ?? zone.action, zone);
            }
          }
        } else if (!inside && wasInside) {
          this._activeZoneIds.delete(zone.id);
          if (triggers.includes('exit')) {
            const suppressed = this._suppressZoneTriggers.get(zone.id);
            if (suppressed?.has('exit')) {
              suppressed.delete('exit');
              if (suppressed.size === 0)
                this._suppressZoneTriggers.delete(zone.id);
            } else {
              this.handleZoneAction(zone.exitAction ?? zone.action, zone);
            }
          }
        }
      }

      const isInteractPressed =
        this._keys[' '] || this._keys['Space'] || this._keys['Spacebar'];

      if (isInteractPressed && !this._isInteractPressed && interactableZone) {
        this.handleZoneAction(interactableZone.action, interactableZone);
      }

      this._isInteractPressed = isInteractPressed;
      this._suppressZoneTriggers.clear();
    }
  }

  // 위치 전송 헬퍼
  private sendMyPosition(isMoving: boolean) {
    if (this._currentFloorId === MAP_DATA.myRoom.floorId) return;
    if (!this._movementChannelId) return;

    // 정지 상태도 채널 ID(roomId/floorId) 기준으로 보낸다.
    const payload: MoveRequest = {
      floorId: this._movementChannelId,
      x: this._player.x,
      y: this._player.y,
      direction: this._lookingDirection,
      isMoving,
      clientTs: Date.now(),
    };
    const { isConnected, sendMove } = useSocketStore.getState();
    if (isConnected) sendMove(payload);
  }

  // 다른 플레이어들 위치 업데이트
  public updateOtherPlayers(moves: MoveBroadcast[]) {
    if (!moves) return;

    // 활성 유저 ID 목록
    const activeUserIds = new Set(moves.map((m) => m.userId));

    this._otherPlayers.forEach((player, userId) => {
      // 현재 화면에 있는 유저 중 명단에 존재하지 않으면 제거
      if (!activeUserIds.has(userId)) {
        this._viewport.removeChild(player);
        player.destroy();
        this._otherPlayers.delete(userId);
        console.log('유저 퇴장 확인 및 제거:', userId);
      }
    });

    moves.forEach((data) => {
      if (data.userId === this._myId) return;

      let otherPlayer = this._otherPlayers.get(data.userId);

      // 없으면 생성
      if (!otherPlayer) {
        const sheetTexture = Assets.get('playerSheet');

        // 클릭 콜백: 타인 프로필 열기
        const handleOtherClick = (userId: string) => {
          console.log('🖱️ Character clicked, userId:', userId);
          useModalStore.getState().openUserProfile(userId);
        };

        otherPlayer = new Player(
          data.x,
          data.y,
          data.nickname,
          sheetTexture,
          data.userId,
          handleOtherClick,
        );
        this._viewport.addChild(otherPlayer);
        this._otherPlayers.set(data.userId, otherPlayer);
      }

      // 있으면 위치 이동
      if (otherPlayer) {
        otherPlayer.x = data.x;
        otherPlayer.y = data.y;
        otherPlayer.setAnimation(data.direction, data.isMoving);
      }
    });
  }

  public clearOtherPlayers() {
    this._otherPlayers.forEach((player) => {
      this._viewport.removeChild(player);
      player.destroy();
    });
    this._otherPlayers.clear();
  }

  public destroy() {
    useSocketStore.getState().unsubscribeMove({
      sendExit: true,
      // 현재 채널 ID(roomId 우선)로 exit 전송
      exitFloorId: this._movementChannelId || this._currentFloorId,
    });
    if (this._app?.renderer) {
      this._app.ticker.remove(this.update, this);
      this._app.destroy({ removeView: true }, { children: true });
    }
  }

  private getPlayerScaleForFloorId(floorId: string) {
    return floorId === MAP_DATA.myRoom.floorId
      ? this.MY_ROOM_PLAYER_SCALE
      : this.DEFAULT_PLAYER_SCALE;
  }

  private getMoveSpeedForFloorId(floorId: string) {
    return floorId === MAP_DATA.myRoom.floorId
      ? this.MOVE_SPEED * this.MY_ROOM_SPEED_MULTIPLIER
      : this.MOVE_SPEED;
  }

  // 회의실은 roomId, 그 외는 floorId를 이동 채널로 사용한다.
  private getMovementChannelId(floor: FloorType, floorId: string) {
    if (floor === 'conferenceFloor') {
      const roomId = useGameStore.getState().roomId;
      return roomId ?? floorId;
    }
    return floorId;
  }
}
