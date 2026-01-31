import "./legal.css";
import AdSense from "../../AdSense";

export default function Features() {
  return (
    <div className="legal-page">
      <h1>Features</h1>

      {/* ✅ Ad after main heading */}
      <AdSense slot="1234567892" />

      <p>
        Our game is a real-time multiplayer drawing and guessing experience
        designed for fast, fun, and fair gameplay across devices.
      </p>

      <ul>
        <li>Real-time multiplayer drawing and guessing</li>
        <li>Instant public matchmaking</li>
        <li>Private rooms to play with friends</li>
        <li>Level system with XP, coins, and rewards</li>
        <li>Guest play with optional account creation</li>
        <li>Optimized for desktop and mobile browsers</li>
      </ul>

      {/* ✅ Optional bottom ad */}
      <AdSense slot="1234567893" />
    </div>
  );
}
