import type {
  MapCollisionConfig,
  MapZoneLogic,
  MapZoneRuntime,
  TiledMap,
} from '@/types/game/map.types';

// Zone 파싱 로직
export const parseMapZones = (
  tiledMap: TiledMap | null | undefined,
  zoneLogicMap: Record<string, MapZoneLogic> | undefined,
): MapZoneRuntime[] => {
  if (!tiledMap || !tiledMap.layers || !zoneLogicMap) {
    return [];
  }

  const interactionLayer = tiledMap.layers.find(
    (layer) => layer.name === 'INTERACTION' && layer.type === 'objectgroup',
  );

  const visualLayer = tiledMap.layers.find(
    (layer) => layer.name === 'VISUAL' && layer.type === 'objectgroup',
  );

  if (!interactionLayer || !interactionLayer.objects) {
    return [];
  }

  const parsedZones = interactionLayer.objects.map((tiledObj) => {
    const id = tiledObj.name;
    const logic = zoneLogicMap[id];

    if (!logic) return null;

    const visualObj = visualLayer?.objects?.find((v) => v.name === id);

    const zoneRuntime: MapZoneRuntime = {
      id: id,
      x: tiledObj.x,
      y: tiledObj.y,
      width: tiledObj.width,
      height: tiledObj.height,
      ...logic,
      visual: visualObj
        ? {
            x: visualObj.x,
            y: visualObj.y,
            width: visualObj.width,
            height: visualObj.height,
          }
        : null,
    };

    return zoneRuntime;
  });

  return parsedZones.filter((zone): zone is MapZoneRuntime => zone !== null);
};

// 충돌(Collision) 및 맵 속성 계산 로직
const buildLayerCollision = (
  mapData: TiledMap,
  layerName: string,
): MapCollisionConfig | null => {
  const layers = mapData.layers ?? [];
  const layer = layers.find(
    (entry) => entry?.type === 'tilelayer' && entry?.name === layerName,
  );
  const data = layer?.data ?? [];

  if (
    !mapData.width ||
    !mapData.height ||
    !mapData.tilewidth ||
    !mapData.tileheight
  ) {
    return null;
  }

  if (data.length !== mapData.width * mapData.height) {
    return null;
  }

  return {
    tileWidth: mapData.tilewidth,
    tileHeight: mapData.tileheight,
    width: mapData.width,
    height: mapData.height,
    grid: data.map((tileId) => (tileId && tileId !== 0 ? 1 : 0)),
  };
};

const mergeCollisionGrids = (
  width: number,
  height: number,
  grids: Array<number[]>,
) => {
  const size = width * height;
  const merged = new Array<number>(size).fill(0);
  grids.forEach((grid) => {
    for (let i = 0; i < size; i += 1) {
      if (grid[i] === 1) merged[i] = 1;
    }
  });
  return merged;
};

const buildCollisionFromLayers = (
  mapData: TiledMap,
  layerNames: string[],
): MapCollisionConfig | null => {
  if (!mapData.width || !mapData.height) return null;

  const collisions = layerNames
    .map((layerName) => buildLayerCollision(mapData, layerName))
    .filter((collision): collision is MapCollisionConfig => Boolean(collision));

  if (collisions.length === 0) return null;

  return {
    ...collisions[0],
    grid: mergeCollisionGrids(
      collisions[0].width,
      collisions[0].height,
      collisions.map((collision) => collision.grid),
    ),
  };
};

const COLLISION_LAYERS = ['WALL', 'OBJECT', 'BOOKSHELF'];

/**
 * 맵 데이터(JSON)를 받아서 충돌 영역과 크기를 계산해주는 함수
 */
export const getMapProps = (mapData: TiledMap | null) => {
  if (!mapData?.width || !mapData?.height) return {};

  const width =
    mapData.tilewidth && mapData.width
      ? mapData.width * mapData.tilewidth
      : undefined;
  const height =
    mapData.tileheight && mapData.height
      ? mapData.height * mapData.tileheight
      : undefined;
  const collision = mapData
    ? buildCollisionFromLayers(mapData, COLLISION_LAYERS)
    : null;

  return {
    width,
    height,
    collision: collision ?? undefined,
  };
};
