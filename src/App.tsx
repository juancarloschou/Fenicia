import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { MapView } from './components/MapView';
import { TurnBar } from './components/TurnBar';
import { PortPanel } from './components/PortPanel';
import { EventBanner } from './components/EventBanner';
import { PirateModal } from './components/PirateModal';
import { HeirScreen } from './components/HeirScreen';
import { EndScreen } from './components/EndScreen';
import { ScoutPanel } from './components/ScoutPanel';
import './App.css';

export default function App() {
  const init = useGameStore((s) => s.init);
  const phase = useGameStore((s) => s.state.phase);
  const gold = useGameStore((s) => s.state.gold);
  const generation = useGameStore((s) => s.state.dynasty.generation);

  useEffect(() => {
    init();
  }, [init]);

  if (phase === 'ended') {
    return <EndScreen />;
  }

  if (phase === 'heir') {
    return <HeirScreen />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Fenicia</h1>
        <div className="header-stats">
          <span>Gen {generation}</span>
          <span className="gold-display">{gold} gold</span>
        </div>
      </header>

      <EventBanner />

      <div className="main-content">
        <div className="map-area">
          <MapView />
          <p className="map-pan-hint" aria-hidden>Scroll map to explore</p>
        </div>
        <div className="panel-area">
          <ScoutPanel />
          <PortPanel />
        </div>
      </div>

      <TurnBar />
      <PirateModal />
    </div>
  );
}
