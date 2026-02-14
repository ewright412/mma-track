'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Clock,
  Timer as TimerIcon,
  Gauge,
  Plus,
  Flag,
  Trash2,
} from 'lucide-react';
import {
  unlockAudio,
  playWarningBeep,
  playLongBeep,
  playTripleBeep,
  playDoubleBeep,
} from '@/lib/timerSounds';

type TimerMode = 'round' | 'interval' | 'stopwatch';

interface RoundPreset {
  label: string;
  roundTime: number;
  restTime: number;
  rounds: number;
}

const PRESETS: RoundPreset[] = [
  { label: 'Boxing', roundTime: 180, restTime: 60, rounds: 12 },
  { label: 'MMA', roundTime: 300, restTime: 60, rounds: 3 },
  { label: 'Muay Thai', roundTime: 180, restTime: 120, rounds: 5 },
  { label: 'BJJ', roundTime: 360, restTime: 60, rounds: 5 },
];

const TABATA_PRESET = { workTime: 20, restTime: 10, rounds: 8 };

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatStopwatch(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds
    .toString()
    .padStart(2, '0')}`;
}

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>('round');

  return (
    <div className="px-4 pt-3 pb-24 min-h-screen">
      <div className="max-w-lg mx-auto">
        {/* Mode Tabs */}
        <div className="flex bg-[#1a1a24] rounded-xl p-1 mb-6 border border-white/[0.08]">
          {([
            { key: 'round', label: 'Round Timer', icon: Clock },
            { key: 'interval', label: 'Interval', icon: TimerIcon },
            { key: 'stopwatch', label: 'Stopwatch', icon: Gauge },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                mode === key
                  ? 'bg-red-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{key === 'round' ? 'Round' : key === 'interval' ? 'HIIT' : 'Stop'}</span>
            </button>
          ))}
        </div>

        {mode === 'round' && <RoundTimer />}
        {mode === 'interval' && <IntervalTimer />}
        {mode === 'stopwatch' && <Stopwatch />}
      </div>
    </div>
  );
}

// ============================================================================
// ROUND TIMER
// ============================================================================

function RoundTimer() {
  const [roundTime, setRoundTime] = useState(180);
  const [restTime, setRestTime] = useState(60);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isRunning, setIsRunning] = useState(false);
  const [isFight, setIsFight] = useState(true); // true = fight, false = rest
  const [isFinished, setIsFinished] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const prevTimeRef = useRef(timeLeft);

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // Wake Lock not available
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  useEffect(() => {
    if (isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => releaseWakeLock();
  }, [isRunning, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;

        // 10-second warning during fight phase
        if (isFight && next <= 10 && next > 0 && next !== prevTimeRef.current) {
          playWarningBeep();
        }

        prevTimeRef.current = next;

        if (next <= 0) {
          // Phase ended
          if (isFight) {
            playLongBeep();
            if (currentRound >= totalRounds) {
              // All rounds done
              setIsRunning(false);
              setIsFinished(true);
              return 0;
            }
            // Start rest
            setIsFight(false);
            return restTime;
          } else {
            // Rest ended, start next round
            playTripleBeep();
            setCurrentRound((r) => r + 1);
            setIsFight(true);
            return roundTime;
          }
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isFight, currentRound, totalRounds, roundTime, restTime]);

  const handleStart = () => {
    unlockAudio();
    if (isFinished) {
      handleReset();
    }
    setIsRunning(true);
    playTripleBeep();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentRound(1);
    setTimeLeft(roundTime);
    setIsFight(true);
    setIsFinished(false);
    prevTimeRef.current = roundTime;
  };

  const handleSkip = () => {
    if (isFight) {
      playLongBeep();
      if (currentRound >= totalRounds) {
        setIsRunning(false);
        setIsFinished(true);
        setTimeLeft(0);
        return;
      }
      setIsFight(false);
      setTimeLeft(restTime);
      prevTimeRef.current = restTime;
    } else {
      playTripleBeep();
      setCurrentRound((r) => r + 1);
      setIsFight(true);
      setTimeLeft(roundTime);
      prevTimeRef.current = roundTime;
    }
  };

  const applyPreset = (preset: RoundPreset) => {
    setIsRunning(false);
    setRoundTime(preset.roundTime);
    setRestTime(preset.restTime);
    setTotalRounds(preset.rounds);
    setCurrentRound(1);
    setTimeLeft(preset.roundTime);
    setIsFight(true);
    setIsFinished(false);
    setShowCustom(false);
    prevTimeRef.current = preset.roundTime;
  };

  const applyCustom = () => {
    setCurrentRound(1);
    setTimeLeft(roundTime);
    setIsFight(true);
    setIsFinished(false);
    setShowCustom(false);
    prevTimeRef.current = roundTime;
  };

  return (
    <div className="space-y-6">
      {/* State Label */}
      <div className="text-center">
        {isFinished ? (
          <span className="text-lg font-semibold text-[#22c55e]">COMPLETE</span>
        ) : (
          <span
            className={`text-lg font-semibold ${
              isFight ? 'text-red-500' : 'text-[#22c55e]'
            }`}
          >
            {isFight ? 'FIGHT' : 'REST'}
          </span>
        )}
      </div>

      {/* Time Display */}
      <div className="text-center">
        <div className="text-7xl font-mono font-bold text-white tabular-nums">
          {formatTime(timeLeft)}
        </div>
        <p className="text-gray-400 mt-2">
          Round {currentRound} of {totalRounds}
        </p>
      </div>

      {/* Round Progress Dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalRounds }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i + 1 < currentRound
                ? 'bg-[#22c55e]'
                : i + 1 === currentRound
                ? isFight
                  ? 'bg-red-500'
                  : 'bg-[#22c55e]'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={handleReset}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
          aria-label="Reset"
        >
          <RotateCcw size={22} />
        </button>

        <button
          onClick={isRunning ? handlePause : handleStart}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-150 ${
            isRunning
              ? 'bg-[#f59e0b] hover:bg-[#f59e0b]/80'
              : 'bg-red-500 hover:bg-red-600'
          }`}
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <button
          onClick={handleSkip}
          disabled={!isRunning && !isFight}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150 disabled:opacity-30"
          aria-label="Skip"
        >
          <SkipForward size={22} />
        </button>
      </div>

      {/* Presets */}
      {!isRunning && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="bg-[#1a1a24] border border-white/[0.08] rounded-xl p-4 text-left hover:border-red-500/30 transition-all duration-150"
              >
                <div className="text-white font-medium text-sm">{preset.label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {preset.roundTime / 60}min / {preset.restTime}s rest / {preset.rounds}r
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCustom(!showCustom)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Plus size={14} />
            Custom Settings
          </button>

          {showCustom && (
            <div className="bg-[#1a1a24] border border-white/[0.08] rounded-xl p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Round Time (seconds)</label>
                <input
                  type="number"
                  min={10}
                  max={600}
                  value={roundTime}
                  onChange={(e) => setRoundTime(Number(e.target.value))}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Rest Time (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={restTime}
                  onChange={(e) => setRestTime(Number(e.target.value))}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Rounds</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/30"
                />
              </div>
              <button
                onClick={applyCustom}
                className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INTERVAL TIMER
// ============================================================================

function IntervalTimer() {
  const [workTime, setWorkTime] = useState(TABATA_PRESET.workTime);
  const [restTime, setRestTime] = useState(TABATA_PRESET.restTime);
  const [totalRounds, setTotalRounds] = useState(TABATA_PRESET.rounds);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TABATA_PRESET.workTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // Wake Lock not available
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  useEffect(() => {
    if (isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => releaseWakeLock();
  }, [isRunning, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isWork) {
            playDoubleBeep();
            if (currentRound >= totalRounds) {
              setIsRunning(false);
              setIsFinished(true);
              return 0;
            }
            setIsWork(false);
            return restTime;
          } else {
            playTripleBeep();
            setCurrentRound((r) => r + 1);
            setIsWork(true);
            return workTime;
          }
        }
        // 3-second warning
        if (prev <= 4 && prev > 1) {
          playWarningBeep();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isWork, currentRound, totalRounds, workTime, restTime]);

  const handleStart = () => {
    unlockAudio();
    if (isFinished) handleReset();
    setIsRunning(true);
    playTripleBeep();
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentRound(1);
    setTimeLeft(workTime);
    setIsWork(true);
    setIsFinished(false);
  };

  const applyTabata = () => {
    setWorkTime(TABATA_PRESET.workTime);
    setRestTime(TABATA_PRESET.restTime);
    setTotalRounds(TABATA_PRESET.rounds);
    setTimeLeft(TABATA_PRESET.workTime);
    setCurrentRound(1);
    setIsWork(true);
    setIsFinished(false);
    setShowCustom(false);
  };

  const applyCustom = () => {
    setTimeLeft(workTime);
    setCurrentRound(1);
    setIsWork(true);
    setIsFinished(false);
    setShowCustom(false);
  };

  return (
    <div className="space-y-6">
      {/* State Label */}
      <div className="text-center">
        {isFinished ? (
          <span className="text-lg font-semibold text-[#22c55e]">COMPLETE</span>
        ) : (
          <span
            className={`text-lg font-semibold ${
              isWork ? 'text-red-500' : 'text-[#22c55e]'
            }`}
          >
            {isWork ? 'WORK' : 'REST'}
          </span>
        )}
      </div>

      {/* Time Display */}
      <div className="text-center">
        <div className="text-7xl font-mono font-bold text-white tabular-nums">
          {formatTime(timeLeft)}
        </div>
        <p className="text-gray-400 mt-2">
          Round {currentRound} of {totalRounds}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={handleReset}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
          aria-label="Reset"
        >
          <RotateCcw size={22} />
        </button>

        <button
          onClick={isRunning ? () => setIsRunning(false) : handleStart}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-150 ${
            isRunning
              ? 'bg-[#f59e0b] hover:bg-[#f59e0b]/80'
              : 'bg-red-500 hover:bg-red-600'
          }`}
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <div className="w-14 h-14" /> {/* Spacer for alignment */}
      </div>

      {/* Presets & Custom */}
      {!isRunning && (
        <div className="space-y-4">
          <button
            onClick={applyTabata}
            className="w-full bg-[#1a1a24] border border-white/[0.08] rounded-xl p-4 text-left hover:border-red-500/30 transition-all duration-150"
          >
            <div className="text-white font-medium text-sm">Tabata</div>
            <div className="text-xs text-gray-500 mt-1">
              20s work / 10s rest / 8 rounds
            </div>
          </button>

          <button
            onClick={() => setShowCustom(!showCustom)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Plus size={14} />
            Custom Settings
          </button>

          {showCustom && (
            <div className="bg-[#1a1a24] border border-white/[0.08] rounded-xl p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Work Time (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={workTime}
                  onChange={(e) => setWorkTime(Number(e.target.value))}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Rest Time (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={restTime}
                  onChange={(e) => setRestTime(Number(e.target.value))}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Rounds</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/30"
                />
              </div>
              <button
                onClick={applyCustom}
                className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STOPWATCH
// ============================================================================

function Stopwatch() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!isRunning) return;

    const baseTime = Date.now() - elapsedMs;
    startTimeRef.current = baseTime;

    const tick = () => {
      setElapsedMs(Date.now() - startTimeRef.current);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animFrameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const handleStart = () => {
    unlockAudio();
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    setLaps((prev) => [elapsedMs, ...prev]);
  };

  const getLapDelta = (index: number): number => {
    if (index === laps.length - 1) return laps[index];
    return laps[index] - laps[index + 1];
  };

  return (
    <div className="space-y-6">
      {/* Time Display */}
      <div className="text-center">
        <div className="text-7xl font-mono font-bold text-white tabular-nums">
          {formatStopwatch(elapsedMs)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={isRunning ? handleLap : handleReset}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
          aria-label={isRunning ? 'Lap' : 'Reset'}
        >
          {isRunning ? <Flag size={22} /> : <RotateCcw size={22} />}
        </button>

        <button
          onClick={isRunning ? handleStop : handleStart}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-150 ${
            isRunning
              ? 'bg-[#f59e0b] hover:bg-[#f59e0b]/80'
              : 'bg-red-500 hover:bg-red-600'
          }`}
          aria-label={isRunning ? 'Stop' : 'Start'}
        >
          {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <div className="w-14 h-14" /> {/* Spacer for alignment */}
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="bg-[#1a1a24] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
            <span className="text-sm font-medium text-white">Laps</span>
            <button
              onClick={() => setLaps([])}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.05]">
            {laps.map((lapMs, i) => {
              const lapNum = laps.length - i;
              const delta = getLapDelta(i);

              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-sm text-gray-400">Lap {lapNum}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 tabular-nums">
                      +{formatStopwatch(delta)}
                    </span>
                    <span className="text-sm text-white font-medium tabular-nums">
                      {formatStopwatch(lapMs)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
