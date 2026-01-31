import "./legal.css";
import AdSense from "../../AdSense";

export default function Terms() {
  return (
    <div className="legal-page">
      <h1>Terms of Service</h1>

      {/* ✅ Ad after heading (safe placement) */}
      <AdSense slot="1234567896" />

      <p>
        By accessing or using this game, you agree to comply with these Terms of
        Service and all applicable laws and regulations.
      </p>

      <p>
        The game is provided on an “as is” basis without warranties of any kind.
        We do not guarantee uninterrupted or error-free operation.
      </p>

      <p>
        Users must not exploit bugs, use cheats, automate gameplay, or engage in
        abusive behavior toward other players.
      </p>

      <p>
        We reserve the right to suspend or terminate accounts that violate these
        terms or disrupt fair gameplay.
      </p>

      {/* ✅ Optional bottom ad */}
      <AdSense slot="1234567897" />
    </div>
  );
}
