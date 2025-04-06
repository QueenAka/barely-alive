// Key controller
const url = window.location.href;
let keys = {};

window.addEventListener("keydown", function (e) {
  e.preventDefault();
  keys[e.key] = true;
});

window.addEventListener("keyup", function (e) {
  delete keys[e.key];
});

// SAFE
class Inventory {
  constructor() {
    this.inv = [
      { id: "flower", amount: 99 },
      { id: "flower", amount: 7 },
      { id: "stick", amount: 99 },
      { id: "apple", amount: 99 },
      { id: "wood", amount: 99 },
      { id: "planks", amount: 99 },
      { id: null, amount: null },
      { id: null, amount: null },
      { id: null, amount: null },
    ];
    this.slots = document.querySelectorAll(".slot");
    this.slots.forEach((slot) => {
      slot.addEventListener("click", () => {
        this.select(slot.id.split("-")[1]);
      });
    });
    document.addEventListener("keydown", (e) => {
      const key = e.key;
      if (key * 1 == key && key != 0) {
        this.select(key);
      }
    });
    return new Promise((resolve) => {
      fetch("./js/data.json")
        .then((res) => res.json())
        .then((data) => {
          this.data = data;
          resolve(this);
        });
    });
  }
  select(num) {
    const slot = document.getElementById(`slot-${num}`);
    this.slots.forEach((s) => {
      s.classList.remove("selected");
    });
    slot.classList.add("selected");
  }
  setItem(item, num) {
    this.inv[num - 1].id = item.id;
    this.inv[num - 1].amount = item.amount;
    this.update();
  }
  update() {
    const slots = this.slots;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      slot.innerHTML = "";
      const item = this.inv[i];
      if (!item.id) return;
      const itemData = this.data.items[item.id];
      const itemDiv = document.createElement("div");
      itemDiv.innerHTML = `<img src="${itemData.image}" /><span>${
        item.amount > 0 ? `x${item.amount}` : ""
      }</span>`;
      itemDiv.classList.add("item");
      slot.appendChild(itemDiv);
    }
  }
}

class Game {
  constructor() {
    return new Promise((resolve) => {
      const inv = new Inventory();
      inv.then((invInst) => {
        this.inventory = invInst;
        this.day = 1;
        this.score = 0;
        this.health = 100;
        this.map = document.getElementById("map");
        this.data = invInst.data;
        resolve(this);
      });
    });
  }

  async start(player, x, y = x, width = (x * 50) / 2, height = (y * 50) / 2) {
    document.getElementById(
      "htmlIcon"
    ).href = `./media/misc/${player}/icon.png`;
    new Promise(async (resolve) => {
      this.mapx = x;
      this.mapy = y;
      this.inventory.update();
      this.map.style.width = `${x * 50}px`;
      this.map.style.height = `${y * 50}px`;
      this.map.style.overflow = "hidden";
      document.body.style.width = `${x * 50}px`;
      document.body.style.height = `${y * 50}px`;
      this.map.innerHTML = "";
      await this.drawMap(x, y);
      await this.player(player, width, height);
      resolve();
    });
  }

  track(player) {
    function center() {
      player.scrollIntoView({
        block: "center",
        inline: "center",
        behavior: "smooth",
      });
      requestAnimationFrame(center);
    }
    center();
  }

  async player(player, width, height) {
    const entity = this.data.entities.player[player];
    const playerElm = document.createElement("img");
    playerElm.classList.add("entity");
    playerElm.classList.add("layers");
    playerElm.style.left = `${width}px`;
    playerElm.style.top = `${height}px`;
    playerElm.style.width = `${entity.size}px`;
    playerElm.id = `player`;
    this.playerSprites = [];
    await this.prefetch(entity);
    playerElm.src = this.playerSprites[1];
    this.map.appendChild(playerElm);
    this.track(playerElm);
    this.movement(playerElm, player);
  }

  // TODO: Remake!!
  async drawMap(x, y) {
    this.map.style.width = x * 50 + "px";
    this.map.style.height = y * 50 + "px";
    for (let i = 0; i < y; i++) {
      let layer = "";
      for (let j = 0; j < x; j++) {
        // Grass
        const div = document.createElement("img");
        div.src = this.data.tiles.grass.image;
        div.classList.add("tile");
        div.style.left = `${i * 50}px`;
        div.style.top = `${j * 50}px`;
        div.style.width = `${this.vars(this.data.tiles.grass.size)}px`;
        this.map.appendChild(div);
      }
    }
    for (let i = 0; i < y; i++) {
      let layer = "";
      for (let j = 0; j < x; j++) {
        const tile = Math.floor(Math.random() * 100);
        if (tile <= 75 && tile > 50) {
          // Flowers
          const div = document.createElement("img");
          div.src =
            this.data.tiles.flower.image[
              Math.floor(Math.random() * this.data.tiles.flower.image.length)
            ];
          div.classList.add("tile");
          div.classList.add("breakable");
          div.classList.add("layers");
          const offsetX = this.vars(this.data.tiles.flower.offsetX) * 1;
          const offsetY = this.vars(this.data.tiles.flower.offsetY) * 1;
          div.style.left = `${i * 50 + offsetX}px`;
          div.style.top = `${j * 50 + offsetY}px`;
          div.style.width = `${this.vars(this.data.tiles.flower.size)}px`;
          this.map.appendChild(div);
        } else if (tile <= 100 && tile > 75) {
          // Trees
          const div = document.createElement("img");
          div.src =
            this.data.tiles.tree.image[
              Math.floor(Math.random() * this.data.tiles.tree.image.length)
            ];
          div.classList.add("tile");
          div.classList.add("breakable");
          div.classList.add("layers");
          const offsetX = this.vars(this.data.tiles.tree.offsetX) * 1;
          const offsetY = this.vars(this.data.tiles.tree.offsetY) * 1;
          div.style.left = `${i * 50 + offsetX}px`;
          div.style.top = `${j * 50 + offsetY}px`;
          div.style.width = `${this.vars(this.data.tiles.tree.size)}px`;
          this.map.appendChild(div);
        }
      }
    }
  }

  async prefetch(entity) {
    function uri(blob) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    }
    await fetch(entity.image + "up.png")
      .then((res) => res.blob())
      .then(async (blob) => this.playerSprites.push(await uri(blob)));
    await fetch(entity.image + "down.png")
      .then((res) => res.blob())
      .then(async (blob) => this.playerSprites.push(await uri(blob)));
    await fetch(entity.image + "left.png")
      .then((res) => res.blob())
      .then(async (blob) => this.playerSprites.push(await uri(blob)));
    await fetch(entity.image + "right.png")
      .then((res) => res.blob())
      .then(async (blob) => this.playerSprites.push(await uri(blob)));
  }

  movement(playerElm, player) {
    const speed = this.data.entities.player[player].speed;
    this.frame = this.playerSprites[1];
    function movement(x) {
      let direction;
      if (keys.ArrowUp || keys.w) direction = "up";
      if (keys.ArrowDown || keys.s) direction = "down";
      if (keys.ArrowLeft || keys.a) direction = "left";
      if (keys.ArrowRight || keys.d) direction = "right";
      const directions = ["up", "down", "left", "right"];
      if (direction) {
        const frame = x.playerSprites[directions.indexOf(direction)];
        if (frame != x.frame) {
          playerElm.src = frame;
          x.frame = frame;
        }
        if (direction == "up" || direction == "down") {
          playerElm.style.top = `${
            parseInt(playerElm.style.top) + (direction == "up" ? -1 : 1) * speed
          }px`;
        } else {
          playerElm.style.left = `${
            parseInt(playerElm.style.left) +
            (direction == "left" ? -1 : 1) * speed
          }px`;
        }
        playerElm.setAttribute("relY", parseInt(playerElm.style.top) / 50);
      }

      requestAnimationFrame(() => movement(x));
    }

    requestAnimationFrame(() => movement(this));
  }

  vars(str) {
    let editedStr = str;
    const varRegex = /\{(.*?)\}/g;
    if (!varRegex.test(str)) return str;
    const matches = str.match(varRegex);
    if (!matches) return str;
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const varName = match.replace(/[{}]/g, "");
      let ret = "";
      if (varName.startsWith("random(")) {
        const args = varName.replace("random(", "").replace(")", "").split(",");
        const min = parseInt(args[0].trim());
        const max = parseInt(args[1].trim());
        ret = Math.floor(Math.random() * (max - min + 1)) + min;
      } else if (varName == "x" || varName == "y") {
        ret = this.player.position[varName];
      } else if (varName == "day") {
        ret = this.day;
      } else if (varName == "score") {
        ret = this.score;
      }
      editedStr = editedStr.replace(match, ret);
    }
    return editedStr;
  }

  layerHandler(type = ".layers") {
    document.querySelectorAll(type).forEach((elm) => {
      const rect = elm.getBoundingClientRect();
      elm.style.zIndex = Math.floor(rect.top + window.scrollY);
    });
  }
}

class Entities {
  constructor(data, game, max = 100, dif = 2) {
    this.entities = [];
    this.maxEntities = max;
    this.difficulty = dif;
    this.game = game;
    this.data = data;
  }
  spawn(e, x = 0, y = 0) {
    const entity = this.data.entities[e];
    if (!entity) throw new Error("Entity not found");
    if (this.game.mx < x || this.game.my < y)
      throw new Error("Entity out of bounds");
    const div = document.createElement("img");
    div.src = `${entity.image}/down.png`;
    div.classList.add("entity");
    div.style.left = `${x * 50}px`;
    div.style.top = `${y * 50}px`;
    div.style.width = `${entity.size}px`;
    div.id = `@${e}:${this.game.vars("random(0, 999999)")}`;
    this.game.map.appendChild(div);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const menu = document.createElement("iframe");
  menu.src = "./html/menus/start.html";
  menu.id = "startMenu";
  document.body.appendChild(menu);
});

function play() {
  transition("startMenu", () => {
    const menu = document.createElement("iframe");
    menu.src = "./html/menus/player.html";
    menu.id = "playerMenu";
    document.body.appendChild(menu);
  });
}

function selectPlayer(player) {
  transition("playerMenu", () => {
    new Promise(async (res) => {
      const gameInst = new Game();
      gameInst.then(async (game) => {
        game.start(player, 50, 50).then(() => {
          const ents = new Entities(game.data, game);
          audio("./media/audio/map/day.mp3", 25, true);
          res();
          game.layerHandler();
        });
      });
    });
  });
}

async function transition(from, run) {
  const fromDiv = document.getElementById(from);
  fromDiv.remove();
  run();
}

function audio(src, volume = 100, loop = false) {
  const aud = new Audio(src);
  aud.volume = volume / 100;
  aud.loop = loop;
  aud.play();
}

// IFrame --> Host
window.addEventListener("message", function (e) {
  const data = JSON.parse(e.data);
  console.log(data);
  if (data.type == "function") eval(data.message);
});
