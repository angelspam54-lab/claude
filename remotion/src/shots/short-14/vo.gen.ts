// Phrase timings measured from the existing narration (shorts/short-14-locked-door/voice/voice.mp3)
// with ffmpeg silencedetect — NOT ElevenLabs word alignment (that would cost a new TTS call).
// Lines carry no `words`, so Captions estimates word times inside each short phrase.
import type { VoLine } from '../../lib/shorts';

export const VO: VoLine[] = [
  { text: 'On the night of October ninth,', start: 0.05, end: 1.62 },
  { text: 'Margaret Hale locked her front door at 10:42 p.m.', start: 2.49, end: 6.06 },
  { text: 'We know the time because her neighbor heard the deadbolt.', start: 7.18, end: 9.81 },
  { text: 'Every night, same sound,', start: 10.61, end: 12.09 },
  { text: 'same minute.', start: 12.36, end: 13.08 },
  { text: 'At 6 a.m.,', start: 14.42, end: 15.33 },
  { text: 'the door was still locked...', start: 15.78, end: 17.07 },
  { text: 'from the inside.', start: 17.98, end: 18.78 },
  { text: 'Her car was in the driveway.', start: 20.17, end: 21.53 },
  { text: 'Her phone was on the kitchen table.', start: 22.4, end: 24.09 },
  { text: 'And Margaret...', start: 25.14, end: 25.72 },
  { text: 'was gone.', start: 26.85, end: 27.42 },
  { text: 'Police would spend eleven years asking one question.', start: 28.75, end: 31.57 },
  { text: 'How do you leave a house...', start: 33.08, end: 34.28 },
  { text: 'without opening the door?', start: 35.49, end: 36.62 },
];
