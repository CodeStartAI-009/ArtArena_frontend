export default function WordMask({
  wordLength = 0,
  revealedLetters = [], // [{ index, letter }]
  revealAll = false,
  word = "", // optional, used only for revealAll
}) {
  if (!wordLength) return null;

  return (
    <div className="word-mask">
      {Array.from({ length: wordLength }).map((_, index) => {
        const revealed = revealedLetters.find(
          (l) => l.index === index
        );

        const shouldReveal = revealAll || Boolean(revealed);

        let displayChar = "_";

        if (shouldReveal) {
          if (revealAll && word[index]) {
            displayChar = word[index].toUpperCase();
          } else if (revealed?.letter) {
            displayChar = revealed.letter.toUpperCase();
          }
        }

        return (
          <span
            key={index}
            className={`word-letter ${
              shouldReveal ? "revealed" : ""
            }`}
          >
            {displayChar}
          </span>
        );
      })}
    </div>
  );
}
