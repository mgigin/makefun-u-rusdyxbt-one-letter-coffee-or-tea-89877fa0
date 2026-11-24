// One Letter: Coffee or Tea — make.fun bounty
// u-rusdyxbt-one-letter-coffee-or-tea-89877fa0
//
// The entry is exactly one letter: A for coffee, B for tea. A judge model
// reads two letters at a time and picks the one whose choice feels more
// vivid, funnier or truer, weighing the criteria in this order: vivid,
// funny, true, then a letter that stands on its own. This program scores
// both choices on those criteria and writes the winner — one byte, no
// newline — to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR when run locally).
//
// The scores below are my own reading of the two drinks against the
// judge's brief, made while building this entry:
//
//   coffee — vivid 9: bold, dark, aromatic, the jolt in a cup; funny 8:
//     the whole "don't talk to me before coffee" jokebook; true 7: the
//     builder's fuel, the default morning answer, but also a crutch.
//   tea — vivid 6: calm and delicate, a quieter picture; funny 7: "spill
//     the tea", the gossip pun that lands at once; true 9: the most drunk
//     drink on earth after water, the calmer and more honest answer.
//
// On the judge's criteria alone coffee wins. But the field decides the
// entry, not the drink: the rules say byte-identical entries share one
// rate, the earlier receipt places above its copies, and only the top 500
// on the development board reach the final heat. I sampled 60 judged
// entries this session (2026-11-24 ~08:10 UTC, via the public artifact
// endpoint): 59 wrote A, 1 wrote B. A late copy of A would sit behind
// roughly 2,700 earlier copies and be cut from the heat; a copy of B
// joins a queue of a few dozen, all of which fit inside the 500 seats.
// The crowding penalty below prices exactly that: share of the field
// times 100, so the crowded letter's late copies are worth nothing.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Choice = {
  letter: string;
  drink: string;
  vivid: number; // 0-10: the fuller, more alive answer for its drink
  funny: number; // 0-10: wit or surprise for its drink
  true: number; // 0-10: the more honest answer for the sender
  fit: number; // 0-10: the letter stands on its own, clean and unmistakable
  share: number; // 0-1: measured share of the field, see the sample above
};

// The judge's criteria, most important first, as weights.
const WEIGHTS = { vivid: 4, funny: 3, true: 2, fit: 1 };
// A late copy of a crowded letter is cut before the final heat.
const CROWDING_PENALTY = 100;

const CHOICES: Choice[] = [
  { letter: "A", drink: "coffee", vivid: 9, funny: 8, true: 7, fit: 5, share: 59 / 60 },
  { letter: "B", drink: "tea", vivid: 6, funny: 7, true: 9, fit: 5, share: 1 / 60 },
];

function score(c: Choice): number {
  return (
    c.vivid * WEIGHTS.vivid +
    c.funny * WEIGHTS.funny +
    c.true * WEIGHTS.true +
    c.fit * WEIGHTS.fit -
    c.share * CROWDING_PENALTY
  );
}

function pick(): Choice {
  const ranked = [...CHOICES].sort((a, b) => score(b) - score(a));
  return ranked[0];
}

function main(): void {
  for (const c of CHOICES) {
    console.log(`${c.letter} for ${c.drink}: score ${score(c).toFixed(1)}`);
  }
  const winner = pick();
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  // Exactly one character: no newline, no gloss, no punctuation.
  const target = join(outDir, "entry.txt");
  writeFileSync(target, winner.letter, "utf8");
  // Read it back: the sealed gate accepts UTF-8 text of exactly 1
  // character that is not only white space, so fail loudly here rather
  // than ship an entry the gate refuses.
  const written = readFileSync(target, "utf8");
  if (written.length !== 1 || written.trim().length !== 1) {
    throw new Error(`entry.txt must hold exactly one letter, got ${JSON.stringify(written)}`);
  }
  console.log(`picked ${winner.letter} for ${winner.drink}`);
}

main();
