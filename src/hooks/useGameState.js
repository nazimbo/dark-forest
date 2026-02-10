import { useState, useCallback, useRef } from 'react';
import { STATES, ACTIONABLE_STATES } from '../simulation/constants';

export const useGameState = () => {
  const [gameState, _setGameState] = useState(STATES.START);
  const gameStateRef = useRef(STATES.START);
  const setGameState = useCallback((val) => {
    gameStateRef.current = val;
    _setGameState(val);
  }, []);

  const [pendingState, _setPendingState] = useState(null);
  const pendingStateRef = useRef(null);
  const setPendingState = useCallback((val) => {
    pendingStateRef.current = val;
    _setPendingState(val);
  }, []);

  // Queue a gated transition (freeze simulation until user clicks Continue)
  const transitionState = useCallback((newState) => {
    if (pendingStateRef.current != null) return;
    if (gameStateRef.current === newState) return;
    setPendingState(newState);
  }, [setPendingState]);

  // User clicks Continue — apply the pending state and unfreeze
  const advance = useCallback(() => {
    const next = pendingStateRef.current;
    if (!next) return;
    setPendingState(null);
    setGameState(next);
  }, [setGameState, setPendingState]);

  const canAct = useCallback(() => {
    return ACTIONABLE_STATES.has(gameStateRef.current);
  }, []);

  return {
    gameState,
    gameStateRef,
    pendingState,
    pendingStateRef,
    setGameState,
    setPendingState,
    transitionState,
    advance,
    canAct,
  };
};
