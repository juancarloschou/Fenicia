/** Logical map size — matches cropped map-mediterranean.jpg (1004×528) */
export const MAP_WIDTH = 1004;
export const MAP_HEIGHT = 528;

export const MAP_ASPECT = MAP_WIDTH / MAP_HEIGHT;

/**
 * Port positions on the cropped map (anchor icons).
 */
export const PORT_MAP_COORDS: Record<string, { px: number; py: number }> = {
  carthage: { px: 165, py: 285 },
  crete: { px: 462, py: 385 },
  rhodes: { px: 532, py: 300 },
  cyprus: { px: 605, py: 245 },
  byblos: { px: 755, py: 142 },
  tyre: { px: 778, py: 218 },
};

export function portToPercent(id: string): { x: number; y: number } {
  const c = PORT_MAP_COORDS[id];
  if (!c) return { x: 0.5, y: 0.5 };
  return { x: c.px / MAP_WIDTH, y: c.py / MAP_HEIGHT };
}

const MAP_SRC = `${import.meta.env.BASE_URL}assets/map-mediterranean.jpg`;

interface MediterraneanMapProps {
  knownPorts: string[];
}

export function MediterraneanMap({ knownPorts }: MediterraneanMapProps) {
  const allPortIds = Object.keys(PORT_MAP_COORDS);

  return (
    <>
      <img
        className="med-map-image"
        src={MAP_SRC}
        alt="Mediterranean trade map"
        draggable={false}
      />

      {allPortIds
        .filter((id) => !knownPorts.includes(id))
        .map((id) => {
          const { x, y } = portToPercent(id);
          return (
            <div
              key={`fog-${id}`}
              className="map-fog"
              style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              aria-hidden
            />
          );
        })}
    </>
  );
}

export const DANGEROUS_ROUTES: [string, string][] = [
  ['tyre', 'carthage'],
  ['crete', 'carthage'],
];
