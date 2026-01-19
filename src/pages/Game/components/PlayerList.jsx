// frontend/src/game/components/PlayerList.jsx

import useGameStore from "../store/store";

export default function PlayerList({ players }) {
  const { game } = useGameStore();

  const list = players ?? game?.players ?? [];

  if (!list.length) {
    return <div className="player-list">Waiting for players…</div>;
  }

  return (
    <div className="player-list">
      {list.map((player) => {
        const isDrawer = game?.drawerId === player.id;
        const guessedCorrectly = player.guessedCorrectly === true;
        const isDisconnected = player.connected === false;

        return (
          <div
            key={player.id}
            className={`player-card
              ${isDrawer ? "drawer" : ""}
              ${guessedCorrectly ? "correct" : ""}
              ${isDisconnected ? "disconnected" : ""}
            `}
          >
            <div className="player-left">
              <span className="player-name">
                {player.username}
                {isDrawer && <span className="crown"> 👑</span>}
              </span>

              {guessedCorrectly && (
                <span className="correct-badge">✔</span>
              )}
            </div>

            <span className="player-score">
              {Number(player.score) || 0}
            </span>
          </div>
        );
      })}
    </div>
  );
}
