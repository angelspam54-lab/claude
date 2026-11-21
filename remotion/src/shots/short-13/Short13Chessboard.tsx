import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short13Chessboard',
  durationInSeconds: 40,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e';
const TEAL = '#4db8a8';
const PINK = '#e8879f';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const EOUT = Easing.bezier(0.33, 1, 0.68, 1);
const F = (s: number) => Math.round(s * 30);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// =============================================================================
// THE MATH (exact, BigInt): squares 1..k hold 2^k - 1 grains; square n holds 2^(n-1).
// Whole board 18,446,744,073,709,551,615 · first 32 squares 4,294,967,295 ·
// square 64 = 2^63 = 9,223,372,036,854,775,808 > squares 1..63 = 2^63 - 1.
// =============================================================================
const commas = (b: bigint) => b.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const sumTo = (k: number) => (1n << BigInt(k)) - 1n;
const SQ64 = commas(1n << 63n);
const SQ1_63 = commas(sumTo(63));

// =============================================================================
// CUES — global seconds, taken from the REAL ElevenLabs word times in vo.gen.ts.
// =============================================================================
const HOOK_OUT = 3.6; // rewind starts after "...sixty three times." (ends 3.53)
const REWIND_END = 4.6;
const DEAL_IN = 6.7; // "He asked for wheat on a chessboard" @ 6.63
const POPS = [10.4, 12.16, 13.55, 14.36]; // "One" / "Two" / "four," / "eight."
const PAUSE_FROM = 16.1; // "Pause." @ 16.20
const PAUSE_SEC = 2.8;
const HALF_IN = 19.2; // "Halfway across the board,"
const HALF_OUT = 20.5; // lands on "four billion" @ 20.28-20.87
const TONNES = 21.9; // "A couple hundred tonnes." @ 21.89
const EASY = 23.4; // "Easy." @ 23.41
const FULL_IN = 25.0; // "But the full board..."
const FULL_OUT = 26.4; // lands on "quintillion" @ 26.23
const WORLD_IN = 27.9; // "That's more wheat than the whole world..." @ 28.00
const WORLD_BARS = 29.1; // "whole world" @ 29.07
const THOUSAND = 30.0; // "thousand years" @ 30.02
const WORLD_OUT = 31.5;
const LAST_IN = 32.0; // "the last square" @ 32.05
const OTHERS_IN = 33.7; // "all the others" @ 33.71
const COMBINED = 34.4; // "combined." @ 34.37
const LAST_OUT = 36.1;
const LOOP_IN = 36.3; // "One grain. Sixty three doublings." — restores the hook frame
const LOOP_DONE = 37.3;

// How many squares are filled (continuous) at time t.
const fillAt = (t: number): number => {
  if (t < HOOK_OUT) return 64;
  if (t < REWIND_END) return 64 * (1 - EASE(prog(t, HOOK_OUT, REWIND_END)));
  if (t < POPS[0]) return 0;
  if (t < HALF_IN) return POPS.filter((p) => t >= p).length;
  if (t < FULL_IN) return 4 + 28 * EASE(prog(t, HALF_IN, HALF_OUT));
  return 32 + 32 * EASE(prog(t, FULL_IN, FULL_OUT));
};

// =============================================================================
// BOARD — 8x8, square 1 = bottom-left (a1), filled row by row upward.
// =============================================================================
const BOARD = { x: 180, y: 560, size: 720 };
const CELL = BOARD.size / 8;
const label = (n: number) => (n <= 6 ? String(2 ** (n - 1)) : n === 64 ? '2⁶³' : '');

const Board: React.FC<{ t: number; fill: number; dim: number; split: number }> = ({ t, fill, dim, split }) => {
  const cells = [];
  for (let n = 1; n <= 64; n++) {
    const row = Math.floor((n - 1) / 8);
    const col = (n - 1) % 8;
    const x = col * CELL;
    const y = (7 - row) * CELL;
    const light = (row + col) % 2 === 1;
    const f = clamp01(fill - (n - 1));
    // fill intensity grows with n (log scale: square n holds 2^(n-1))
    const heat = 0.35 + 0.65 * (n / 64);
    // twist 2: square 64 gold, squares 1..63 teal
    const is64 = n === 64;
    const color = split > 0 && !is64 ? TEAL : GOLD;
    const glow64 = is64 && f > 0.99;
    // pop for the four narrated squares
    const popT = n <= 4 ? POPS[n - 1] : -99;
    const pop = t >= popT && t < popT + 0.5 ? 1 + 0.12 * (1 - EOUT(prog(t, popT, popT + 0.5))) : 1;
    cells.push(
      <div
        key={n}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: CELL,
          height: CELL,
          background: light ? '#2a2f3a' : '#1b1f27',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 5,
            borderRadius: 10,
            background: color,
            opacity: f * heat * (split > 0 && !is64 ? 0.55 + 0.45 * (1 - split) : 1),
            transform: `scale(${(0.6 + 0.4 * EOUT(f)) * pop})`,
            boxShadow: glow64 ? `0 0 ${40 + 30 * split}px ${GOLD}` : 'none',
          }}
        />
        {label(n) ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: n === 64 ? 34 : 38,
              color: '#11141a',
              opacity: f,
            }}
          >
            {label(n)}
          </div>
        ) : null}
      </div>,
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: BOARD.x,
        top: BOARD.y,
        width: BOARD.size,
        height: BOARD.size,
        borderRadius: 14,
        overflow: 'visible',
        boxShadow: '0 20px 80px rgba(0,0,0,0.55)',
        outline: '3px solid #3a4150',
        opacity: dim,
      }}
    >
      {cells}
    </div>
  );
};

// =============================================================================
// COUNTER — exact running total 2^k - 1 (BigInt, so every digit is real).
// =============================================================================
const Counter: React.FC<{ fill: number; opacity: number }> = ({ fill, opacity }) => {
  const k = Math.floor(fill + 1e-6);
  const big = k >= 40;
  return (
    <div style={{ position: 'absolute', top: 400, left: 0, right: 0, textAlign: 'center', opacity }}>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28, letterSpacing: 6, color: 'rgba(255,255,255,0.6)' }}>
        GRAINS OF WHEAT
      </div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 700,
          fontSize: big ? 48 : 64,
          color: GOLD,
          marginTop: 6,
          textShadow: '0 4px 30px rgba(0,0,0,0.6)',
        }}
      >
        {commas(sumTo(k))}
      </div>
    </div>
  );
};

// =============================================================================
// THE DEAL card (setup)
// =============================================================================
const Deal: React.FC<{ t: number }> = ({ t }) => {
  const p = EOUT(prog(t, DEAL_IN, DEAL_IN + 0.4));
  const out = 1 - prog(t, POPS[0] - 0.4, POPS[0]);
  const o = p * out;
  if (o <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 300,
        left: 120,
        right: 160,
        opacity: o,
        transform: `translateY(${(1 - p) * 20}px)`,
        background: 'rgba(12,14,20,0.92)',
        border: `2px solid ${GOLD}66`,
        borderRadius: 24,
        padding: '26px 34px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 26, letterSpacing: 5, color: GOLD }}>THE REWARD</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, color: '#fff', marginTop: 10, lineHeight: 1.2 }}>
        1 grain on square 1.
        <br />
        Double it on every square.
      </div>
    </div>
  );
};

// =============================================================================
// TWIST 1 — the board vs the world's wheat harvest
// =============================================================================
const World: React.FC<{ t: number }> = ({ t }) => {
  const o = prog(t, WORLD_IN, WORLD_IN + 0.3) * (1 - prog(t, WORLD_OUT - 0.3, WORLD_OUT));
  if (o <= 0.01) return null;
  const bars = EOUT(prog(t, WORLD_BARS, WORLD_BARS + 0.6));
  const big = EOUT(prog(t, THOUSAND, THOUSAND + 0.35));
  const Bar = ({ name, w, color, at }: { name: string; w: number; color: string; at: number }) => (
    <div style={{ marginTop: 26 }}>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, color: 'rgba(255,255,255,0.85)' }}>{name}</div>
      <div style={{ marginTop: 10, height: 44, background: 'rgba(255,255,255,0.08)', borderRadius: 10 }}>
        <div style={{ width: `${Math.max(1, w * 100 * at)}%`, minWidth: at > 0 ? 8 : 0, height: '100%', background: color, borderRadius: 10 }} />
      </div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', top: 600, left: 120, right: 160, opacity: o }}>
      <div
        style={{
          background: 'rgba(12,14,20,0.94)',
          border: `2px solid ${GOLD}55`,
          borderRadius: 26,
          padding: '34px 38px 40px',
        }}
      >
        <Bar name="World wheat harvest, 1 year" w={0.001} color={TEAL} at={bars} />
        <Bar name="This chessboard" w={1} color={GOLD} at={bars} />
        <div
          style={{
            marginTop: 34,
            textAlign: 'center',
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 110,
            color: GOLD,
            opacity: big,
            transform: `scale(${0.85 + 0.15 * big})`,
            lineHeight: 1,
          }}
        >
          1,000+
        </div>
        <div style={{ textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 42, color: '#fff', opacity: big, marginTop: 8 }}>
          YEARS OF HARVESTS
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// TWIST 2 — square 64 vs squares 1..63
// =============================================================================
const Versus: React.FC<{ t: number }> = ({ t }) => {
  const out = 1 - prog(t, LAST_OUT - 0.3, LAST_OUT);
  const a = EOUT(prog(t, LAST_IN, LAST_IN + 0.35)) * out;
  const b = EOUT(prog(t, OTHERS_IN, OTHERS_IN + 0.35)) * out;
  if (a <= 0.01) return null;
  const Row = ({ name, value, color, o }: { name: string; value: string; color: string; o: number }) => (
    <div style={{ opacity: o, marginTop: 10, textAlign: 'center' }}>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 26, letterSpacing: 4, color }}>{name}</div>
      <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: '#fff' }}>{value}</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', top: 330, left: 60, right: 100 }}>
      <Row name="SQUARE 64 ALONE" value={SQ64} color={GOLD} o={a} />
      <Row name="SQUARES 1–63 COMBINED" value={SQ1_63} color={TEAL} o={b} />
    </div>
  );
};

// =============================================================================
// ROOT
// =============================================================================
export const Short13Chessboard: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const fill = fillAt(t);

  // hook/loop title: on at f0, fades during the rewind, returns for the loop
  const titleOp = t < LOOP_IN ? 1 - prog(t, HOOK_OUT, HOOK_OUT + 0.4) : prog(t, LOOP_IN, LOOP_DONE);
  // counter: hook, then from the first pop onward, hidden while the twist cards own the top
  const counterOp =
    t < REWIND_END
      ? 1 - prog(t, HOOK_OUT + 0.6, REWIND_END)
      : t < LAST_IN
        ? prog(t, POPS[0] - 0.1, POPS[0] + 0.2)
        : prog(t, LOOP_IN, LOOP_DONE);
  const boardDim = 1 - 0.8 * prog(t, WORLD_IN, WORLD_IN + 0.3) * (1 - prog(t, WORLD_OUT - 0.3, WORLD_OUT));
  const split = prog(t, OTHERS_IN, OTHERS_IN + 0.3) * (1 - prog(t, LAST_OUT - 0.3, LAST_OUT));

  return (
    <AbsoluteFill style={{ background: '#0f1216' }}>
      <ShortsBackdrop base="#0f1216" glow="#262b1c" />

      <Board t={t} fill={fill} dim={boardDim} split={split} />

      <div style={{ opacity: titleOp }}>
        <BigTitle lines={[{ text: '1 grain of wheat' }, { text: '63 doublings', color: GOLD }]} y={150} size={84} warm />
      </div>
      <Counter fill={fill} opacity={counterOp} />

      <Kicker text="the king's deal" at={F(3.9)} until={F(10.2)} color={GOLD} />
      <Kicker text="halfway" at={F(19.0)} until={F(24.6)} color={GOLD} />
      <Kicker text="the full board" at={F(24.7)} until={F(27.8)} color={GOLD} />
      <Kicker text="vs the whole world" at={F(27.9)} until={F(31.6)} color={TEAL} />
      <Kicker text="square 64" at={F(31.7)} until={F(36.2)} color={GOLD} />

      <Deal t={t} />
      <World t={t} />
      <Versus t={t} />

      <Stamp text="≈ 200 tonnes" at={F(TONNES)} until={F(24.6)} color={TEAL} x={540} y={920} size={70} rotate={-5} />
      <Stamp text="easy" at={F(EASY)} until={F(24.6)} color={GOLD} x={700} y={1080} size={64} rotate={6} />
      <Stamp text="by 1 grain" at={F(COMBINED)} until={F(LAST_OUT)} color={PINK} x={540} y={920} size={76} rotate={-6} />

      <Sequence from={F(PAUSE_FROM)} durationInFrames={F(PAUSE_SEC)}>
        <PauseCard title="PAUSE" subtitle="how much wheat?" durSec={PAUSE_SEC} accent={GOLD} y={920} />
      </Sequence>

      <Captions lines={VO} y={1440} accent={GOLD} />
      <ProgressBar color={GOLD} />
    </AbsoluteFill>
  );
};

export default Short13Chessboard;
