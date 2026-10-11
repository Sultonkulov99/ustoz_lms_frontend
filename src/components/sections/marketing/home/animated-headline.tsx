"use client";

import { Fragment, type CSSProperties } from "react";


type Word = { text: string; accent?: boolean; breakAfter?: boolean };

// Sarlavha so'zlari.
// accent: asosiy rang va tagchiziq, breakAfter: shu so'zdan keyin yangi qator.
const WORDS: Word[] = [
  { text: "Bilim" },
  { text: "olish" },
  { text: "hech", accent: true, breakAfter: true },
  { text: "qachon", accent: true },
  { text: "kech" },
  { text: "emas." },
];

// Kirish animatsiyasi (millisekundlarda)
const START_DELAY_MS = 150; // boshlanishdan oldingi kutish
const LETTER_STEP_MS = 45; // harflar orasidagi kechikish
const ENTRANCE_MS = 700; // bitta harf kirish davomiyligi
const UNDERLINE_GAP_MS = 350; // oxirgi harfdan keyin chiziq chizilishigacha kutish

// Tinimsiz sakrash to'lqini
const HOP_STEP_MS = 55; // to'lqinda harflar orasidagi kechikish (kichik = tezroq)
const HOP_MS = 600; // bitta harf sakrashi davomiyligi
const PAUSE_MS = 1200; // to'lqin tugagach keyingisigacha to'xtash
const HOP_HEIGHT_EM = 0.28; // sakrash balandligi

const TOTAL_LETTERS = WORDS.reduce((sum, w) => sum + Array.from(w.text).length, 0);
const CYCLE_MS = (TOTAL_LETTERS - 1) * HOP_STEP_MS + HOP_MS + PAUSE_MS;
const HOP_END_PCT = ((HOP_MS / CYCLE_MS) * 100).toFixed(2);
const HOP_PEAK_PCT = ((HOP_MS / CYCLE_MS) * 100 * 0.4).toFixed(2);

// Sakrash to'lqini kirish animatsiyasi tugagach boshlanadi
const LOOP_START_MS =
  START_DELAY_MS + (TOTAL_LETTERS - 1) * LETTER_STEP_MS + ENTRANCE_MS + 200;

const css = `
  .hl-word {
    display: inline-block;
    white-space: nowrap;
  }

  /* Tashqi qatlam: harf pastdan sakrab kiradi (bir marta) */
  .hl-letter {
    display: inline-block;
    opacity: 0;
    transform: translateY(0.7em) rotate(6deg);
    animation: hl-letter-in ${ENTRANCE_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: var(--d);
  }

  @keyframes hl-letter-in {
    to {
      opacity: 1;
      transform: translateY(0) rotate(0deg);
    }
  }

  /* Ichki qatlam: harf tinimsiz sakraydi (to'lqin ko'rinishida) */
  .hl-hop {
    display: inline-block;
    animation: hl-hop ${CYCLE_MS}ms infinite;
    animation-delay: var(--h);
  }

  @keyframes hl-hop {
    0% {
      transform: translateY(0);
      animation-timing-function: ease-out;
    }
    ${HOP_PEAK_PCT}% {
      transform: translateY(-${HOP_HEIGHT_EM}em);
      animation-timing-function: ease-in;
    }
    ${HOP_END_PCT}% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(0);
    }
  }

  /* Tagchiziq chapdan o'ngga chiziladi (bir marta) */
  .hl-underline {
    padding-bottom: 2px;
    background-image: linear-gradient(currentColor, currentColor);
    background-repeat: no-repeat;
    background-position: 0 100%;
    background-size: 0% 4px;
    animation: hl-underline-in 0.5s ease-out forwards;
    animation-delay: var(--ud);
  }

  @keyframes hl-underline-in {
    to {
      background-size: 100% 4px;
    }
  }

  /* Tizimda "harakatni kamaytirish" yoqilgan bo'lsa, animatsiya yo'q */
  @media (prefers-reduced-motion: reduce) {
    .hl-letter {
      opacity: 1;
      transform: none;
      animation: none;
    }
    .hl-hop {
      animation: none;
    }
    .hl-underline {
      background-size: 100% 4px;
      animation: none;
    }
  }
`;

export function AnimatedHeadline({ className }: { className?: string }) {
  let letterIndex = 0;
  const label = WORDS.map((w) => w.text).join(" ");

  return (
    // Ekran o'qigichlar uchun butun jumla aria-label'da, alohida harflar yashirilgan
    <h1 aria-label={label} className={className}>
      {WORDS.map((word, wi) => {
        const letters = Array.from(word.text);
        const startIndex = letterIndex;
        letterIndex += letters.length;

        const lastLetterDelay = START_DELAY_MS + (letterIndex - 1) * LETTER_STEP_MS;
        const prevHasBreak = wi > 0 && WORDS[wi - 1].breakAfter;

        return (
          <Fragment key={word.text}>
            {wi > 0 && !prevHasBreak && " "}
            <span
              aria-hidden="true"
              className={word.accent ? "hl-word hl-underline text-primary" : "hl-word"}
              style={
                word.accent
                  ? ({ "--ud": `${lastLetterDelay + UNDERLINE_GAP_MS}ms` } as CSSProperties)
                  : undefined
              }
            >
              {letters.map((char, i) => {
                const idx = startIndex + i;
                return (
                  <span
                    key={i}
                    className="hl-letter"
                    style={
                      {
                        "--d": `${START_DELAY_MS + idx * LETTER_STEP_MS}ms`,
                      } as CSSProperties
                    }
                  >
                    <span
                      className="hl-hop"
                      style={
                        { "--h": `${LOOP_START_MS + idx * HOP_STEP_MS}ms` } as CSSProperties
                      }
                    >
                      {char}
                    </span>
                  </span>
                );
              })}
            </span>
            {word.breakAfter && <br />}
          </Fragment>
        );
      })}

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </h1>
  );
}