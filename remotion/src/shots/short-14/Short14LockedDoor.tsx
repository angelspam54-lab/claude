import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { Car, Smartphone, UserRound } from 'lucide-react';
import { BigTitle, Captions, Kicker, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short14LockedDoor',
  durationInSeconds: 38,
  fps: 30,
  width: 1080,
  height: 1920,
};

// True-crime palette: cold night navy, evidence-tape red, old-paper amber.
const RED = '#e05a5a';
const AMBER = '#e8c879';
const PAPER = '#efe6d2';
const INK = '#0c0f15';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const EOUT = Easing.bezier(0.33, 1, 0.68, 1);
const F = (s: number) => Math.round(s * 30);

// =============================================================================
// CUES — global seconds. Phrase edges measured from the narration with silencedetect;
// words inside a phrase are length-weighted estimates (same estimate the captions use).
// =============================================================================
const HOOK_OUT = 1.7; // title leaves after "On the night of October ninth,"
const UNLOCK = 1.85; // the bolt rewinds open — we go back to the night before
const LOCK = 3.53; // "locked"
const TIME_PM = 5.4; // "10:42 p.m."
const NEIGHBOR = 8.54; // "neighbor"
const BOLT_HEARD = 9.41; // "deadbolt" — sound ripples off the bolt
const NIGHTS_IN = 10.5; // "Every night, same sound, same minute."
const NIGHTS_OUT = 13.8;
const TIME_AM = 14.45; // "At 6 a.m.,"
const STILL_LOCKED = 16.73; // "locked..." — the bolt turns red
const INSIDE = 17.98; // "from the inside."
const EVID_IN = 19.9;
const CAR_IN = 20.17; // "Her car..."
const PHONE_IN = 22.4; // "Her phone..."
const EVID_OUT = 24.5;
const MISS_IN = 24.8; // "And Margaret..."
const GONE = 26.85; // "was gone."
const MISS_OUT = 28.3;
const YEARS_IN = 28.5; // "Police would spend eleven years..."
const ELEVEN = 29.77; // "eleven"
const QUESTION = 30.9; // "...one question."
const YEARS_OUT = 32.6;
const LOOP_IN = 35.3; // "without opening the door?" — the hook frame rebuilds
const LOOP_DONE = 36.6;

// One envelope for every overlay panel: in over 0.35s, out over 0.35s.
const env = (t: number, a: number, b: number) => prog(t, a, a + 0.35) * (1 - prog(t, b - 0.35, b));

// Bolt throw: 1 = locked (bolt in the frame), 0 = open.
const boltAt = (t: number) => {
  if (t < UNLOCK) return 1;
  if (t < LOCK) return 1 - EASE(prog(t, UNLOCK, UNLOCK + 0.5));
  return EOUT(prog(t, LOCK, LOCK + 0.14));
};
// The bolt reads red whenever it is "the locked-from-inside" bolt: hook, and from 'still locked' on.
const boltRed = (t: number) => (t < UNLOCK ? 1 : prog(t, STILL_LOCKED, STILL_LOCKED + 0.3));

// =============================================================================
// THE DOOR — the persistent canvas. Wall + frame + door, deadbolt that slides into the frame.
// =============================================================================
const DOOR = { x: 240, y: 570, w: 600, h: 700 };

const Door: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const b = boltAt(t);
  const red = boltRed(t);
  const boltColor = red > 0.5 ? RED : AMBER;
  const glow = 0.35 + 0.65 * red;
  // sound ripples on "deadbolt", and a fainter repeat on each "same sound" night
  const ripples = [BOLT_HEARD, BOLT_HEARD + 0.25, BOLT_HEARD + 0.5].map((s) => prog(t, s, s + 1.1));
  const scale = 1 - 0.06 * (1 - dim);
  return (
    <div
      style={{
        position: 'absolute',
        left: DOOR.x,
        top: DOOR.y,
        width: DOOR.w,
        height: DOOR.h,
        opacity: 0.12 + 0.88 * dim,
        transform: `scale(${scale})`,
      }}
    >
      <svg width={DOOR.w} height={DOOR.h} viewBox={`0 0 ${DOOR.w} ${DOOR.h}`}>
        <defs>
          <linearGradient id="doorWood" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2b3242" />
            <stop offset="1" stopColor="#1b202c" />
          </linearGradient>
          <radialGradient id="boltGlow">
            <stop offset="0" stopColor={boltColor} stopOpacity={0.55 * glow} />
            <stop offset="1" stopColor={boltColor} stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* floor line */}
        <rect x={0} y={DOOR.h - 6} width={DOOR.w} height={6} fill="#252b38" />
        {/* frame */}
        <rect x={110} y={20} width={380} height={DOOR.h - 26} rx={6} fill="#151a24" stroke="#3a4254" strokeWidth={4} />
        {/* door slab */}
        <rect x={132} y={40} width={336} height={DOOR.h - 46} rx={4} fill="url(#doorWood)" stroke="#424b5f" strokeWidth={2} />
        {/* panels */}
        <rect x={168} y={84} width={264} height={210} rx={6} fill="none" stroke="#3a4254" strokeWidth={3} />
        <rect x={168} y={344} width={264} height={290} rx={6} fill="none" stroke="#3a4254" strokeWidth={3} />
        {/* peephole */}
        <circle cx={300} cy={150} r={9} fill="#0b0e14" stroke="#4a5368" strokeWidth={3} />
        {/* bolt glow + ripples */}
        <circle cx={430} cy={300} r={120} fill="url(#boltGlow)" />
        {ripples.map((r, i) =>
          r > 0 && r < 1 ? (
            <circle key={i} cx={430} cy={300} r={30 + 220 * EOUT(r)} fill="none" stroke={AMBER} strokeWidth={4} opacity={(1 - r) * 0.8} />
          ) : null,
        )}
        {/* bolt (slides right, into the frame, when thrown) */}
        <rect x={418 + 52 * b} y={290} width={52} height={20} rx={4} fill={boltColor} />
        {/* deadbolt housing + thumb plate */}
        <rect x={398} y={268} width={50} height={64} rx={10} fill="#3a4254" stroke={boltColor} strokeWidth={3} />
        <rect
          x={418}
          y={278}
          width={10}
          height={44}
          rx={4}
          fill={boltColor}
          transform={`rotate(${90 * b} 423 300)`}
        />
        {/* knob */}
        <circle cx={423} cy={400} r={20} fill="#4a5368" stroke="#5d6780" strokeWidth={3} />
      </svg>
    </div>
  );
};

// =============================================================================
// CLOCK — digital readout above the door: 6:00 AM (hook), 10:42 PM, then 6:00 AM again.
// =============================================================================
const Clock: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  let text = '6:00 AM';
  let a = 1;
  if (t >= HOOK_OUT && t < TIME_PM) a = 1 - prog(t, HOOK_OUT, HOOK_OUT + 0.3);
  else if (t >= TIME_PM && t < TIME_AM) {
    text = '10:42 PM';
    a = prog(t, TIME_PM, TIME_PM + 0.2);
  } else if (t >= TIME_AM) a = prog(t, TIME_AM, TIME_AM + 0.2);
  // a quick flicker on each change, like an LED re-latching
  const flick = t >= TIME_AM && t < TIME_AM + 0.25 ? (Math.floor(t * 30) % 2 ? 0.4 : 1) : 1;
  const color = text === '6:00 AM' ? RED : AMBER;
  return (
    <div
      style={{
        position: 'absolute',
        top: 470,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity: a * o * flick,
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: 76,
        letterSpacing: 4,
        color,
        textShadow: `0 0 28px ${color}88`,
      }}
    >
      {text}
    </div>
  );
};

// =============================================================================
// PANELS
// =============================================================================
const NIGHTS = ['OCT 5', 'OCT 6', 'OCT 7', 'OCT 8', 'OCT 9'];
const Nights: React.FC<{ t: number }> = ({ t }) => {
  const o = env(t, NIGHTS_IN, NIGHTS_OUT);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', top: 740, left: 120, right: 120, display: 'flex', gap: 14, opacity: o }}>
      {NIGHTS.map((d, i) => {
        const p = EOUT(prog(t, NIGHTS_IN + 0.15 + i * 0.42, NIGHTS_IN + 0.45 + i * 0.42));
        const last = i === NIGHTS.length - 1;
        return (
          <div
            key={d}
            style={{
              flex: 1,
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px)`,
              background: 'rgba(20,24,33,0.92)',
              border: `2px solid ${last ? AMBER : '#3a4254'}`,
              borderRadius: 14,
              padding: '22px 0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 24, letterSpacing: 3, color: '#8d96aa' }}>{d}</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: AMBER, marginTop: 10 }}>10:42</div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 20, color: '#8d96aa', marginTop: 6 }}>CLICK</div>
          </div>
        );
      })}
    </div>
  );
};

const Exhibit: React.FC<{ t: number; at: number; tag: string; title: string; detail: string; icon: React.ReactNode; y: number }> = ({
  t,
  at,
  tag,
  title,
  detail,
  icon,
  y,
}) => {
  const p = EOUT(prog(t, at, at + 0.35));
  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        width: 780,
        top: y,
        opacity: p,
        transform: `translateX(${(1 - p) * -60}px) rotate(${-1.5 + 3 * (tag.endsWith('B') ? 1 : 0)}deg)`,
        background: PAPER,
        borderRadius: 10,
        padding: '30px 36px',
        display: 'flex',
        alignItems: 'center',
        gap: 34,
        boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: 12,
          background: INK,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 24, letterSpacing: 5, color: RED }}>{tag}</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: INK, lineHeight: 1.05, marginTop: 6 }}>{title}</div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 30, color: '#4a4436', marginTop: 6 }}>{detail}</div>
      </div>
    </div>
  );
};

const Evidence: React.FC<{ t: number }> = ({ t }) => {
  const o = env(t, EVID_IN, EVID_OUT);
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <Exhibit t={t} at={CAR_IN} tag="EXHIBIT A" title="HER CAR" detail="Still in the driveway" icon={<Car size={84} color={AMBER} strokeWidth={1.6} />} y={620} />
      <Exhibit
        t={t}
        at={PHONE_IN}
        tag="EXHIBIT B"
        title="HER PHONE"
        detail="On the kitchen table"
        icon={<Smartphone size={84} color={AMBER} strokeWidth={1.6} />}
        y={910}
      />
    </div>
  );
};

const Missing: React.FC<{ t: number }> = ({ t }) => {
  const o = env(t, MISS_IN, MISS_OUT);
  if (o <= 0.01) return null;
  const p = EOUT(prog(t, MISS_IN, MISS_IN + 0.4));
  // the silhouette fades as she is "gone"
  const fade = 1 - 0.75 * prog(t, GONE, GONE + 0.6);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <div
        style={{
          position: 'absolute',
          left: 290,
          top: 560,
          width: 500,
          padding: '28px 28px 36px',
          background: PAPER,
          borderRadius: 6,
          transform: `rotate(${-3 + 1.5 * p}deg) translateY(${(1 - p) * 40}px)`,
          boxShadow: '0 22px 60px rgba(0,0,0,0.55)',
        }}
      >
        <div
          style={{
            height: 470,
            background: 'linear-gradient(180deg, #2a3040, #171b25)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div style={{ opacity: fade, marginBottom: -40 }}>
            <UserRound size={420} color="#0b0e14" fill="#0b0e14" strokeWidth={1} />
          </div>
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: INK, textAlign: 'center', marginTop: 22 }}>
          MARGARET HALE
        </div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 26, color: '#5a5444', textAlign: 'center', marginTop: 4 }}>
          last heard: 10:42 PM
        </div>
      </div>
      <Stamp text="missing" at={F(GONE)} until={F(MISS_OUT)} color={RED} x={540} y={830} size={104} rotate={-9} />
    </div>
  );
};

const Years: React.FC<{ t: number }> = ({ t }) => {
  const o = env(t, YEARS_IN, YEARS_OUT);
  if (o <= 0.01) return null;
  const n = Math.round(11 * EASE(prog(t, YEARS_IN + 0.5, ELEVEN)));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <div style={{ position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 300, color: PAPER, lineHeight: 1 }}>{n}</div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, letterSpacing: 14, color: '#8d96aa', marginTop: 10 }}>
          YEARS
        </div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 32, color: AMBER, marginTop: 70, opacity: prog(t, QUESTION - 0.6, QUESTION) }}>
          one question
        </div>
      </div>
      <Stamp text="unsolved" at={F(QUESTION)} until={F(YEARS_OUT)} color={RED} x={540} y={1190} size={96} rotate={-7} />
    </div>
  );
};

// =============================================================================
// ROOT
// =============================================================================
export const Short14LockedDoor: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  // the door owns the screen except while a panel is up
  const panel = Math.max(
    env(t, NIGHTS_IN, NIGHTS_OUT),
    env(t, EVID_IN, EVID_OUT),
    env(t, MISS_IN, MISS_OUT),
    env(t, YEARS_IN, YEARS_OUT),
  );
  const doorDim = 1 - panel;

  // hook/loop title: composed at f0, leaves after the first line, rebuilds on the last line
  const titleOp = t < LOOP_IN ? 1 - prog(t, HOOK_OUT, HOOK_OUT + 0.35) : prog(t, LOOP_IN, LOOP_DONE);

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2232" />

      <Door t={t} dim={doorDim} />
      <Clock t={t} o={doorDim} />

      <div style={{ opacity: titleOp }}>
        <BigTitle lines={[{ text: 'Locked from' }, { text: 'the inside.' }, { text: 'She was gone.', color: RED }]} y={140} size={80} warm />
      </div>

      <Kicker text="october 9" at={F(HOOK_OUT + 0.1)} until={F(NIGHTS_IN)} color={AMBER} />
      <Kicker text="every night" at={F(NIGHTS_IN)} until={F(NIGHTS_OUT)} color={AMBER} />
      <Kicker text="the next morning" at={F(TIME_AM - 0.3)} until={F(EVID_IN)} color={RED} />
      <Kicker text="what she left behind" at={F(EVID_IN)} until={F(EVID_OUT)} color={AMBER} />
      <Kicker text="the case" at={F(YEARS_IN)} until={F(YEARS_OUT)} color={AMBER} />
      <Kicker text="the question" at={F(YEARS_OUT)} until={F(LOOP_IN)} color={RED} />

      {/* neighbor note, beside the bolt it heard */}
      <div
        style={{
          position: 'absolute',
          top: 1160,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: env(t, NEIGHBOR, NIGHTS_IN) * doorDim,
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 32,
          color: AMBER,
        }}
      >
        neighbor: “I heard the bolt.”
      </div>

      <Stamp text="from the inside" at={F(INSIDE)} until={F(EVID_IN)} color={RED} x={540} y={860} size={78} rotate={-6} />

      <Nights t={t} />
      <Evidence t={t} />
      <Missing t={t} />
      <Years t={t} />

      {/* honesty tag: the case is invented for this short */}
      <div
        style={{
          position: 'absolute',
          top: 1290,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize: 22,
          letterSpacing: 4,
          color: '#5d6578',
        }}
      >
        DRAMATIZATION · FICTIONAL CASE
      </div>

      <Captions lines={VO} y={1440} accent={RED} />
      <ProgressBar color={RED} />
    </AbsoluteFill>
  );
};

export default Short14LockedDoor;
