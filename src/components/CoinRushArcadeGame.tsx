import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CoinRushGameState,
  CoinRushInput,
  createInitialCoinRushState,
  stepCoinRushState,
  loadCoinRushHighScore,
  saveCoinRushHighScore,
} from '../utils/coinRushGame';
import {
  loadArcadeGhostSeries,
  recordArcadeGhostRun,
  ArcadeGhostSeries,
} from '../utils/ghostRaceAndKnowledgeGraph';
import { MarioAvatar } from '../types/laborLaw';
import { MarioCharacterAvatar, MarioCoinIcon, MarioStarIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { awardUserXp } from '../utils/levelProgressionService';
import { dispatchDailyMissionEvent } from '../utils/round11Features';
import {
  Trophy,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  Heart,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Volume2,
  VolumeX,
  Target,
  Zap,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface CoinRushArcadeGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins?: (amount: number) => void;
  onExitGame?: () => void;
}

export const CoinRushArcadeGame: React.FC<CoinRushArcadeGameProps> = ({
  equippedAvatar,
  onEarnCoins,
  onExitGame,
}) => {
  const [gameState, setGameState] = useState<CoinRushGameState>(() =>
    createInitialCoinRushState(Date.now())
  );
  const [highScore, setHighScore] = useState<number>(() => {
    return typeof window !== 'undefined'
      ? loadCoinRushHighScore(window.localStorage)
      : loadCoinRushHighScore();
  });
  const [ghostSeries, setGhostSeries] = useState<ArcadeGhostSeries | null>(() => {
    if (typeof window === 'undefined') return null;
    const all = loadArcadeGhostSeries(window.localStorage);
    return all['coin_rush'] || null;
  });
  const [showGhostOverlay, setShowGhostOverlay] = useState<boolean>(true);
  const [keysDown, setKeysDown] = useState<CoinRushInput>({
    left: false,
    right: false,
    jump: false,
  });

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, left: true }));
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, right: true }));
      } else if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        e.preventDefault();
        setKeysDown((prev) => ({ ...prev, jump: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, left: false }));
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, right: false }));
      } else if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, jump: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Physics / Game Loop
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      setGameState((prev) => {
        if (prev.status !== 'playing') return prev;
        const next = stepCoinRushState(prev, keysDown, dt);

        // Sound effect triggers on state changes
        if (next.coinsCollected > prev.coinsCollected) {
          marioAudio.playCoin();
        }
        if (next.invincibleTimerSec > 0 && prev.invincibleTimerSec <= 0) {
          marioAudio.playStarTheme();
        }
        if (next.lives < prev.lives) {
          marioAudio.playWrongAnswer();
        }
        if (next.status === 'won' && prev.status === 'playing') {
          marioAudio.playFanfare();
          const earned = Math.max(10, Math.floor(next.score / 25));
          onEarnCoins?.(earned);
          awardUserXp({ amount: 50, reason: 'Super Mario Coin Rush Stage Clear' });
          dispatchDailyMissionEvent('coin_rush', 1);

          if (typeof window !== 'undefined') {
            const nextBest = saveCoinRushHighScore(next.score, window.localStorage);
            setHighScore(nextBest);
            const updatedGhost = recordArcadeGhostRun({
              gameId: 'coin_rush',
              gameTitle: 'Super Mario Coin Rush',
              finalScore: next.score,
              storage: window.localStorage,
            });
            setGhostSeries(updatedGhost['coin_rush'] || null);
          }
        } else if (next.status === 'game_over' && prev.status === 'playing') {
          marioAudio.playGameOver();
          if (typeof window !== 'undefined') {
            const nextBest = saveCoinRushHighScore(next.score, window.localStorage);
            setHighScore(nextBest);
          }
        }

        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState.status, keysDown, onEarnCoins]);

  const handleStartGame = () => {
    marioAudio.playPowerUp();
    lastTimeRef.current = 0;
    setGameState(createInitialCoinRushState(Date.now()));
  };

  const isStarActive = gameState.invincibleTimerSec > 0;
  const ghostScoreTarget = ghostSeries ? ghostSeries.finalScore : highScore;
  const ghostLeadRatio =
    ghostScoreTarget > 0 ? Math.min(1.2, gameState.score / ghostScoreTarget) : 1;

  return (
    <div
      ref={gameContainerRef}
      data-testid="coin-rush-game-root"
      className="bg-slate-950 border-4 border-amber-400 rounded-3xl p-3 sm:p-6 text-white shadow-[8px_8px_0_#000] space-y-4 max-w-4xl mx-auto w-full select-none"
    >
      {/* Header HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-800 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            <MarioStarIcon className="w-6 h-6 animate-spin" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block truncate">
              ARCADE VAULT · ACTION PLATFORMER
            </span>
            <h2 className="text-base sm:text-xl font-black font-display text-white truncate">
              SUPER MARIO COIN RUSH: LABOR SHIELD
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowGhostOverlay(!showGhostOverlay)}
            data-testid="toggle-ghost-overlay-btn"
            className={`min-h-[34px] px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
              showGhostOverlay
                ? 'bg-purple-950/80 text-purple-200 border-purple-500'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Ghost Race</span>
          </button>

          {onExitGame && (
            <button
              type="button"
              onClick={onExitGame}
              className="min-h-[34px] px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
          <span className="text-slate-400 font-bold">Score:</span>
          <span className="font-mario text-amber-300 tabular-nums">{gameState.score}</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <MarioCoinIcon className="w-3.5 h-3.5" />
            Coins:
          </span>
          <span className="font-mono font-black text-amber-400 tabular-nums">
            {gameState.coinsCollected}
          </span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            High Score:
          </span>
          <span className="font-mono font-black text-white tabular-nums">{highScore}</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
          <span className="text-slate-400 font-bold">Lives:</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-3.5 h-3.5 ${
                  heart <= gameState.lives
                    ? 'text-rose-500 fill-rose-500'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ghost Race Track HUD Indicator */}
      {showGhostOverlay && ghostSeries && (
        <div
          data-testid="coin-rush-ghost-hud"
          className="bg-purple-950/40 border border-purple-500/50 rounded-2xl p-2.5 text-xs flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
            <span className="text-purple-200 font-bold">
              Ghost Target: <strong className="text-white">{ghostSeries.finalScore} pts</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span>
              {ghostLeadRatio >= 1 ? (
                <span className="text-emerald-300 font-black">
                  Ahead of Ghost (+{Math.round((ghostLeadRatio - 1) * 100)}%)
                </span>
              ) : (
                <span className="text-amber-300 font-black">
                  Chasing Ghost ({Math.round(ghostLeadRatio * 100)}%)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Game Stage Stage Canvas Area */}
      <div
        data-testid="coin-rush-viewport"
        className="relative w-full h-[320px] sm:h-[380px] bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-950 border-3 border-black rounded-2xl overflow-hidden shadow-inner flex flex-col justify-end"
      >
        {/* Background Clouds & Stars */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-6 left-12 w-20 h-8 bg-white/40 rounded-full blur-xs" />
          <div className="absolute top-14 right-20 w-32 h-10 bg-white/40 rounded-full blur-xs" />
        </div>

        {/* Platforms */}
        {gameState.platforms.map((p, idx) => (
          <div
            key={idx}
            style={{
              left: `${(p.x / gameState.width) * 100}%`,
              top: `${(p.y / gameState.height) * 100}%`,
              width: `${(p.w / gameState.width) * 100}%`,
              height: `${(p.h / gameState.height) * 100}%`,
            }}
            className="absolute bg-gradient-to-b from-amber-600 to-amber-900 border-t-3 border-amber-400 shadow-[0_4px_0_#000] rounded-sm"
          />
        ))}

        {/* Collectibles (Coins & Star Items) */}
        {gameState.collectibles
          .filter((c) => !c.collected)
          .map((item) => (
            <div
              key={item.id}
              style={{
                left: `${(item.x / gameState.width) * 100}%`,
                top: `${(item.y / gameState.height) * 100}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform animate-bounce"
            >
              {item.kind === 'star' ? (
                <div className="w-7 h-7 rounded-full bg-amber-300 border-2 border-black flex items-center justify-center shadow-lg animate-spin">
                  <MarioStarIcon className="w-5 h-5 text-slate-950" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-400 border border-black flex items-center justify-center shadow-md">
                  <MarioCoinIcon className="w-4 h-4 text-slate-950" />
                </div>
              )}
            </div>
          ))}

        {/* Moving Obstacles: Labor Code Violations */}
        {gameState.obstacles.map((obs) => (
          <div
            key={obs.id}
            style={{
              left: `${(obs.x / gameState.width) * 100}%`,
              top: `${(obs.y / gameState.height) * 100}%`,
              width: `${(obs.w / gameState.width) * 100}%`,
              height: `${(obs.h / gameState.height) * 100}%`,
            }}
            className={`absolute rounded-xl border-2 border-black flex flex-col items-center justify-center px-1 shadow-[0_2px_0_#000] transition-transform ${
              isStarActive
                ? 'bg-rose-950/60 border-rose-500 opacity-70'
                : 'bg-rose-600 text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
            <span className="text-[8px] font-black font-mario text-center leading-none truncate max-w-full">
              {obs.violationTitle}
            </span>
          </div>
        ))}

        {/* Player Avatar */}
        <div
          data-testid="coin-rush-player"
          style={{
            left: `${(gameState.playerX / gameState.width) * 100}%`,
            top: `${(gameState.playerY / gameState.height) * 100}%`,
            width: `${(gameState.playerW / gameState.width) * 100}%`,
            height: `${(gameState.playerH / gameState.height) * 100}%`,
            transform: `scaleX(${gameState.facing})`,
          }}
          className={`absolute rounded-xl flex items-center justify-center transition-all ${
            isStarActive
              ? 'ring-4 ring-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.9)] animate-pulse'
              : ''
          }`}
        >
          <MarioCharacterAvatar character={equippedAvatar} className="w-full h-full" />
        </div>

        {/* Active Doctrine Tip Toast when collecting Coins */}
        {gameState.activeTip && (
          <div
            data-testid="coin-rush-active-doctrine"
            className="absolute top-3 left-3 right-3 bg-slate-950/90 border-2 border-amber-400 rounded-xl px-3 py-1.5 text-xs text-amber-200 font-semibold shadow-md flex items-center gap-2 truncate"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{gameState.activeTip}</span>
          </div>
        )}

        {/* Star Power Countdown HUD */}
        {isStarActive && (
          <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 font-black font-mario text-[10px] px-2.5 py-1 rounded-full border-2 border-black shadow-md flex items-center gap-1 animate-pulse">
            <MarioStarIcon className="w-3.5 h-3.5" />
            <span>STAR SHIELD: {Math.ceil(gameState.invincibleTimerSec)}s</span>
          </div>
        )}

        {/* Ready / Game Over / Victory Overlay Dialogs */}
        {gameState.status === 'ready' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-xl font-black font-display text-white">READY FOR COIN RUSH?</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Use arrow keys or touch buttons to collect all Gold Coins &amp; Super Stars while dodging Labor Violations!
            </p>
            <button
              type="button"
              onClick={handleStartGame}
              data-testid="start-coin-rush-btn"
              className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black font-mario text-xs rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer active:translate-y-0.5"
            >
              START RUN
            </button>
          </div>
        )}

        {gameState.status === 'won' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 border-2 border-black flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black font-display text-white">ALL COINS COLLECTED!</h3>
            <p className="text-xs text-slate-300 tabular-nums">
              Final Score: <strong className="text-amber-300">{gameState.score}</strong> · Bounty: <strong className="text-emerald-400">+{Math.max(10, Math.floor(gameState.score / 25))} Coins</strong>
            </p>
            <button
              type="button"
              onClick={handleStartGame}
              className="px-6 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black font-mario text-xs rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer"
            >
              PLAY AGAIN
            </button>
          </div>
        )}

        {gameState.status === 'game_over' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white border-2 border-black flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black font-display text-rose-400">OUT OF LIVES!</h3>
            <p className="text-xs text-slate-300 tabular-nums">
              Final Score: <strong className="text-amber-300">{gameState.score}</strong> · Dodged Violations &amp; Learned Doctrines!
            </p>
            <button
              type="button"
              onClick={handleStartGame}
              className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black font-mario text-xs rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Mobile Touch Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={() => setKeysDown((prev) => ({ ...prev, left: true }))}
            onPointerUp={() => setKeysDown((prev) => ({ ...prev, left: false }))}
            onPointerLeave={() => setKeysDown((prev) => ({ ...prev, left: false }))}
            data-testid="touch-btn-left"
            className="w-13 h-12 rounded-2xl bg-slate-900 active:bg-amber-400 text-white active:text-slate-950 border-2 border-slate-700 flex items-center justify-center cursor-pointer select-none active:translate-y-0.5 shadow-md"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onPointerDown={() => setKeysDown((prev) => ({ ...prev, right: true }))}
            onPointerUp={() => setKeysDown((prev) => ({ ...prev, right: false }))}
            onPointerLeave={() => setKeysDown((prev) => ({ ...prev, right: false }))}
            data-testid="touch-btn-right"
            className="w-13 h-12 rounded-2xl bg-slate-900 active:bg-amber-400 text-white active:text-slate-950 border-2 border-slate-700 flex items-center justify-center cursor-pointer select-none active:translate-y-0.5 shadow-md"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <button
          type="button"
          onPointerDown={() => setKeysDown((prev) => ({ ...prev, jump: true }))}
          onPointerUp={() => setKeysDown((prev) => ({ ...prev, jump: false }))}
          onPointerLeave={() => setKeysDown((prev) => ({ ...prev, jump: false }))}
          data-testid="touch-btn-jump"
          className="min-w-[100px] h-12 px-4 rounded-2xl bg-amber-400 active:bg-amber-300 text-slate-950 font-black font-mario text-xs border-2 border-black flex items-center justify-center gap-1.5 cursor-pointer select-none active:translate-y-0.5 shadow-[0_3px_0_#000]"
        >
          <ArrowUp className="w-5 h-5 stroke-[3]" />
          <span>JUMP</span>
        </button>
      </div>
    </div>
  );
};
