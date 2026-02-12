import {
  Application,
  extensions,
  ExtensionType,
  LoaderParserPriority,
  Ticker,
} from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { roomApi } from '@/api/room.api';
import { findRecommendedRoomByZone } from '@/features/room/bookTalkRoomMatcher';
import { isBookTalkZone } from '@/features/room/bookTalkRoomSlots';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookTalkRoomStore } from '@/store/useBookTalkRoomStore';
import { useGameStore } from '@/store/useGameStore';
import { useModalStore } from '@/store/useModalStore';
import { useReadingStore } from '@/store/useReadingStore';
import { useSocketStore } from '@/store/useSocketStore';
import { throttle } from '@/utils/throttle';
import { MAP_DATA } from '../map/mapAssets';
import { MapManager } from './MapManager';
import { PlayerManager } from './PlayerManager';

import type { PartType } from '@/types/game/character.types';
import type {
  FloorType,
  MapZoneAction,
  MapZoneConfig,
} from '@/types/game/map.types';
import type { Direction, MoveRequest } from '@/types/socket/socket.types';

import { contentFont } from '@/styles/global.css.ts';
import { palette } from '@/styles/theme.css.ts';

extensions.add({
  name: 'tmj-loader',
  extension: {
    type: ExtensionType.LoadParser,
    priority: LoaderParserPriority.High, // 다른 로더보다 우선순위를 높게 설정
  },
  // .tmj 확장자일 경우 이 로더가 작동
  test: (url: string) => url.endsWith('.tmj'),
  // 실제 로딩 로직 (fetch 후 json 변환)
  load: async (url: string) => {
    const response = await fetch(url);
    return response.json();
  },
});

export class GameApp {
  private _app: Application;
  private _viewport!: Viewport;

  private _mapManager!: MapManager;
  private _playerManager!: PlayerManager;

  private _keys: { [key: string]: boolean } = {};
  private _isCtrlPressed: boolean = false;
  private _lookingDirection: Direction = 'DOWN';
  private _myId: string = '';
  private _isPrevMoving: boolean = false;
  private _isDestroyed: boolean = false;

  private _isLeavingRoom: boolean = false;
  private _isInteractPressed: boolean = false;
  private _suppressZoneTriggers: Map<string, Set<'enter' | 'exit'>> = new Map();
  private _activeZoneIds: Set<string> = new Set();

  // 독서 타이머 관련 필드
  private _readingTimerContainer: Container | null = null;
  private _readingTimerText: Text | null = null;
  private _readingTimerSnapshot: string = '';
  private _isTimerHovered: boolean = false;

  private _movementChannelId: string = '';
  private _sendMoveThrottled: (payload: MoveRequest) => void;

  // 상수 정의
  private readonly MOVE_SPEED = 4;
  private readonly DEFAULT_PLAYER_SCALE = 2;
  private readonly MY_ROOM_PLAYER_SCALE = 4;
  private readonly MY_ROOM_SPEED_MULTIPLIER = 2;
  private readonly CONFERENCE_ENTRY_SPAWN = { x: 0.88, y: 0.5 };
  private readonly DEFAULT_WORLD_WIDTH = 1440;
  private readonly DEFAULT_WORLD_HEIGHT = 810;

  constructor() {
    this._app = new Application();

    this._sendMoveThrottled = throttle((payload: MoveRequest) => {
      // mapManager가 없으면 실행 안 함 (안전장치)
      if (!this._mapManager) return;
      if (this._mapManager.currentFloorId === MAP_DATA.myRoom.floorId) return;

      const { isConnected, sendMove } = useSocketStore.getState();
      if (isConnected) {
        sendMove(payload);
      }
    }, 50);
  }

  public get canvas() {
    return this._app.canvas;
  }

  public async init(container: HTMLDivElement) {
    if (this._isDestroyed) return;

    // 유저 ID 설정
    const user = useAuthStore.getState().user;
    this._myId = user?.userId || `guest_${Math.floor(Math.random() * 1000)}`;

    // Pixi Application 초기화 (캔버스 생성)
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

    // 필수 요소 생성 (뷰포트, 매니저)
    this.createViewport();
    this._mapManager = new MapManager(this._viewport);
    this._playerManager = new PlayerManager(this._viewport, this._myId);

    // 초기 맵 설정 (Store에서 가져오기)
    const currentFloor = useGameStore.getState().currentFloor || 'lobby';

    // 맵 로딩 (이미 에셋이 다 있으므로 즉시 실행됨)
    await this.changeMap(currentFloor);

    // 내 캐릭터 생성
    // 맵 크기가 확정된 후에 중앙 좌표를 계산
    const startX = this._mapManager.worldWidth / 2;
    const startY = this._mapManager.worldHeight / 2;

    this._playerManager.createMe(user?.nickname || 'Me', startX, startY);

    // 캐릭터 생성 직후 스케일 강제 보정
    this._playerManager.setScale(
      this.getPlayerScaleForFloorId(this._mapManager.currentFloorId),
    );

    // 이벤트 핸들러 및 게임 루프 시작
    // 이 줄이 실행되기 전까지는 화면이 멈춰있거나 움직이지 않음
    this.addEventHandlers();
    this._app.ticker.add(this.update, this);
  }

  public async changeMap(floor: FloorType) {
    // 안전장치: 매니저 초기화 전이면 중단
    if (!this._mapManager || !this._playerManager) return;

    const prevMovementChannelId = this._movementChannelId;
    const prevFloorId = this._mapManager.currentFloorId;

    const { width, height } = await this._mapManager.changeMap(floor);

    // 독서 타이머 UI 업데이트
    this.updateReadingTimerUI(floor);

    const floorId = MAP_DATA[floor].floorId;
    this._movementChannelId = this.getMovementChannelId(floor, floorId);

    const spawnPoint = useGameStore.getState().spawnPoint;

    if (this._playerManager.me) {
      this._playerManager.setScale(this.getPlayerScaleForFloorId(floorId));

      if (spawnPoint) {
        this._playerManager.me.x = width * spawnPoint.x;
        this._playerManager.me.y = height * spawnPoint.y;
        useGameStore.getState().setSpawnPoint(null);
      } else {
        if (floor === 'myRoom') {
          this._playerManager.me.x = width / 2;
          this._playerManager.me.y = height / 2;
        } else if (floor === 'bookConcert') {
          this._playerManager.me.x = width / 2;
          this._playerManager.me.y = height;
        } else {
          this._playerManager.me.x = width * 0.38;
          this._playerManager.me.y = height * 0.25;
        }
      }
      this._lookingDirection = 'DOWN';
      this._playerManager.me.setAnimation('DOWN', false);
    }

    const { joinChannel, leaveChannel, isConnected, sendEnter } =
      useSocketStore.getState();

    leaveChannel({
      sendExit: true,
      exitFloorId: prevMovementChannelId || prevFloorId,
    });
    this._playerManager.clearOtherPlayers();

    if (floor !== 'myRoom' && isConnected) {
      const movementChannelId = this._movementChannelId;
      if (!movementChannelId) return;
      console.log(
        `[GameApp] ${floor}(${movementChannelId}) 구독 프로세스 시작`,
      );

      await joinChannel(movementChannelId, (moves) => {
        this._playerManager.updateOtherPlayers(moves);
      });

      if (useSocketStore.getState().isConnected && this._playerManager.me) {
        sendEnter({
          floorId: movementChannelId,
          x: this._playerManager.me.x,
          y: this._playerManager.me.y,
          direction: this._lookingDirection,
        });
      }
    } else if (floor === 'myRoom') {
      console.log('내 방: 위치 공유 안 함');
    }

    if (this._viewport) {
      this._viewport.resize(
        this._app.screen.width,
        this._app.screen.height,
        width,
        height,
      );
      this._viewport.clamp({ direction: 'all' });
    }

    const screenWidth = this._viewport.screenWidth;
    const screenHeight = this._viewport.screenHeight;
    if (width < screenWidth || height < screenHeight) {
      this._viewport.moveCenter(width / 2, height / 2);
    } else {
      if (this._playerManager.me) {
        this._viewport.moveCenter(
          this._playerManager.me.x,
          this._playerManager.me.y,
        );
        this._viewport.follow(this._playerManager.me);
      } else {
        this._viewport.moveCenter(width / 2, height / 2);
      }
    }

    this._playerManager.clearOtherPlayers();
  }

  public changePlayerLook(part: PartType, color: number) {
    if (this._playerManager) {
      this._playerManager.setMyLook(part, color);
    }
  }

  public refreshBookTalkRoomInfoOverlay() {
    if (this._mapManager) {
      this._mapManager.refreshBookTalkRoomInfoOverlay();
    }
  }

  private update(ticker: Ticker) {
    // 안전장치
    if (!this._mapManager || !this._playerManager) return;

    const me = this._playerManager.me;
    if (!me) return;

    if (this._mapManager.currentFloorType === 'bookTalkFloor') {
      this.refreshBookTalkRoomInfoOverlay();
    }

    const isModalOpen = useModalStore.getState().currentModal !== null;
    if (isModalOpen) {
      if (this._isPrevMoving) {
        me.setAnimation(this._lookingDirection, false);
        this.sendMyPosition(false);
        this._isPrevMoving = false;
      }
      this._isInteractPressed = false;
      return;
    }

    const isCtrlDown =
      this._keys['Control'] ||
      this._keys['ControlLeft'] ||
      this._keys['ControlRight'];

    if (isCtrlDown) {
      if (!this._isCtrlPressed) {
        this._isCtrlPressed = true;
        me.toggleSit();
        this.sendMyPosition(false);
      }
    } else {
      this._isCtrlPressed = false;
    }

    let dx = 0;
    let dy = 0;

    // 방향키 입력 확인
    const isUp = this._keys['ArrowUp'] || this._keys['w'] || this._keys['W'];
    const isDown =
      this._keys['ArrowDown'] || this._keys['s'] || this._keys['S'];
    const isLeft =
      this._keys['ArrowLeft'] || this._keys['a'] || this._keys['A'];
    const isRight =
      this._keys['ArrowRight'] || this._keys['d'] || this._keys['D'];

    // 앉아있는데 움직이면 바로 일어나기
    if (me.isSitting && (isUp || isDown || isLeft || isRight)) {
      me.toggleSit(); // 즉시 기립
    }

    if (!me.isSitting) {
      // (방금 일어났으면 false 상태임)
      if (isUp) {
        dy -= 1;
        this._lookingDirection = 'UP';
      }
      if (isDown) {
        dy += 1;
        this._lookingDirection = 'DOWN';
      }
      if (isLeft) {
        dx -= 1;
        this._lookingDirection = 'LEFT';
      }
      if (isRight) {
        dx += 1;
        this._lookingDirection = 'RIGHT';
      }
    }

    const isMoving = dx !== 0 || dy !== 0;
    me.setAnimation(this._lookingDirection, isMoving);

    if (isMoving) {
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      const moveSpeed = this.getMoveSpeedForFloorId(
        this._mapManager.currentFloorId,
      );
      const stepX = dx * moveSpeed * ticker.deltaTime;
      const stepY = dy * moveSpeed * ticker.deltaTime;
      let nextX = me.x + stepX;
      let nextY = me.y + stepY;

      const isCollidingX = this._mapManager.isColliding(
        nextX,
        me.y,
        me.playerWidth,
        me.playerHeight,
      );
      if (isCollidingX) nextX = me.x;

      const isCollidingY = this._mapManager.isColliding(
        nextX,
        nextY,
        me.playerWidth,
        me.playerHeight,
      );
      if (isCollidingY) nextY = me.y;

      me.x = nextX;
      me.y = nextY;

      const marginX = me.playerWidth / 2;
      const marginY = me.playerHeight;
      me.x = Math.max(
        marginX,
        Math.min(me.x, this._mapManager.worldWidth - marginX),
      );
      me.y = Math.max(marginY, Math.min(me.y, this._mapManager.worldHeight));

      const payload: MoveRequest = {
        floorId: this._movementChannelId,
        x: me.x,
        y: me.y,
        direction: this._lookingDirection,
        isMoving: true,
        isSitting: me.isSitting,
        clientTs: Date.now(),
      };

      this._sendMoveThrottled(payload);
    } else if (this._isPrevMoving) {
      this.sendMyPosition(false);
    }
    this._isPrevMoving = isMoving;

    if (this._mapManager.mapZones.length > 0) {
      let interactableZone: MapZoneConfig | null = null;
      for (const zone of this._mapManager.mapZones) {
        const inside =
          me.x >= zone.absX &&
          me.x <= zone.absX + zone.absW &&
          me.y >= zone.absY &&
          me.y <= zone.absY + zone.absH;

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

    // 독서 타이머 상태 업데이트
    if (this._mapManager.currentFloorType === 'readingFloor') {
      this.refreshReadingTimerUI();
    }

    // PlayerManager의 update 호출
    if (this._playerManager) {
      this._playerManager.update(ticker.deltaTime);
    }
  }

  private sendMyPosition(isMoving: boolean) {
    if (!this._mapManager || !this._playerManager) return;
    if (this._mapManager.currentFloorId === MAP_DATA.myRoom.floorId) return;
    if (!this._movementChannelId) return;
    if (!this._playerManager.me) return;

    const payload: MoveRequest = {
      floorId: this._movementChannelId,
      x: this._playerManager.me.x,
      y: this._playerManager.me.y,
      direction: this._lookingDirection,
      isMoving,
      isSitting: this._playerManager.me.isSitting,
      clientTs: Date.now(),
    };
    const { isConnected, sendMove } = useSocketStore.getState();
    if (isConnected) sendMove(payload);
  }

  public async updateBackground(categoryId: string) {
    if (!this._mapManager?.currentFloorType) return;
    const mapConfig = MAP_DATA[this._mapManager.currentFloorType];
    if (!mapConfig) return;

    console.log('📌 [GameApp] 요청받은 ID:', categoryId);

    const targetAlias =
      categoryId && mapConfig.categoryImgAliases?.[categoryId]
        ? mapConfig.categoryImgAliases[categoryId]
        : mapConfig.imgAlias;

    this._mapManager.updateBackgroundTexture(targetAlias);
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
    const me = this._playerManager.me;
    if (!me) return;

    if (position === 'screenCenter') {
      me.x = this._mapManager.worldWidth / 2;
      me.y = this._mapManager.worldHeight / 2;
    } else if (zone) {
      const zoneX = zone.absX ?? zone.x * this._mapManager.worldWidth;
      const zoneY = zone.absY ?? zone.y * this._mapManager.worldHeight;
      const zoneW = zone.absW ?? zone.width * this._mapManager.worldWidth;
      const zoneH = zone.absH ?? zone.height * this._mapManager.worldHeight;
      const centerX = zoneX + zoneW / 2;
      const centerY = zoneY + zoneH / 2;
      const offsetY = this._mapManager.worldHeight * 0.05;

      if (position === 'zoneCenter') {
        const hardcodedEntryByZone: Record<string, { x: number; y: number }> = {
          'room-1': { x: zoneX + zoneW * 0.5, y: zoneY + zoneH * 0.78 },
          'room-2': { x: zoneX + zoneW * 0.5, y: zoneY + zoneH * 0.78 },
          'room-3': { x: zoneX + zoneW * 0.5, y: zoneY + zoneH * 0.68 },
          'room-4': { x: zoneX + zoneW * 0.5, y: zoneY + zoneH * 0.68 },
        };

        const hardcoded = hardcodedEntryByZone[zone.id];
        me.x = hardcoded?.x ?? centerX;
        me.y = hardcoded?.y ?? centerY;
      } else if (position === 'zoneFrontBelow') {
        me.x = centerX;
        me.y = zoneY + zoneH + offsetY;
      } else if (position === 'zoneFrontAbove') {
        me.x = centerX;
        me.y = zoneY - offsetY;
      }
    }

    if (zone && suppressNextTrigger) {
      const existing = this._suppressZoneTriggers.get(zone.id) ?? new Set();
      existing.add(suppressNextTrigger);
      this._suppressZoneTriggers.set(zone.id, existing);
    }

    this._viewport.moveCenter(me.x, me.y);
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

              // [추가] 퇴장 성공 시 방 목록 데이터 갱신 (인원수 -1 반영)
              // await를 붙이지 않아도 됨 (백그라운드 갱신)
              queryClient.invalidateQueries({ queryKey: ['rooms'] });
              queryClient.invalidateQueries({ queryKey: ['room', roomId] });
            }

            useGameStore.getState().setRoomId(null);
            useGameStore.getState().setSpawnPoint({ x: 0.5, y: 0.5 });
            useGameStore.getState().setCurrentFloor('bookTalkFloor');
          } catch (error: unknown) {
            console.error('회의실 퇴장 실패:', error);
            const apiError = error as {
              response?: { data?: { message?: string } };
            };
            useModalStore.getState().openModal('alert', {
              title: '오류',
              message:
                apiError?.response?.data?.message ??
                '퇴장 처리에 실패했습니다. 잠시 후 다시 시도해주세요.',
            });
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
      if (zone?.id === 'room-4' && !room4Room) {
        useModalStore.getState().openModal('createRoom');
        this.movePlayerToPosition(
          action.cancelPosition,
          zone,
          suppressFor(action.cancelPosition, 'confirm'),
        );
        return;
      }

      useModalStore.getState().openModal('entrance', {
        title: action.title,
        message: action.message,

        onConfirm: async () => {
          console.log('📍 이동 위치 확인:', action.confirmPosition);

          if (action.confirmPosition === 'zoneCenter') {
            console.log(`🚪 [${zone?.id}] 방 입장 로직 실행`);
            const bounceOutFromZone = () => {
              this.movePlayerToPosition(
                action.cancelPosition,
                zone,
                suppressFor(action.cancelPosition, 'confirm'),
              );
            };

            try {
              let targetRoomId: string | null = null;

              if (zone?.id && isBookTalkZone(zone.id)) {
                const { recommendedRooms, room4Room } =
                  useBookTalkRoomStore.getState();
                const targetRoom =
                  zone.id === 'room-4' && room4Room
                    ? room4Room
                    : findRecommendedRoomByZone(zone.id, recommendedRooms);
                targetRoomId = targetRoom?.roomId ?? null;
              } else {
                let targetType: 'TALK' | 'READING' | 'CONCERT' | undefined;
                if (zone?.id?.includes('room-')) targetType = 'TALK';
                else if (zone?.id?.includes('concert')) targetType = 'CONCERT';
                else if (zone?.id?.includes('reading')) targetType = 'READING';

                const response = await roomApi.getLiveRoomList({
                  size: 50,
                  accessType: 'PUBLIC',
                });

                if (response === null) return;
                const roomList = response.content || [];
                const matchingRoom = roomList.find(
                  (room) => room.roomType === targetType,
                );
                targetRoomId = matchingRoom?.roomId ?? null;
              }

              if (targetRoomId) {
                console.log('접속할 방 ID:', targetRoomId);
                await roomApi.joinRoom(targetRoomId, {});
                useGameStore.getState().setRoomId(targetRoomId);
                useGameStore
                  .getState()
                  .setSpawnPoint(this.CONFERENCE_ENTRY_SPAWN);
                useGameStore.getState().setCurrentFloor('conferenceFloor');
              } else {
                setTimeout(() => {
                  useModalStore.getState().openModal('alert', {
                    title: '알림',
                    message: '배정된 방이 없습니다.',
                  });
                }, 100);
                bounceOutFromZone();
              }
            } catch (error: unknown) {
              console.error('방 입장 처리 중 오류:', error);
              const apiError = error as {
                response?: { data?: { message?: string } };
              };
              const message =
                apiError?.response?.data?.message ??
                '방에 입장하지 못했습니다.';
              setTimeout(() => {
                useModalStore
                  .getState()
                  .openModal('alert', { title: '오류', message });
              }, 100);
              bounceOutFromZone();
            }
          } else {
            this.movePlayerToPosition(
              action.confirmPosition,
              zone,
              suppressFor(action.confirmPosition, 'confirm'),
            );
          }
        },
        onCancel: () =>
          this.movePlayerToPosition(
            action.cancelPosition,
            zone,
            suppressFor(action.cancelPosition, 'cancel'),
          ),
      });
    }
  }

  // [수정] createViewport - 매니저 참조 제거 및 기본값 사용
  private createViewport() {
    this._viewport = new Viewport({
      screenWidth: this._app.screen.width,
      screenHeight: this._app.screen.height,
      worldWidth: this.DEFAULT_WORLD_WIDTH, // 상수 사용
      worldHeight: this.DEFAULT_WORLD_HEIGHT, // 상수 사용
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

  // destroy - 안전한 null 체크 추가
  public destroy() {
    useSocketStore.getState().leaveChannel({
      sendExit: true,
      // mapManager가 있으면 currentFloorId 사용, 없으면 빈 문자열
      exitFloorId:
        this._movementChannelId || (this._mapManager?.currentFloorId ?? ''),
    });

    this._isDestroyed = true;

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

  private getMovementChannelId(floor: FloorType, floorId: string) {
    if (floor === 'conferenceFloor') {
      const roomId = useGameStore.getState().roomId;
      return roomId ?? floorId;
    }
    return floorId;
  }

  /**
   * 독서 타이머 UI 초기화 및 상태 기반 렌더링
   */
  private updateReadingTimerUI(floor: FloorType) {
    if (this._readingTimerContainer) {
      this._viewport.removeChild(this._readingTimerContainer);
      this._readingTimerContainer.destroy({ children: true });
      this._readingTimerContainer = null;
      this._readingTimerText = null;
      this._readingTimerSnapshot = '';
    }

    if (floor !== 'readingFloor') return;

    const container = new Container();
    this._readingTimerContainer = container;
    this._viewport.addChild(container);

    const centerX = this._mapManager.worldWidth / 2 + 16;
    const fixedY = 25;

    const { isReading, isPaused, currentBook } = useReadingStore.getState();

    // 사이즈 계산
    const timerWidth = 100;
    const timerHeight = 36;
    const gap = 12;

    let contentsWidth = timerWidth;
    if (!isReading) {
      contentsWidth = timerWidth + gap + 90; // Start button
    } else {
      contentsWidth = timerWidth + gap + 32 * 2 + 6; // Pause/Stop buttons
    }

    const paddingX = 5;
    const paddingY = 12;
    const panelWidth = Math.max(contentsWidth + paddingX * 2, 210);
    const panelHeight = 95;

    const panelBg = new Graphics();
    panelBg
      .rect(-panelWidth / 2, 0, panelWidth, panelHeight)
      .fill({ color: 0xeee3cb, alpha: 0.98 })
      .stroke({ width: 3, color: 0x4a2619, alpha: 0.8 });

    container.addChild(panelBg);
    container.x = centerX;
    container.y = fixedY;

    // 내부 컨테이너
    const contentGroup = new Container();
    contentGroup.x = -contentsWidth / 2;
    contentGroup.y = paddingY;
    container.addChild(contentGroup);

    // 버튼 생성
    if (!isReading) {
      const startBtn = this.createEnhancedPixelButton(
        '독서 시작',
        panelWidth - 20,
        panelHeight - 20,
        0x420e07, // primary
        () =>
          useModalStore
            .getState()
            .openModal('bookSelection', { isChanging: false }),
        22,
      );
      startBtn.x = 0;
      startBtn.y = 10;
      container.addChild(startBtn);
    } else {
      const btnSize = 32;
      const btnGap = 8;
      const timerWidthCombined = timerWidth + gap + btnSize * 2 + btnGap;
      const innerStartX = -timerWidthCombined / 2;

      contentGroup.x = innerStartX;

      const timerBox = new Container();
      timerBox.eventMode = 'static';

      const timerBg = new Graphics();
      timerBg
        .roundRect(-2, -2, timerWidth + 4, timerHeight + 6, 8)
        .fill({ color: 0x4a2619 })
        .roundRect(0, 0, timerWidth, timerHeight, 6)
        .fill({ color: 0x4a2619 })
        .roundRect(0, timerHeight - 4, timerWidth, 4, 6)
        .fill({ color: 0x8d563e, alpha: 0.6 })
        .roundRect(0, 0, timerWidth, timerHeight, 6)
        .stroke({ width: 1.5, color: 0xc58346, alpha: 0.4 });

      timerBox.addChild(timerBg);

      const timerText = new Text({
        text: '00:00',
        style: {
          fill: 0xddd3b9,
          fontFamily: contentFont,
          fontSize: 20,
          fontWeight: 'bold',
        },
      });
      timerText.anchor.set(0.5, 0.5);
      timerText.x = timerWidth / 2;
      timerText.y = timerHeight / 2;

      timerBox.addChild(timerText);

      timerBox.on('pointerover', () => {
        this._isTimerHovered = true;
        this.refreshReadingTimerUI();
      });
      timerBox.on('pointerout', () => {
        this._isTimerHovered = false;
        this.refreshReadingTimerUI();
      });

      contentGroup.addChild(timerBox);
      this._readingTimerText = timerText;

      const pauseLabel = isPaused ? '▶' : '||';
      const pauseColor = isPaused ? 0x8b4513 : 0xe5a000;
      const pauseAction = isPaused
        ? () => useReadingStore.getState().resumeReading()
        : () => useReadingStore.getState().pauseReading();

      const pauseBtn = this.createEnhancedPixelButton(
        pauseLabel,
        btnSize,
        timerHeight,
        pauseColor,
        pauseAction,
      );
      pauseBtn.x = timerWidth + gap + btnSize / 2;
      pauseBtn.y = 0;
      contentGroup.addChild(pauseBtn);

      const stopBtn = this.createEnhancedPixelButton(
        '■',
        btnSize,
        timerHeight,
        0xb22222,
        () => useModalStore.getState().openModal('readingCompletion'),
      );
      stopBtn.x = timerWidth + gap + btnSize + btnGap + btnSize / 2;
      stopBtn.y = 0;
      contentGroup.addChild(stopBtn);

      if (currentBook) {
        const titleY = timerHeight + 22;
        const titleComp = this.createClickableBookTitle(
          currentBook.title,
          0,
          titleY,
          timerWidthCombined, // <-- Pass the calculated width here
        );
        container.addChild(titleComp);
      }
    }

    this._readingTimerSnapshot = JSON.stringify({
      isReading,
      isPaused,
      bookIsbn: currentBook?.isbn,
    });
    this.refreshReadingTimerUI();
  }

  private createEnhancedPixelButton(
    label: string,
    width: number,
    height: number,
    color: number,
    onClick: () => void,
    fontSize: number = 13,
  ): Container {
    const btn = new Container();
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const drawButton = (isPressed: boolean = false) => {
      const graphics = new Graphics();
      const bottomShadow = isPressed ? 2 : 6;
      const radius = 8;

      graphics
        .roundRect(
          -width / 2 - 2,
          -2,
          width + 4,
          height + 4 + (isPressed ? 0 : 2),
          radius + 2,
        )
        .fill({ color: 0x4a2619 });

      graphics.roundRect(-width / 2, 0, width, height, radius).fill({ color });

      if (!isPressed) {
        graphics
          .roundRect(
            -width / 2,
            height - bottomShadow,
            width,
            bottomShadow,
            radius,
          )
          .fill({ color: 0x8d563e, alpha: 0.6 });

        graphics
          .roundRect(-width / 2, 0, width, height, radius)
          .stroke({ width: 2, color: 0xeec39a, alpha: 0.4 });
      }

      return graphics;
    };

    let currentBg = drawButton(false);
    btn.addChild(currentBg);

    const text = new Text({
      text: label,
      style: {
        fill: 0xffffff,
        fontFamily: contentFont,
        fontSize: fontSize,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5, 0.5);
    text.x = 0;
    text.y = height / 2;
    btn.addChild(text);

    btn.on('pointertap', onClick);
    btn.on('pointerover', () => {
      text.alpha = 0.8;
    });
    btn.on('pointerout', () => {
      text.alpha = 1;
    });

    btn.on('pointerdown', () => {
      btn.removeChild(currentBg);
      currentBg = drawButton(true);
      btn.addChildAt(currentBg, 0);
      text.y = height / 2 + 2;
    });

    const resetBtn = () => {
      btn.removeChild(currentBg);
      currentBg = drawButton(false);
      btn.addChildAt(currentBg, 0);
      text.y = height / 2;
    };

    btn.on('pointerup', resetBtn);
    btn.on('pointerupoutside', resetBtn);

    return btn;
  }

  private refreshReadingTimerUI() {
    const { isReading, isPaused, currentBook, elapsedSeconds } =
      useReadingStore.getState();
    const snapshot = JSON.stringify({
      isReading,
      isPaused,
      bookIsbn: currentBook?.isbn,
    });

    if (this._readingTimerSnapshot !== snapshot) {
      if (this._mapManager?.currentFloorType) {
        this.updateReadingTimerUI(this._mapManager.currentFloorType);
      }
      return;
    }

    if (!this._readingTimerText) return;

    const hh = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(
      2,
      '0',
    );
    const ss = String(elapsedSeconds % 60).padStart(2, '0');

    if (this._isTimerHovered) {
      this._readingTimerText.text = `${hh}:${mm}:${ss}`;
      this._readingTimerText.style.fontSize = 17;
    } else {
      this._readingTimerText.text = `${hh}:${mm}`;
      this._readingTimerText.style.fontSize = 20;
    }
  }

  private createClickableBookTitle(
    title: string,
    x: number,
    y: number,
    targetWidth: number, // <-- Add this parameter
  ): Container {
    const titleContainer = new Container();
    titleContainer.eventMode = 'static';
    titleContainer.cursor = 'pointer';

    const displayTitle = title.length > 14 ? `${title.slice(0, 14)}...` : title;
    const fullText = `『 ${displayTitle} 』`;

    // 텍스트 먼저 생성
    const text = new Text({
      text: fullText,
      style: {
        fill: 0x8b4513,
        fontFamily: contentFont,
        fontSize: 14,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5, 0.5); // 중앙 정렬

    // 배경 크기를 timerWidthCombined와 일치시킴
    const bgWidth = targetWidth + 10;
    const bgHeight = text.height + 12;

    const bg = new Graphics();
    bg.cursor = 'pointer';

    // 기본 상태 그리기 함수
    const drawBg = (isHover: boolean) => {
      bg.clear();
      bg.roundRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 8);

      if (isHover) {
        bg.fill({ color: 0xeec39a, alpha: 0.8 }); // 호버 시 조금 더 진하게
        bg.stroke({ width: 1.5, color: 0x8b4513, alpha: 0.5 });
      } else {
        bg.fill({ color: 0xffffff, alpha: 0.5 }); // 평소엔 은은하게
        bg.stroke({ width: 1, color: 0x8b4513, alpha: 0.3 });
      }
    };

    drawBg(false);

    titleContainer.addChild(bg);
    titleContainer.addChild(text);

    titleContainer.x = x;
    titleContainer.y = y + bgHeight / 2; // 텍스트 기준점 보정

    titleContainer.on('pointertap', () =>
      useModalStore.getState().openModal('bookSelection', { isChanging: true }),
    );

    titleContainer.on('pointerover', () => {
      drawBg(true);
      text.style.fill = 0x5a2e18; // 텍스트도 진하게
    });

    titleContainer.on('pointerout', () => {
      drawBg(false);
      text.style.fill = 0x8b4513;
    });

    return titleContainer;
  }
}
