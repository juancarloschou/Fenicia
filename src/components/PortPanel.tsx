import { useGameStore } from '../store/gameStore';
import { goods, getPortDef, balance } from '../game/config';
import { getPortPrice, getDelayedPrice, getCargoWeight, getShipCapacity } from '../game/economy';
import { getShipsInPort } from '../game/ships';
import './PortPanel.css';

export function PortPanel() {
  const state = useGameStore((s) => s.state);
  const buy = useGameStore((s) => s.buy);
  const sell = useGameStore((s) => s.sell);
  const sail = useGameStore((s) => s.sail);
  const repair = useGameStore((s) => s.repair);
  const upgrade = useGameStore((s) => s.upgrade);
  const purchaseShip = useGameStore((s) => s.purchaseShip);
  const selectShip = useGameStore((s) => s.selectShip);

  const portId = state.selectedPortId;
  if (!portId || !state.knownPorts.includes(portId)) {
    return (
      <div className="port-panel empty">
        <p>Select a port on the map</p>
      </div>
    );
  }

  const def = getPortDef(portId);
  const shipsHere = getShipsInPort(state, portId);
  const activeShip =
    shipsHere.find((s) => s.id === state.selectedShipId) ?? shipsHere[0] ?? null;

  const destinations = state.knownPorts.filter((p) => p !== portId);

  return (
    <div className="port-panel">
      <div className="port-header">
        <h2>{def.name}</h2>
        <div className="port-tags">
          {def.produces.map((g) => (
            <span key={g} className="tag produce">+{g}</span>
          ))}
          {def.demands.map((g) => (
            <span key={g} className="tag demand">-{g}</span>
          ))}
        </div>
      </div>

      {shipsHere.length > 0 && (
        <div className="ship-tabs">
          {shipsHere.map((s) => (
            <button
              key={s.id}
              className={`ship-tab ${activeShip?.id === s.id ? 'active' : ''}`}
              onClick={() => selectShip(s.id)}
            >
              {s.name} {s.damaged ? '⚠' : ''}
            </button>
          ))}
        </div>
      )}

      {activeShip && (
        <>
          <div className="cargo-bar">
            Cargo: {getCargoWeight(activeShip.cargo)} / {getShipCapacity(state, activeShip.tier)}t
            {activeShip.damaged && (
              <button className="btn-repair" onClick={() => repair(activeShip.id)}>
                Repair ship
              </button>
            )}
          </div>

          <div className="goods-table">
            <div className="goods-header">
              <span>Good</span>
              <span>Price</span>
              <span>Cargo</span>
              <span>Trade</span>
            </div>
            {goods.map((good) => {
              const priceNow = getPortPrice(state, portId, good.id, false);
              const delayed = getDelayedPrice(state, portId, good.id);
              const cargoQty =
                activeShip.cargo.find((c) => c.good === good.id)?.qty ?? 0;
              const trend =
                priceNow > good.basePrice ? '↑' : priceNow < good.basePrice ? '↓' : '→';

              return (
                <div key={good.id} className="goods-row">
                  <span className="good-name">
                    {good.icon} {good.name}
                  </span>
                  <span className="good-price">
                    {delayed?.price ?? priceNow} {trend}
                    {delayed && delayed.delay > 0 && (
                      <small>(-{delayed.delay}t)</small>
                    )}
                  </span>
                  <span>{cargoQty}</span>
                  <span className="trade-btns">
                    <button
                      className="btn-buy"
                      onClick={() => buy(activeShip.id, good.id, 1)}
                      disabled={state.gold < priceNow}
                    >
                      Buy
                    </button>
                    <button
                      className="btn-sell"
                      onClick={() => sell(activeShip.id, good.id, 1)}
                      disabled={cargoQty === 0}
                    >
                      Sell
                    </button>
                    <button
                      className="btn-buy"
                      onClick={() => buy(activeShip.id, good.id, 5)}
                      disabled={state.gold < priceNow * 5}
                    >
                      +5
                    </button>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="ship-actions">
            <h3>Sail to</h3>
            <div className="dest-btns">
              {destinations.map((dest) => (
                <button key={dest} onClick={() => sail(activeShip.id, dest)}>
                  {getPortDef(dest).name}
                </button>
              ))}
            </div>
          </div>

          {activeShip.tier < balance.shipTiers.length - 1 && (
            <button
              className="btn-upgrade"
              onClick={() => upgrade(activeShip.id)}
              disabled={
                state.gold <
                balance.shipUpgradeCosts[activeShip.tier + 1]
              }
            >
              Upgrade ship (Tier {activeShip.tier + 2}) —{' '}
              {balance.shipUpgradeCosts[activeShip.tier + 1]} gold
            </button>
          )}
        </>
      )}

      {shipsHere.length === 0 && (
        <p className="no-ship">No ships docked here</p>
      )}

      {portId === 'tyre' && state.ships.length < balance.maxShips && (
        <button
          className="btn-new-ship"
          onClick={purchaseShip}
          disabled={state.gold < balance.newShipCost}
        >
          Buy new ship — {balance.newShipCost} gold
        </button>
      )}
    </div>
  );
}
