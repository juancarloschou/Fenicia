import { useGameStore } from '../store/gameStore';
import { getEventDescription, getActiveEventDescription } from '../game/events';
import './EventBanner.css';

export function EventBanner() {
  const state = useGameStore((s) => s.state);

  if (state.pendingEventWarning) {
    return (
      <div className="event-banner warning">
        ⚠ {getEventDescription(state.pendingEventWarning)} — in{' '}
        {state.pendingEventWarning.turnsUntil} turn(s)
      </div>
    );
  }

  if (state.activeEvent) {
    return (
      <div className="event-banner active">
        {getActiveEventDescription(state)}
      </div>
    );
  }

  return null;
}
