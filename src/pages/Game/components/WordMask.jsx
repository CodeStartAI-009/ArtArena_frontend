 // frontend/src/pages/Game/components/WordMask.jsx

export default function WordMask({
  wordLength = 0,
  revealedLetters = [], // [{ index, letter }]
  revealAll = false,
  word = "", // full word, only used when revealAll = true
}) {
  if (!wordLength) return null;

  /* =========================
     NORMALIZE REVEALED LETTERS
  ========================== */
  const revealedMap = new Map();
  for (const item of revealedLetters) {
    if (
      typeof item?.index === "number" &&
      typeof item?.letter === "string"
    ) {
      revealedMap.set(item.index, item.letter);
    }
  }

  return (
    <div className="word-mask">
      {Array.from({ length: wordLength }).map((_, index) => {
        const isSpace =
          revealAll && word && word[index] === " ";

        /* ---------- SHOULD REVEAL ---------- */
        const shouldReveal =
          revealAll || revealedMap.has(index) || isSpace;

        /* ---------- CHARACTER ---------- */
        let displayChar = "_";

        if (shouldReveal) {
          if (revealAll && word?.[index]) {
            displayChar = word[index].toUpperCase();
          } else if (revealedMap.has(index)) {
            displayChar = revealedMap
              .get(index)
              .toUpperCase();
          } else if (isSpace) {
            displayChar = " ";
          }
        }

        return (
          <span
            key={index}
            className={`word-letter ${
              shouldReveal ? "revealed" : ""
            } ${displayChar === " " ? "space" : ""}`}
          >
            {displayChar}
          </span>
        );
      })}
    </div>
  );
}
