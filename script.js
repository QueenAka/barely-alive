// Key controller 

let keys = {}

window.addEventListener("keydown", function(e) {
  e.preventDefault();
  keys[e.key] = true;
});

window.addEventListener("keyup", function(e) {
  delete keys[e.key];
});

// This entire engine is SHIT
// Any bugs yall find and are willing to fix, please do 😭

class Inventory {
  constructor() {
    this.inv = [
      { id: "flower", amount: 9999 },
      { id: "stick", amount: 99 },
      { id: "apple", amount: 99 },
      { id: "wood", amount: 99 },
      { id: "planks", amount: 99 },
      { id: null, amount: null },
      { id: null, amount: null },
      { id: null, amount: null },
      { id: null, amount: null }
    ]
    this.slots = document.querySelectorAll(".slot");
    this.slots.forEach(slot => {
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
      fetch("data.json")
        .then(res => res.json())
        .then(data => {
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
      itemDiv.innerHTML = `<img src="${itemData.image}" /><span>${item.amount > 0 ? `x${item.amount}` : ""}</span>`;
      itemDiv.classList.add("item");
      slot.appendChild(itemDiv);
    }
  }
}

class Game {
  constructor() {
    const gameDiv = document.createElement("div");
    gameDiv.innerHTML = `<nav>
      <div id="score">Score: 0</div>
      <div class="health">
        <div class="bar" id="health"></div>
      </div>
      <div id="day">Day 1</div>
    </nav>
    <div id="bottomNav" class="bottom-nav">
      <div>Menu</div>
      <div class="inventory" id="inv">
        <div class="slot selected" id="slot-1">
        </div>
        <div class="slot" id="slot-2">
        </div>
        <div class="slot" id="slot-3">
        </div>
        <div class="slot" id="slot-4">
        </div>
        <div class="slot" id="slot-5">
        </div>
        <div class="slot" id="slot-6">
        </div>
        <div class="slot" id="slot-7">
        </div>
        <div class="slot" id="slot-8">
        </div>
        <div class="slot" id="slot-9">
        </div>
      </div>
      <div>Inventory</div>
    </div>
    <div id="map" class="map"></div>`
    document.body.appendChild(gameDiv);
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

  async start(xx, yy, sxx, syy) {
    new Promise(async resolve => {
      const x = xx;
      const y = (yy || xx);
      const sx = (sxx || ((x * 50) / 2));
      const sy = (syy || ((y * 50) / 2));
      this.mx = x;
      this.my = y;
      this.inventory.update();
      this.map.style.width = `${x * 50}px`;
      this.map.style.height = `${y * 50}px`;
      this.map.style.overflow = "hidden";
      document.body.style.width = `${x * 50}px`;
      document.body.style.height = `${y * 50}px`;
      this.map.innerHTML = "";
      this.rawMap = []
      this.layerHandler();
      for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
          // Grass
          const tile = document.createElement("img");
          tile.src = this.data.tiles.grass.image[Math.floor(Math.random() * this.data.tiles.grass.image.length)]
          tile.classList.add("tile");
          tile.style.left = `${i * 50}px`;
          tile.style.top = `${j * 50}px`;
          tile.style.width = `${this.vars(this.data.tiles.grass.size)}px`;
          tile.style.zIndex = 1;
          this.map.appendChild(tile);
        }
      }
      for (let i = 0; i < y; i++) {
        let layer = "";
        for (let j = 0; j < x; j++) {
          const tile = Math.floor(Math.random() * 100);
          if (tile <= 50) {
            // Air
            layer += "null/";
          }
          if (tile <= 75 && tile > 50) {
            // Flowers
            const div = document.createElement("img");
            div.src = this.data.tiles.flower.image[Math.floor(Math.random() * this.data.tiles.flower.image.length)]
            div.classList.add("tile");
            div.classList.add("breakable");
            div.classList.add("layers");
            const offsetX = this.vars(this.data.tiles.flower.offsetX) * 1;
            const offsetY = this.vars(this.data.tiles.flower.offsetY) * 1;
            div.style.left = `${(i * 50) + offsetX}px`;
            div.style.top = `${(j * 50) + offsetY}px`;
            div.style.width = `${this.vars(this.data.tiles.flower.size)}px`;
            div.style.zIndex = 2;
            this.map.appendChild(div);
            layer += "flower/";
          } else if (tile <= 100 && tile > 75) {
            // Trees
            const div = document.createElement("img");
            div.src = this.data.tiles.tree.image[Math.floor(Math.random() * this.data.tiles.tree.image.length)]
            div.classList.add("tile");
            div.classList.add("breakable");
            div.classList.add("layers");
            const offsetX = this.vars(this.data.tiles.tree.offsetX) * 1;
            const offsetY = this.vars(this.data.tiles.tree.offsetY) * 1;
            div.style.left = `${(i * 50) + offsetX}px`;
            div.style.top = `${(j * 50) + offsetY}px`;
            div.style.width = `${this.vars(this.data.tiles.tree.size)}px`;
            div.style.zIndex = 4;
            this.map.appendChild(div);
            layer += "tree/";
          }
        }
        this.rawMap.push(layer);
      }
      console.log(this.rawMap);
      // Player
      const entity = this.data.entities.player;
      const player = document.createElement("img");
      player.classList.add("entity");
      player.classList.add("layers");
      player.style.left = `${sx}px`;
      player.style.top = `${sy}px`;
      player.style.width = `${entity.size}px`;
      player.id = `player`;
      this.playerSprites = [];
      // Get data URIs of each sprite
      function uri(blob) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        });
      }
      await fetch(entity.image + "up.png").then(res => res.blob()).then(async blob => this.playerSprites.push(await uri(blob)));
      await fetch(entity.image + "down.png").then(res => res.blob()).then(async blob => this.playerSprites.push(await uri(blob)));
      await fetch(entity.image + "left.png").then(res => res.blob()).then(async blob => this.playerSprites.push(await uri(blob)));
      await fetch(entity.image + "right.png").then(res => res.blob()).then(async blob => this.playerSprites.push(await uri(blob)));
      player.src = this.playerSprites[1];
      this.map.appendChild(player);
      this.track(player);
      this.movement(player);
      resolve();
    });
  }
  track(player) {
    function center() {
      player.scrollIntoView({
        block: "center",
        inline: "center",
        behavior: "smooth"
      });
      requestAnimationFrame(center);
    }
    center();
  }

  movement(player) {
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
          player.src = frame;
          x.frame = frame;
        }
        if (direction == "up" || direction == "down") {
          player.style.top = `${parseInt(player.style.top) + (direction == "up" ? -1 : 1) * 5}px`;
        } else {
          player.style.left = `${parseInt(player.style.left) + (direction == "left" ? -1 : 1) * 5}px`;
        }
      }

      requestAnimationFrame(() => movement(x));
    }


    requestAnimationFrame(() => movement(this));
  }

  vars(str) {
    let editedStr = str
    const varRegex = /\{(.*?)\}/g
    if (!varRegex.test(str)) return str;
    const matches = str.match(varRegex);
    if (!matches) return str;
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const varName = match.replace(/[{}]/g, "");
      let ret = ""
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
    document.querySelectorAll(type).forEach(elm => {
      const zIndex = parseInt(elm.style.top.split("px")[0], 10);
      elm.style.zIndex = zIndex;
    });
  }
}

class Commands {
  constructor(game) {
    this.score = document.getElementById("score");
    this.day = document.getElementById("day");
    this.health = document.getElementById("health");
  }
  start() {
    document.addEventListener("keydown", (e) => {
      const key = e.key;
      if (key == "/") {
        e.preventDefault();
        const str = prompt("Enter command");
        if (str) {
          if (str.startsWith("health")) {
            const arg = str.replace("health", "").trim();
            this.health.style.width = `calc(${arg}% - 20px)`;
          } else if (str.startsWith("score")) {
            const arg = str.replace("score", "").trim();
            this.score.innerHTML = `Score: ${arg}`;
          } else if (str.startsWith("day")) {
            const arg = str.replace("day", "").trim();
            this.day.innerHTML = `Day ${arg}`;
          } else if (str == "car") {
            const car = document.createElement("video");
            car.innerHTML = `<source src="/assets/misc/car.mp4" type="video/mp4" />`
            car.classList = "video";
            car.controls = false;
            car.onended = function(e) {
              car.remove();
            }
            document.body.appendChild(car);
            car.play();
          } else {
            alert("Invalid command " + str)
          }
        }
      }
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
    if (this.game.mx < x || this.game.my < y) throw new Error("Entity out of bounds");
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
  fetch("/assets/menus/start.htm").then(res => res.text()).then(menu => {
    const div = document.createElement("div");
    div.innerHTML = menu;
    div.id = "startMenu"
    document.body.appendChild(div);
  });
});

function PLAY() {
  transition("startMenu", () => {
    new Promise(async res => {
      const gameInst = new Game()
      gameInst.then(async game => {
        game.start(50, 50).then(() => {
          const cmds = new Commands(game);
          const ents = new Entities(game.data, game);
          cmds.start();
          res();
        });
      });
    });
  });
}

async function transition(from, run) {
  const fromDiv = document.getElementById(from);
  const transitionDiv = document.createElement("div");
  transitionDiv.id = "transition";
  transitionDiv.classList = "transition";
  transitionDiv.style.opacity = 0;
  document.body.appendChild(transitionDiv);

  await new Promise(resolve => setTimeout(resolve, 100));

  transitionDiv.style.opacity = 1;
  fromDiv.remove();

  run()
    transitionDiv.style.opacity = 0;
    setTimeout(() => {
      transitionDiv.remove();
    }, 100);
}
