 // src/pages/Home/themes.js

/* PAGE / BACKGROUND IMAGES */
import classic from "../../assets/themes/classic.jpeg";
import forest from "../../assets/themes/forest.jpeg";
import desert from "../../assets/themes/desert.png";
import space from "../../assets/themes/space.jpeg";
import ice from "../../assets/themes/ice.jpeg";
import candy from "../../assets/themes/candy.png";
import volcano from "../../assets/themes/lava.jpeg";

/* BOARD / CANVAS IMAGES */
import classicBoard from "../../assets/themes/classicboard.jpeg";
import forestBoard from "../../assets/themes/forestboard.jpeg";
import desertBoard from "../../assets/themes/dessertboard.jpeg"; // ✅ fixed name
import spaceBoard from "../../assets/themes/spaceboard.jpeg";
import iceBoard from "../../assets/themes/iceboard.jpeg";
import candyBoard from "../../assets/themes/candyboard.jpeg";
import volcanoBoard from "../../assets/themes/lavaboard.jpeg";

const themes = [
  {
    id: "random",
    name: "Random",
    image: classic,        // default (actual random pick happens elsewhere)
    board: classicBoard,
  },
  {
    id: "classic",
    name: "Classic",
    image: classic,
    board: classicBoard,
  },
  {
    id: "forest",
    name: "Forest",
    image: forest,
    board: forestBoard,
  },
  {
    id: "desert",
    name: "Desert",
    image: desert,
    board: desertBoard,
  },
  {
    id: "space",
    name: "Space",
    image: space,
    board: spaceBoard,
  },
  {
    id: "ice",
    name: "Ice",
    image: ice,
    board: iceBoard,
  },
  {
    id: "candy",
    name: "Candy",
    image: candy,
    board: candyBoard,
  },
  {
    id: "volcano",
    name: "Volcano",
    image: volcano,
    board: volcanoBoard,
  },
];

export default themes;
