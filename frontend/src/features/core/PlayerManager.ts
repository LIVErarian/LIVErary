import { Assets } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { useModalStore } from '@/store/useModalStore';
import { Player } from '../player/Player';

import type { CharacterParts, PartType } from '@/types/character.types';
import type { MoveBroadcast } from '@/types/socket.types';

export class PlayerManager {
  private _viewport: Viewport;

  public me: Player | null = null;
  private _otherPlayers: Map<string, Player> = new Map();
  private _myId: string;

  constructor(viewport: Viewport, myId: string) {
    this._viewport = viewport;
    this._myId = myId;
  }

  public createMe(nickname: string, x: number, y: number) {
    // 이미 생성되어 있으면 제거 후 재생성
    if (this.me) {
      this._viewport.removeChild(this.me);
      this.me.destroy();
    }

    const displayName = nickname || 'Me';

    // 클릭 콜백: 내 프로필 열기
    const handleMyClick = () => {
      useModalStore.getState().openModal('profile');
    };

    // 내 캐릭터 파츠 구성
    const initialParts: CharacterParts = {
      body: {
        sheetTexture: Assets.get('mbody'),
        sitSheetTexture: Assets.get('sit'),
        tint: 0xffffff,
      },
      pants: {
        sheetTexture: Assets.get('pants'),
        sitSheetTexture: Assets.get('sitpants'),
        tint: 0x010101,
      },
      shirt: {
        sheetTexture: Assets.get('shirt'),
        sitSheetTexture: Assets.get('sitshirts'),
        tint: 0x1d592d,
      },
      hair: {
        sheetTexture: Assets.get('longhair'),
        sitSheetTexture: Assets.get('sithair'),
        tint: 0xffffff,
      },
    };

    this.me = new Player(
      x,
      y,
      displayName,
      initialParts,
      this._myId,
      true,
      handleMyClick,
    );

    this._viewport.addChild(this.me);
    this._viewport.follow(this.me);
    return this.me;
  }

  public update(deltaTime: number) {
    this._otherPlayers.forEach((player) => {
      // 각 플레이어 객체의 보간 이동 함수 호출
      player.updatePosition(deltaTime);
    });
  }

  // 다른 플레이어들 위치 업데이트 -> x, y를 바로 대입하지 않고 setTargetPosition을 이용해서 선형 보간
  public updateOtherPlayers(moves: MoveBroadcast[]) {
    if (!moves) return;

    // 활성 유저 ID 목록
    const activeUserIds = new Set(moves.map((m) => m.userId));

    // 퇴장 유저 처리
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
        // 타 유저 기본 파츠 (서버 연동 전 임시)
        // TODO: 유저 정보에 파츠 정보 등록 및 가져오기 필요
        const initialParts: CharacterParts = {
          body: {
            sheetTexture: Assets.get('mbody'),
            sitSheetTexture: Assets.get('sit'),
          },
          pants: {
            sheetTexture: Assets.get('pants'),
            sitSheetTexture: Assets.get('sitpants'),
            tint: 0x010101,
          },
          shirt: {
            sheetTexture: Assets.get('shirt'),
            sitSheetTexture: Assets.get('sitshirts'),
            tint: 0x1d592d,
          },
          hair: {
            sheetTexture: Assets.get('longhair'),
            sitSheetTexture: Assets.get('sithair'),
            tint: 0xffffff,
          },
        };

        // 클릭 콜백: 타인 프로필 열기
        const handleOtherClick = (userId: string) => {
          console.log('🖱️ Character clicked, userId:', userId);
          useModalStore.getState().openUserProfile(userId);
        };

        otherPlayer = new Player(
          data.x,
          data.y,
          data.nickname,
          initialParts,
          data.userId,
          false,
          handleOtherClick,
        );
        this._viewport.addChild(otherPlayer);
        this._otherPlayers.set(data.userId, otherPlayer);
      }

      if (otherPlayer) {
        otherPlayer.setTargetPosition(data.x, data.y);
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

  public setMyLook(part: PartType, color: number) {
    if (this.me) {
      this.me.setPart(part, undefined, undefined, color);
    }
  }

  public setScale(scale: number) {
    if (this.me) this.me.setScaleFactor(scale);
  }
}
