import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { portDefs, getPortDef, isRouteDangerous } from '../game/config';
import {
  MediterraneanMap,
  portToPercent,
  MAP_WIDTH,
  MAP_HEIGHT,
  DANGEROUS_ROUTES,
} from './MediterraneanMap';
import './MapView.css';

export function MapView() {
  const state = useGameStore((s) => s.state);
  const selectPort = useGameStore((s) => s.selectPort);
  const selectShip = useGameStore((s) => s.selectShip);
  const selectedPortId = state.selectedPortId;

  const scrollRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const scrollToPoint = useCallback((x: number, y: number) => {
    const container = scrollRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const targetX = x * stage.offsetWidth - container.clientWidth * 0.5;
    const targetY = y * stage.offsetHeight - container.clientHeight * 0.5;

    container.scrollTo({
      left: Math.max(0, targetX),
      top: Math.max(0, targetY),
      behavior: 'smooth',
    });
  }, []);

  // Auto-pan to selected port, docked ship, or ship in transit
  useEffect(() => {
    const inTransit = state.ships.find((s) => s.inTransit && s.originId && s.destinationId);
    if (inTransit) {
      const from = portToPercent(inTransit.originId!);
      const to = portToPercent(inTransit.destinationId!);
      const progress =
        inTransit.totalTurns > 0
          ? (inTransit.totalTurns - inTransit.turnsRemaining) / inTransit.totalTurns
          : 0;
      scrollToPoint(from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress);
      return;
    }

    if (selectedPortId) {
      const { x, y } = portToPercent(selectedPortId);
      scrollToPoint(x, y);
    }
  }, [selectedPortId, state.ships, state.turn, scrollToPoint]);

  function handlePortClick(portId: (typeof portDefs)[0]['id']) {
    selectPort(portId);
    const ship = state.ships.find((s) => s.portId === portId && !s.inTransit);
    if (ship) selectShip(ship.id);
  }

  return (
    <div className="map-view" ref={scrollRef}>
      <div className="map-stage" ref={stageRef}>
        <MediterraneanMap knownPorts={state.knownPorts} />

        <svg
          className="route-lines"
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="none"
        >
          {state.knownPorts.flatMap((from) => {
            const def = getPortDef(from);
            return def.adjacent
              .filter((to) => state.knownPorts.includes(to))
              .map((to) => {
                if (from > to) return null;
                const fromCoord = portToPercent(from);
                const toCoord = portToPercent(to);
                const dangerous = isRouteDangerous(from, to);
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={fromCoord.x * MAP_WIDTH}
                    y1={fromCoord.y * MAP_HEIGHT}
                    x2={toCoord.x * MAP_WIDTH}
                    y2={toCoord.y * MAP_HEIGHT}
                    className={dangerous ? 'route-danger' : 'route-safe'}
                  />
                );
              });
          })}

          {DANGEROUS_ROUTES.map(([a, b]) => {
            if (
              !state.knownPorts.includes(a as (typeof state.knownPorts)[0]) ||
              !state.knownPorts.includes(b as (typeof state.knownPorts)[0])
            ) {
              return null;
            }
            const fromCoord = portToPercent(a);
            const toCoord = portToPercent(b);
            return (
              <line
                key={`danger-${a}-${b}`}
                x1={fromCoord.x * MAP_WIDTH}
                y1={fromCoord.y * MAP_HEIGHT}
                x2={toCoord.x * MAP_WIDTH}
                y2={toCoord.y * MAP_HEIGHT}
                className="route-danger-glow"
              />
            );
          })}
        </svg>

        {portDefs.map((def) => {
          const known = state.knownPorts.includes(def.id);
          if (!known) return null;

          const { x, y } = portToPercent(def.id);
          const isSelected = selectedPortId === def.id;
          const shipsHere = state.ships.filter((s) => s.portId === def.id && !s.inTransit);

          return (
            <div
              key={def.id}
              className={`port-marker ${isSelected ? 'selected' : ''} ${def.isHome ? 'home' : ''}`}
              style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
            >
              <button
                type="button"
                className={`port-hit ${isSelected ? 'selected' : ''}`}
                onClick={() => handlePortClick(def.id)}
                aria-label={`${def.name}${shipsHere.length ? `, ${shipsHere.length} ship(s)` : ''}`}
                aria-pressed={isSelected}
              >
                <span className="port-ring" />
                {isSelected && <span className="port-label">{def.name}</span>}
              </button>

              {shipsHere.length > 0 && (
                <div className="port-ship-list">
                  {shipsHere.map((ship) => (
                    <button
                      key={ship.id}
                      type="button"
                      className={`docked-ship ${state.selectedShipId === ship.id ? 'active' : ''} ${ship.damaged ? 'damaged' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectPort(def.id);
                        selectShip(ship.id);
                      }}
                      title={ship.name}
                    >
                      ⛵
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {state.ships
          .filter((s) => s.inTransit && s.originId && s.destinationId)
          .map((ship) => {
            const from = portToPercent(ship.originId!);
            const to = portToPercent(ship.destinationId!);
            const progress =
              ship.totalTurns > 0
                ? (ship.totalTurns - ship.turnsRemaining) / ship.totalTurns
                : 0;
            const x = from.x + (to.x - from.x) * progress;
            const y = from.y + (to.y - from.y) * progress;
            const onDangerousRoute =
              ship.originId &&
              ship.destinationId &&
              isRouteDangerous(ship.originId, ship.destinationId);

            return (
              <div
                key={ship.id}
                className={`ship-token ${ship.damaged ? 'damaged' : ''} ${onDangerousRoute ? 'at-risk' : ''}`}
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                title={`${ship.name} — ${ship.turnsRemaining} turn(s) to ${getPortDef(ship.destinationId!).name}`}
              >
                <span className="ship-emoji">⛵</span>
                <span className="ship-name-tag">{ship.name}</span>
                {ship.turnsRemaining > 0 && (
                  <span className="ship-eta">{ship.turnsRemaining}t</span>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
