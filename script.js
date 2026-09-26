/* ============================================================
   NUTRI - AVENTURA NUTRITIVA
   JOGO EDUCATIVO 2D
   VERSÃO AVANÇADA

   Tecnologia:
   - HTML5 Canvas
   - JavaScript puro
   - CSS

   Projeto acadêmico de Nutrição

   PRINCIPAIS RECURSOS:
   - 4 fases
   - Sprite personalizado do personagem
   - Animações
   - Inimigos desenhados em Canvas
   - Chef final
   - Sistema de energia
   - Sistema de vidas
   - Pontuação
   - Alimentos
   - Telas educativas
   - Controles de teclado
   - Controles Touch para celular
   - Câmera lateral
   - Física de plataforma
============================================================ */


/* ============================================================
   CANVAS
============================================================ */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;


/* ============================================================
   CONFIGURAÇÃO DO JOGO
============================================================ */

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

let scaleX = 1;
let scaleY = 1;


const PLAYER_SPRITE_FILES = {
    idle: ["idle_0.png", "idle_1.png", "idle_2.png", "idle_3.png"],
    walk: ["walk_0.png", "walk_1.png", "walk_2.png", "walk_3.png", "walk_4.png"],
    run: ["run_0.png", "run_1.png", "run_2.png", "run_3.png"],
    jump: ["jump_0.png", "jump_1.png", "jump_2.png"],
    crouch: ["crouch_0.png", "crouch_1.png"],
    attack: ["attack_0.png", "attack_1.png"],
    damage: ["damage_0.png"]
};

const PLAYER_SPRITES = {};
for (const anim in PLAYER_SPRITE_FILES) {
    PLAYER_SPRITES[anim] = PLAYER_SPRITE_FILES[anim].map(file => {
        const img = new Image();
        img.src = `assets/player/${file}`;
        return img;
    });
}

const PLAYER_ANIM_SPEED = {
    idle: 12, walk: 7, run: 5, jump: 10, crouch: 14, attack: 5, damage: 20
};


/* ============================================================
   REDIMENSIONAMENTO
============================================================ */

function resizeCanvas() {

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    scaleX =
        window.innerWidth /
        GAME_WIDTH;

    scaleY =
        window.innerHeight /
        GAME_HEIGHT;
}


window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


/* ============================================================
   ESTADO DO JOGO
============================================================ */

let gameState = "MENU";

let currentPhase = 0;

let score = 0;

let energy = 100;

let lives = 3;

let collectedFoods = 0;

let cameraX = 0;

let gameWon = false;


/*
    Controle de segurança do Game Loop.

    Isso evita que o jogo crie vários
    requestAnimationFrame simultaneamente.
*/

let gameLoopRunning = false;

let animationFrameId = null;


/*
    Evita executar a conclusão de uma fase
    várias vezes.
*/

let phaseEnding = false;


/* ============================================================
   TECLAS
============================================================ */

const keys = {};


window.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;


        if (
            [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                "Space"
            ].includes(event.code)
        ) {

            event.preventDefault();
        }


        /*
            Z = ataque
        */

        if (
            event.code === "KeyZ" &&
            gameState === "PLAYING"
        ) {

            if (player) {

                player.attack();
            }
        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;

    }
);


/* ============================================================
   UTILITÁRIOS
============================================================ */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


function random(
    min,
    max
) {

    return Math.random() *
        (max - min) +
        min;
}


function rectsCollide(
    a,
    b
) {

    return (
        a.x <
        b.x + b.width &&

        a.x + a.width >
        b.x &&

        a.y <
        b.y + b.height &&

        a.y + a.height >
        b.y
    );
}


/* ============================================================
   FASES
============================================================ */

const phases = [

    {
        name:
            "Fase 1 - Café da manhã",

        theme:
            "morning",

        width:
            5500,

        educationIcon:
            "🍎",

        educationTitle:
            "Café da manhã completo!",

        educationText:
            "Começar o dia com uma alimentação variada pode contribuir para uma rotina alimentar mais adequada. Frutas, cereais e outras opções podem fazer parte de diferentes combinações.",

        foods: [
            "apple",
            "banana",
            "egg",
            "milk",
            "carrot"
        ],

        enemies: [
            "pular"
        ]
    },


    {
        name:
            "Fase 2 - Rotina corrida",

        theme:
            "city",

        width:
            6500,

        educationIcon:
            "⏰",

        educationTitle:
            "Você venceu a rotina corrida!",

        educationText:
            "Planejamento pode ajudar nas escolhas alimentares quando o dia está cheio. Ter opções variadas disponíveis facilita encontrar alternativas adequadas para diferentes momentos.",

        foods: [
            "apple",
            "banana",
            "beans",
            "rice",
            "broccoli",
            "soda",
            "cookie"
        ],

        enemies: [
            "tempo",
            "sedentarismo"
        ]
    },


    {
        name:
            "Fase 3 - Hora do lanche",

        theme:
            "park",

        width:
            6000,

        educationIcon:
            "🥦",

        educationTitle:
            "Lanche concluído!",

        educationText:
            "Não existe uma única combinação perfeita para todas as pessoas. Variedade, equilíbrio e contexto são importantes para construir uma alimentação adequada.",

        foods: [
            "banana",
            "apple",
            "carrot",
            "broccoli",
            "cookie",
            "candy",
            "fries"
        ],

        enemies: [
            "ultra",
            "planning"
        ]
    },


    {
        name:
            "Fase 4 - Desafio final",

        theme:
            "night",

        width:
            7000,

        educationIcon:
            "🏆",

        educationTitle:
            "Você enfrentou o Chef da Rotina Corrida!",

        educationText:
            "Manter uma alimentação adequada durante uma rotina agitada pode exigir planejamento. O objetivo não é buscar perfeição, mas construir um conjunto equilibrado de escolhas ao longo do tempo.",

        foods: [
            "apple",
            "banana",
            "beans",
            "rice",
            "egg",
            "milk",
            "broccoli",
            "burger",
            "pizza",
            "soda"
        ],

        enemies: [
            "chef"
        ]
    }

];


/* ============================================================
   ALIMENTOS
============================================================ */

const foodData = {

    apple: {
        emoji: "🍎",
        name: "Maçã",
        healthy: true,
        energy: 15,
        points: 100
    },

    banana: {
        emoji: "🍌",
        name: "Banana",
        healthy: true,
        energy: 15,
        points: 100
    },

    carrot: {
        emoji: "🥕",
        name: "Cenoura",
        healthy: true,
        energy: 12,
        points: 100
    },

    broccoli: {
        emoji: "🥦",
        name: "Brócolis",
        healthy: true,
        energy: 15,
        points: 120
    },

    rice: {
        emoji: "🍚",
        name: "Arroz",
        healthy: true,
        energy: 12,
        points: 100
    },

    beans: {
        emoji: "🫘",
        name: "Feijão",
        healthy: true,
        energy: 15,
        points: 120
    },

    egg: {
        emoji: "🥚",
        name: "Ovo",
        healthy: true,
        energy: 12,
        points: 100
    },

    milk: {
        emoji: "🥛",
        name: "Leite",
        healthy: true,
        energy: 10,
        points: 80
    },

    burger: {
        emoji: "🍔",
        name: "Hambúrguer",
        healthy: false,
        energy: -10,
        points: 30
    },

    fries: {
        emoji: "🍟",
        name: "Batata frita",
        healthy: false,
        energy: -8,
        points: 30
    },

    pizza: {
        emoji: "🍕",
        name: "Pizza",
        healthy: false,
        energy: -10,
        points: 30
    },

    soda: {
        emoji: "🥤",
        name: "Refrigerante",
        healthy: false,
        energy: -12,
        points: 20
    },

    cookie: {
        emoji: "🍪",
        name: "Biscoito recheado",
        healthy: false,
        energy: -7,
        points: 20
    },

    candy: {
        emoji: "🍬",
        name: "Doce",
        healthy: false,
        energy: -6,
        points: 20
    }

};


/* ============================================================
   PLAYER
============================================================ */

class Player {

    constructor() {

        /*
            Posição
        */

        this.x = 150;

        this.y = 500;


        /*
            Hitbox física.

            Mantemos a hitbox menor que o sprite
            para deixar a movimentação natural.
        */

        this.width = 46;

        this.height = 68;


        /*
            Física
        */

        this.velocityX = 0;

        this.velocityY = 0;

        this.speed = 0.85;

        this.maxSpeed = 7;

        this.jumpForce = -15;

        this.gravity = 0.7;

        this.grounded = false;


        /*
            Direção
        */

        this.facing = 1;


        /*
            Estados
        */

        this.crouching = false;

        this.attacking = false;

        this.attackTimer = 0;


        /*
            Invencibilidade
        */

        this.invincible = false;

        this.invincibleTimer = 0;


        /*
            Animação
        */

        this.animationTimer = 0;

        this.currentAnimation = "idle";

        this.animationFrame = 0;

        this.animationCounter = 0;

    }


    update() {

        this.handleInput();


        /*
            Gravidade
        */

        this.velocityY +=
            this.gravity;


        this.velocityY =
            Math.min(
                this.velocityY,
                18
            );


        /*
            Movimento horizontal
        */

        this.x +=
            this.velocityX;


        /*
            Movimento vertical
        */

        this.y +=
            this.velocityY;


        /*
            Atrito
        */

        this.velocityX *=
            0.82;


        /*
            Plataformas
        */

        this.checkPlatforms();


        /*
            Limites
        */

        this.handleWorldBounds();


        /*
            Ataque
        */

        if (
            this.attackTimer > 0
        ) {

            this.attackTimer--;

        } else {

            this.attacking =
                false;
        }


        /*
            Invencibilidade
        */

        if (
            this.invincibleTimer > 0
        ) {

            this.invincibleTimer--;

        } else {

            this.invincible =
                false;
        }


        /*
            Animação
        */

        this.updateAnimation();

        this.animationTimer++;

    }


    /* ========================================================
       INPUT
    ======================================================== */

    handleInput() {

        const left =
            keys["ArrowLeft"] ||
            keys["KeyA"];


        const right =
            keys["ArrowRight"] ||
            keys["KeyD"];


        const down =
            keys["ArrowDown"] ||
            keys["KeyS"];


        const jump =
            keys["ArrowUp"] ||
            keys["KeyW"] ||
            keys["KeyX"] ||
            keys["Space"];


        /*
            Esquerda
        */

        if (left) {

            this.velocityX -=
                this.speed;

            this.facing = -1;
        }


        /*
            Direita
        */

        if (right) {

            this.velocityX +=
                this.speed;

            this.facing = 1;
        }


        /*
            Limita velocidade
        */

        this.velocityX =
            clamp(
                this.velocityX,
                -this.maxSpeed,
                this.maxSpeed
            );


        /*
            Agachar
        */

        this.crouching =
            down &&
            this.grounded;


        /*
            Pulo

            Para evitar pulo infinito,
            usamos uma trava.
        */

        if (
            jump &&
            this.grounded &&
            !this.jumpLock
        ) {

            this.jump();

            this.jumpLock = true;

        }


        if (!jump) {

            this.jumpLock = false;
        }

    }


    /* ========================================================
       PULO
    ======================================================== */

    jump() {

        this.velocityY =
            this.jumpForce;

        this.grounded =
            false;
    }


    /* ========================================================
       ATAQUE
    ======================================================== */

    attack() {

        if (
            this.attacking ||
            gameState !== "PLAYING"
        ) {

            return;
        }


        this.attacking = true;

        this.attackTimer = 22;


        /*
            Pequeno impulso para dar
            sensação de impacto.
        */

        this.velocityX +=
            this.facing * 0.8;
    }


    /* ========================================================
       HITBOX DO ATAQUE
    ======================================================== */

    getAttackBox() {

        return {

            x:
                this.facing === 1

                    ? this.x +
                      this.width -
                      4

                    : this.x -
                      60,

            y:
                this.y + 16,

            width:
                60,

            height:
                38
        };
    }


    /* ========================================================
       PLATAFORMAS
    ======================================================== */

    checkPlatforms() {

        this.grounded = false;


        for (
            const platform of platforms
        ) {

            if (

                this.velocityY >= 0 &&

                this.x +
                    this.width >
                    platform.x &&

                this.x <
                    platform.x +
                    platform.width &&

                this.y +
                    this.height >=
                    platform.y &&

                this.y +
                    this.height <=
                    platform.y +
                    platform.height +
                    this.velocityY +
                    5

            ) {

                this.y =
                    platform.y -
                    this.height;

                this.velocityY =
                    0;

                this.grounded =
                    true;

            }

        }

    }


    /* ========================================================
       LIMITES DO MUNDO
    ======================================================== */

    handleWorldBounds() {

        /*
            Parede esquerda
        */

        if (
            this.x < 0
        ) {

            this.x = 0;

            this.velocityX = 0;
        }


        /*
            Parede direita
        */

        const worldWidth =
            phases[currentPhase].width;


        if (
            this.x +
                this.width >
                worldWidth
        ) {

            this.x =
                worldWidth -
                this.width;
        }


        /*
            Caiu do mapa
        */

        if (
            this.y >
            GAME_HEIGHT + 200
        ) {

            loseLife();
        }

    }


    /* ========================================================
       DANO
    ======================================================== */

    takeDamage(
        amount = 1
    ) {

        if (
            this.invincible ||
            gameState !== "PLAYING"
        ) {

            return;
        }


        lives -= amount;

        energy -= 15;


        this.invincible =
            true;

        this.invincibleTimer =
            90;


        this.velocityY =
            -8;


        this.velocityX =
            -this.facing * 5;


        updateHUD();


        if (
            lives <= 0 ||
            energy <= 0
        ) {

            gameOver();
        }

    }


    /* ========================================================
       ANIMAÇÃO
    ======================================================== */

    updateAnimation() {
        let animation = "idle";

        if (this.attacking) {
            animation = "attack";
        } else if (!this.grounded) {
            animation = "jump";
        } else if (this.crouching) {
            animation = "crouch";
        } else if (Math.abs(this.velocityX) > 4) {
            animation = "run";
        } else if (Math.abs(this.velocityX) > 0.4) {
            animation = "walk";
        }

        if (animation !== this.currentAnimation) {
            this.currentAnimation = animation;
            this.animationFrame = 0;
            this.animationCounter = 0;
        }

        const frames = PLAYER_SPRITES[this.currentAnimation];
        const speed = PLAYER_ANIM_SPEED[this.currentAnimation] || 8;

        this.animationCounter++;

        if (this.animationCounter >= speed) {
            this.animationCounter = 0;
            this.animationFrame = (this.animationFrame + 1) % frames.length;
        }
    }


    /* ========================================================
       DESENHAR SPRITE
    ======================================================== */

    draw() {
        if (this.invincible && Math.floor(this.invincibleTimer / 6) % 2 === 0) {
            return;
        }

        const drawX = this.x - cameraX;
        const frames = PLAYER_SPRITES[this.currentAnimation];
        const img = frames[this.animationFrame % frames.length];

        if (img && img.complete && img.naturalWidth > 0) {
            const drawHeight = this.height * 1.35;
            const drawWidth = drawHeight * (img.naturalWidth / img.naturalHeight);

            const visualX = drawX + this.width / 2 - drawWidth / 2;
            const visualY = this.y + this.height - drawHeight;

            ctx.save();

            if (this.facing === -1) {
                ctx.translate(visualX + drawWidth, visualY);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
            } else {
                ctx.drawImage(img, visualX, visualY, drawWidth, drawHeight);
            }

            ctx.restore();
        } else {
            this.drawFallback();
        }

        if (this.attacking) {
            this.drawAttackEffect();
        }
    }


    /* ========================================================
       FALLBACK
    ======================================================== */

    drawFallback() {

        const x =
            this.x -
            cameraX;


        const y =
            this.y;


        /*
            Corpo
        */

        ctx.fillStyle =
            "#2f9d65";

        ctx.fillRect(
            x + 8,
            y + 22,
            30,
            32
        );


        /*
            Cabeça
        */

        ctx.fillStyle =
            "#f2b48b";

        ctx.fillRect(
            x + 8,
            y,
            30,
            25
        );


        /*
            Cabelo
        */

        ctx.fillStyle =
            "#241710";

        ctx.fillRect(
            x + 6,
            y - 2,
            34,
            10
        );


        /*
            Calça
        */

        ctx.fillStyle =
            "#284e78";

        ctx.fillRect(
            x + 9,
            y + 52,
            28,
            16
        );


        /*
            Pernas
        */

        ctx.fillStyle =
            "#20242a";

        ctx.fillRect(
            x + 7,
            y + 65,
            12,
            6
        );

        ctx.fillRect(
            x + 27,
            y + 65,
            12,
            6
        );

    }


    /* ========================================================
       EFEITO DE ATAQUE
    ======================================================== */

    drawAttackEffect() {

        const attack =
            this.getAttackBox();


        const centerX =
            attack.x -
            cameraX +
            (
                this.facing === 1
                    ? 10
                    : attack.width - 10
            );


        const centerY =
            attack.y +
            18;


        ctx.save();


        ctx.strokeStyle =
            "#ffe680";

        ctx.lineWidth =
            5;


        ctx.beginPath();


        if (
            this.facing === 1
        ) {

            ctx.arc(
                centerX,
                centerY,
                28,
                -1.0,
                0.9
            );

        } else {

            ctx.arc(
                centerX,
                centerY,
                28,
                2.2,
                4.1
            );

        }


        ctx.stroke();


        /*
            Pequenas partículas
        */

        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            centerX +
                this.facing * 30,
            centerY - 15,
            6,
            6
        );


        ctx.fillRect(
            centerX +
                this.facing * 38,
            centerY + 5,
            4,
            4
        );


        ctx.restore();
    }

}


/* ============================================================
   INIMIGO
============================================================ */

const ENEMY_SPRITE_FILES = {
    tempo: ["refri_0.png", "refri_1.png", "refri_2.png", "refri_3.png"],
    ultra: ["batata_0.png", "batata_1.png", "batata_2.png", "batata_3.png"],
    sedentarismo: ["biscoito_0.png", "biscoito_1.png", "biscoito_2.png"],
    pular: ["dr_sal_walk_0.png", "dr_sal_walk_1.png", "dr_sal_walk_2.png", "dr_sal_walk_3.png"],
    planning: ["sr_acucar_walk_0.png", "sr_acucar_walk_1.png", "sr_acucar_walk_2.png", "sr_acucar_walk_3.png"],
    chef: ["rei_ultra_walk_0.png", "rei_ultra_walk_1.png", "rei_ultra_walk_2.png"]
};

const ENEMY_SPRITES = {};
for (const type in ENEMY_SPRITE_FILES) {
    ENEMY_SPRITES[type] = ENEMY_SPRITE_FILES[type].map(file => {
        const img = new Image();
        img.src = `assets/enemies/${file}`;
        return img;
    });
}

class Enemy {

    constructor(
        x,
        type
    ) {

        this.x = x;

        this.type = type;


        /*
            Chef possui tamanho maior
        */

        if (
            type === "chef"
        ) {

            this.width = 100;

            this.height = 105;

        } else {

            this.width = 58;

            this.height = 58;
        }


        this.y = 0;


        this.velocityX = 0;

        this.velocityY = 0;

        this.facing = 1;

        this.gravity = 0.7;


        this.speed =
            type === "chef"
                ? 1.8
                : 1.2;


        this.hp =
            type === "chef"
                ? 12
                : 2;


        this.maxHp =
            this.hp;


        this.dead = false;

        this.hitTimer = 0;

        this.attackCooldown = 0;


        this.name =
            this.getName();


        this.info =
            this.getInfo();


        /*
            Pequena animação
        */

        this.animTimer =
            random(
                0,
                Math.PI * 2
            );

        this.spriteFrame = 0;
        this.spriteCounter = 0;

    }


    /* ========================================================
       NOME
    ======================================================== */

    getName() {

        const names = {

            tempo:
                "Falta de tempo",

            ultra:
                "Excesso de ultraprocessados",

            sedentarismo:
                "Sedentarismo",

            pular:
                "Pular refeições",

            planning:
                "Falta de planejamento",

            chef:
                "Chef da Rotina Corrida"

        };


        return (
            names[this.type] ||
            "Desafio"
        );

    }


    /* ========================================================
       INFORMAÇÃO EDUCATIVA
    ======================================================== */

    getInfo() {

        const infos = {

            tempo:
                "Planejamento pode ajudar a organizar as refeições mesmo em dias corridos.",

            ultra:
                "Os alimentos ultraprocessados não precisam ser tratados como proibidos. O mais importante é considerar frequência, variedade e equilíbrio.",

            sedentarismo:
                "Movimentar o corpo regularmente faz parte de um estilo de vida saudável.",

            pular:
                "Uma rotina alimentar organizada pode ajudar a evitar longos períodos sem se alimentar.",

            planning:
                "Planejar compras e refeições pode facilitar escolhas alimentares variadas.",

            chef:
                "Uma rotina corrida não precisa impedir escolhas equilibradas. Organização e flexibilidade podem ajudar."

        };


        return (
            infos[this.type] ||
            ""
        );

    }


    /* ========================================================
       UPDATE
    ======================================================== */

    update() {

        if (
            this.dead
        ) {

            return;
        }


        const distance =
            player.x +
            player.width / 2 -
            (this.x + this.width / 2);


        /*
            IA simples.

            O inimigo só persegue
            quando o jogador está próximo.
        */

        if (Math.abs(distance) <= this.speed) {
            this.velocityX = 0;
        } else if (Math.abs(distance) < 700) {

            this.velocityX =
                Math.sign(distance) *
                this.speed;

        } else {

            this.velocityX *=
                0.92;
        }


        /*
            Movimento
        */

        const previousX =
            this.x;

        this.x +=
            this.velocityX;


        /*
            Gravidade
        */

        this.velocityY +=
            this.gravity;


        this.y +=
            this.velocityY;


        /*
            Plataformas
        */

        this.checkPlatforms();


        /*
            Limites
        */

        const worldWidth =
            phases[currentPhase].width;


        this.x =
            clamp(
                this.x,
                0,
                worldWidth -
                    this.width
            );

        if (this.x < previousX) {
            this.facing = -1;
        } else if (this.x > previousX) {
            this.facing = 1;
        }


        /*
            Colisão com jogador
        */

        if (
            rectsCollide(
                this,
                player
            )
        ) {

            if (
                player.attacking
            ) {

                /*
                    O dano será aplicado
                    pela caixa de ataque.
                */

            } else {

                player.takeDamage();

            }

        }


        /*
            Colisão com ataque
        */

        if (
            player.attacking &&
            rectsCollide(
                player.getAttackBox(),
                this
            )
        ) {

            this.takeDamage();

        }


        /*
            Cooldown
        */

        if (
            this.hitTimer > 0
        ) {

            this.hitTimer--;
        }


        if (
            this.attackCooldown > 0
        ) {

            this.attackCooldown--;
        }


        if (Math.abs(this.x - previousX) > 0.01) {
            this.animTimer +=
                0.05;

            this.spriteCounter++;
            if (this.spriteCounter >= 8) {
                this.spriteCounter = 0;
                const frames = ENEMY_SPRITES[this.type];
                this.spriteFrame = (this.spriteFrame + 1) % frames.length;
            }
        }

    }


    /* ========================================================
       PLATAFORMAS
    ======================================================== */

    checkPlatforms() {

        for (
            const platform of platforms
        ) {

            if (

                this.velocityY >= 0 &&

                this.x +
                    this.width >
                    platform.x &&

                this.x <
                    platform.x +
                    platform.width &&

                this.y +
                    this.height >=
                    platform.y &&

                this.y +
                    this.height <=
                    platform.y +
                    platform.height +
                    this.velocityY +
                    5

            ) {

                this.y =
                    platform.y -
                    this.height;

                this.velocityY =
                    0;

            }

        }

    }


    /* ========================================================
       DANO
    ======================================================== */

    takeDamage() {

        if (
            this.hitTimer > 0 ||
            this.dead
        ) {

            return;
        }


        this.hp--;


        this.hitTimer =
            25;


        this.velocityX =
            -player.facing * 7;


        this.velocityY =
            -7;


        showFloatingText(
            this.x,
            this.y,
            "-1 ❤️"
        );


        if (
            this.hp <= 0
        ) {

            this.dead =
                true;


            score +=
                this.type === "chef"
                    ? 1500
                    : 250;


            showFloatingText(

                this.x,

                this.y,

                this.type === "chef"
                    ? "+1500 ⭐"
                    : "+250 ⭐"

            );


            /*
                Informação educativa
            */

            setTimeout(
                () => {

                    if (
                        gameState ===
                        "PLAYING"
                    ) {

                        showEnemyInfo(
                            this.name,
                            this.info
                        );
                    }

                },
                250
            );

        }

    }


    /* ========================================================
       DRAW
    ======================================================== */

    draw() {
        if (this.dead) return;

        const x = this.x - cameraX;
        const y = this.y;

        if (this.hitTimer > 0 && Math.floor(this.hitTimer / 4) % 2 === 0) {
            return;
        }

        const frames = ENEMY_SPRITES[this.type];
        const img = frames && frames[this.spriteFrame];

        if (img && img.complete && img.naturalWidth > 0) {
            const drawHeight = this.height * 1.3;
            const drawWidth = drawHeight * (img.naturalWidth / img.naturalHeight);

            const visualX = x + this.width / 2 - drawWidth / 2;
            const visualY = y + this.height - drawHeight;

            ctx.save();

            if (this.facing === -1) {
                ctx.translate(visualX + drawWidth, visualY);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
            } else {
                ctx.drawImage(img, visualX, visualY, drawWidth, drawHeight);
            }

            ctx.restore();
        } else if (this.type === "chef") {
            this.drawChef(x, y);
        } else {
            this.drawAngryEnemy(x, y);
        }

        this.drawHealthBar(x, y);
    }


    /* ========================================================
       INIMIGOS BRAVOS
    ======================================================== */

    drawAngryEnemy(
        x,
        y
    ) {

        const centerX =
            x +
            this.width / 2;


        const bob =
            Math.sin(
                this.animTimer
            ) * 2;


        /*
            Corpo base
        */

        let bodyColor =
            "#d84b3f";


        if (
            this.type === "tempo"
        ) {

            bodyColor =
                "#5d6f91";

        } else if (
            this.type ===
            "sedentarismo"
        ) {

            bodyColor =
                "#8b5fa8";

        } else if (
            this.type ===
            "pular"
        ) {

            bodyColor =
                "#6b6b6b";

        } else if (
            this.type ===
            "planning"
        ) {

            bodyColor =
                "#d28b38";

        } else if (
            this.type ===
            "ultra"
        ) {

            bodyColor =
                "#b94a35";
        }


        /*
            Corpo
        */

        ctx.fillStyle =
            bodyColor;


        ctx.beginPath();


        ctx.roundRect(
            x + 3,
            y + 10 + bob,
            this.width - 6,
            this.height - 12,
            12
        );


        ctx.fill();


        /*
            Borda
        */

        ctx.strokeStyle =
            "#351c1c";

        ctx.lineWidth =
            4;


        ctx.stroke();


        /*
            Olhos bravos
        */

        ctx.fillStyle =
            "#ffffff";


        ctx.beginPath();

        ctx.ellipse(
            centerX - 12,
            y + 27 + bob,
            9,
            7,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.ellipse(
            centerX + 12,
            y + 27 + bob,
            9,
            7,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
            Pupilas
        */

        ctx.fillStyle =
            "#111111";


        ctx.fillRect(
            centerX - 14,
            y + 25 + bob,
            6,
            8
        );


        ctx.fillRect(
            centerX + 8,
            y + 25 + bob,
            6,
            8
        );


        /*
            Sobrancelhas inclinadas
        */

        ctx.strokeStyle =
            "#241515";

        ctx.lineWidth =
            5;


        ctx.beginPath();

        ctx.moveTo(
            centerX - 21,
            y + 18 + bob
        );

        ctx.lineTo(
            centerX - 5,
            y + 23 + bob
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            centerX + 5,
            y + 23 + bob
        );

        ctx.lineTo(
            centerX + 21,
            y + 18 + bob
        );

        ctx.stroke();


        /*
            Boca brava
        */

        ctx.fillStyle =
            "#241414";


        ctx.beginPath();

        ctx.roundRect(
            centerX - 14,
            y + 38 + bob,
            28,
            10,
            5
        );

        ctx.fill();


        /*
            Dentes
        */

        ctx.fillStyle =
            "#ffffff";


        ctx.fillRect(
            centerX - 9,
            y + 39 + bob,
            6,
            5
        );


        ctx.fillRect(
            centerX - 1,
            y + 39 + bob,
            6,
            5
        );


        ctx.fillRect(
            centerX + 7,
            y + 39 + bob,
            6,
            5
        );


        /*
            Braços
        */

        ctx.strokeStyle =
            bodyColor;

        ctx.lineWidth =
            10;


        ctx.beginPath();

        ctx.moveTo(
            x + 7,
            y + 32
        );

        ctx.lineTo(
            x - 7,
            y + 47
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            x + this.width - 7,
            y + 32
        );

        ctx.lineTo(
            x + this.width + 7,
            y + 47
        );

        ctx.stroke();


        /*
            Punhos
        */

        ctx.fillStyle =
            "#2b1a1a";


        ctx.beginPath();

        ctx.arc(
            x - 8,
            y + 49,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            x + this.width + 8,
            y + 49,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
            Identificação do inimigo
        */

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 11px Arial";

        ctx.textAlign =
            "center";


        const labels = {

            tempo: "TEMPO",

            ultra: "ULTRA",

            sedentarismo: "SEDENT.",

            pular: "REFEIÇÃO",

            planning: "PLANO"

        };


        ctx.fillText(
            labels[this.type] ||
            "DESAFIO",

            centerX,
            y - 10
        );


        ctx.textAlign =
            "left";
    }


    /* ========================================================
       CHEF FINAL
    ======================================================== */

    drawChef(
        x,
        y
    ) {

        const centerX =
            x +
            this.width / 2;


        /*
            Aura
        */

        ctx.fillStyle =
            "rgba(255, 80, 50, 0.15)";


        ctx.beginPath();

        ctx.arc(
            centerX,
            y + 50,
            70,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
            Corpo
        */

        ctx.fillStyle =
            "#9e2930";


        ctx.beginPath();

        ctx.roundRect(
            x + 15,
            y + 38,
            70,
            62,
            12
        );

        ctx.fill();


        ctx.strokeStyle =
            "#351515";

        ctx.lineWidth =
            5;

        ctx.stroke();


        /*
            Cabeça
        */

        ctx.fillStyle =
            "#d99a76";


        ctx.beginPath();

        ctx.arc(
            centerX,
            y + 33,
            30,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.strokeStyle =
            "#351515";

        ctx.stroke();


        /*
            Chapéu de chef
        */

        ctx.fillStyle =
            "#ffffff";


        ctx.beginPath();

        ctx.arc(
            centerX - 20,
            y + 8,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            centerX,
            y + 4,
            21,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            centerX + 20,
            y + 8,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillRect(
            centerX - 35,
            y + 12,
            70,
            14
        );


        /*
            Sobrancelhas
        */

        ctx.strokeStyle =
            "#291515";

        ctx.lineWidth =
            6;


        ctx.beginPath();

        ctx.moveTo(
            centerX - 24,
            y + 27
        );

        ctx.lineTo(
            centerX - 5,
            y + 33
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            centerX + 5,
            y + 33
        );

        ctx.lineTo(
            centerX + 24,
            y + 27
        );

        ctx.stroke();


        /*
            Olhos
        */

        ctx.fillStyle =
            "#111111";


        ctx.fillRect(
            centerX - 19,
            y + 34,
            8,
            8
        );


        ctx.fillRect(
            centerX + 11,
            y + 34,
            8,
            8
        );


        /*
            Bigode
        */

        ctx.fillStyle =
            "#301b16";


        ctx.beginPath();

        ctx.arc(
            centerX - 8,
            y + 52,
            12,
            0,
            Math.PI
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            centerX + 8,
            y + 52,
            12,
            0,
            Math.PI
        );

        ctx.fill();


        /*
            Braços
        */

        ctx.strokeStyle =
            "#9e2930";

        ctx.lineWidth =
            16;


        ctx.beginPath();

        ctx.moveTo(
            x + 20,
            y + 55
        );

        ctx.lineTo(
            x - 5,
            y + 80
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            x + 80,
            y + 55
        );

        ctx.lineTo(
            x + 105,
            y + 80
        );

        ctx.stroke();


        /*
            Mão esquerda
        */

        ctx.fillStyle =
            "#d99a76";


        ctx.beginPath();

        ctx.arc(
            x - 7,
            y + 82,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
            Mão direita
        */

        ctx.beginPath();

        ctx.arc(
            x + 107,
            y + 82,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
            Texto
        */

        ctx.fillStyle =
            "#ffe680";

        ctx.font =
            "bold 18px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(
            "CHEF",
            centerX,
            y - 25
        );


        ctx.textAlign =
            "left";
    }


    /* ========================================================
       BARRA DE VIDA
    ======================================================== */

    drawHealthBar(
        x,
        y
    ) {

        const width =
            this.type === "chef"
                ? 110
                : 55;


        const height = 7;


        const barX =
            x +
            this.width / 2 -
            width / 2;


        const barY =
            y -
            2;


        /*
            Fundo
        */

        ctx.fillStyle =
            "#291616";


        ctx.fillRect(
            barX,
            barY,
            width,
            height
        );


        /*
            Vida
        */

        const hpPercent =
            clamp(
                this.hp /
                this.maxHp,
                0,
                1
            );


        ctx.fillStyle =
            this.type === "chef"
                ? "#ff4747"
                : "#65d66f";


        ctx.fillRect(
            barX,
            barY,
            width *
                hpPercent,
            height
        );

    }

}


/* ============================================================
   ALIMENTO
============================================================ */

class Food {

    constructor(
        x,
        y,
        type
    ) {

        this.x = x;

        this.y = y;

        this.width = 42;

        this.height = 42;

        this.type = type;

        this.data =
            foodData[type];

        this.collected =
            false;

        this.animation =
            random(
                0,
                Math.PI * 2
            );

    }


    update() {

        if (
            this.collected
        ) {

            return;
        }


        this.animation +=
            0.05;


        if (
            rectsCollide(
                this,
                player
            )
        ) {

            this.collect();
        }

    }


    collect() {

        if (
            this.collected
        ) {

            return;
        }


        this.collected =
            true;


        energy =
            clamp(
                energy +
                this.data.energy,
                0,
                100
            );


        score +=
            this.data.points;


        collectedFoods++;


        showFloatingText(

            this.x,

            this.y,

            this.data.healthy

                ? `+${this.data.energy} ⚡`

                : `${this.data.energy} ⚡`

        );


        updateHUD();


        if (
            energy <= 0
        ) {

            gameOver();
        }

    }


    draw() {

        if (
            this.collected
        ) {

            return;
        }


        const x =
            this.x -
            cameraX;


        const y =
            this.y +
            Math.sin(
                this.animation
            ) * 5;


        /*
            Aura
        */

        ctx.fillStyle =
            this.data.healthy

                ? "rgba(100,220,120,.18)"

                : "rgba(255,80,60,.15)";


        ctx.beginPath();

        ctx.arc(
            x +
                this.width / 2,
            y +
                this.height / 2,
            25,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
            Emoji

            Mantemos os alimentos em emoji
            para facilitar a leitura educativa.
        */

        ctx.font =
            "38px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(

            this.data.emoji,

            x +
                this.width / 2,

            y + 35

        );


        ctx.textAlign =
            "left";

    }

}


/* ============================================================
   PLATAFORMAS
============================================================ */

let platforms = [];


function createPlatforms() {

    platforms = [];

    const worldWidth = phases[currentPhase].width;

    // Espaço mínimo entre plataformas
    const GAP_X = 90;   // folga horizontal
    const GAP_Y = 110;  // folga vertical (altura do pulo)

    /* CHÃO */
    platforms.push({
        x: 0,
        y: 640,
        width: worldWidth,
        height: 100
    });


    /*
        Verifica se uma candidata invade
        o espaço de alguma plataforma já criada.
    */
    function conflicts(cand) {

        return platforms.some((p, i) => {

            if (i === 0) return false; // ignora o chão

            const overlapX =
                cand.x < p.x + p.width + GAP_X &&
                cand.x + cand.width + GAP_X > p.x;

            const overlapY =
                Math.abs(cand.y - p.y) < GAP_Y;

            return overlapX && overlapY;
        });
    }


    /*
        Tenta inserir uma plataforma.
        Desiste depois de algumas tentativas.
    */
    function tryPush(makeCandidate, attempts = 25) {

        for (let i = 0; i < attempts; i++) {

            const cand = makeCandidate();

            if (!conflicts(cand)) {
                platforms.push(cand);
                return true;
            }
        }

        return false;
    }


    /* PLATAFORMAS INTERMEDIÁRIAS */

    let x = 450;

    while (x < worldWidth - 700) {

        const width = random(180, 350);

        tryPush(() => ({
            x,
            y: random(430, 570),
            width,
            height: 25
        }));

        x += width + random(140, 300);
    }


    /* PLATAFORMAS ELEVADAS */

    for (let i = 0; i < 10; i++) {

        tryPush(() => {

            const width = random(120, 260);

            return {
                x: random(300, worldWidth - 500),
                y: random(260, 400),
                width,
                height: 22
            };
        });
    }
}
/* ============================================================
   ENTIDADES
============================================================ */

let player;

let foods = [];

let enemies = [];

let floatingTexts = [];


function spawnFoods(phase) {
    const spots = [];

    for (
        let i = 1;
        i < platforms.length;
        i++
    ) {
        const p =
            platforms[i];

        const count =
            Math.max(
                1,
                Math.floor(
                    p.width / 120
                )
            );

        for (
            let j = 0;
            j < count;
            j++
        ) {
            spots.push({
                x:
                    p.x +
                    p.width /
                        (count + 1) *
                        (j + 1) -
                    21,
                y: p.y - 52
            });
        }
    }

    for (
        let i = spots.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() *
                    (i + 1)
            );

        [spots[i], spots[j]] =
            [spots[j], spots[i]];
    }

    const placed = [];
    const MIN_DIST = 70;

    for (const spot of spots) {
        if (
            placed.length >= 28
        ) {
            break;
        }

        if (spot.x < 400) {
            continue;
        }

        const overlap =
            placed.some(
                food =>
                    Math.abs(
                        food.x -
                            spot.x
                    ) < MIN_DIST &&
                    Math.abs(
                        food.y -
                            spot.y
                    ) < MIN_DIST
            );

        if (overlap) {
            continue;
        }

        const type =
            phase.foods[
                Math.floor(
                    Math.random() *
                        phase.foods.length
                )
            ];

        placed.push(
            new Food(
                spot.x,
                spot.y,
                type
            )
        );
    }

    placed.sort(
        (a, b) =>
            Number(a.data.healthy) -
            Number(b.data.healthy)
    );

    foods = placed;
}


/* ============================================================
   CRIAR FASE
============================================================ */

function createPhase() {

    player =
        new Player();


    foods = [];

    enemies = [];

    floatingTexts = [];

    cameraX = 0;

    phaseEnding = false;


    createPlatforms();


    const phase =
        phases[currentPhase];


    /* ========================================================
       ALIMENTOS
    ======================================================== */

    spawnFoods(phase);


    /* ========================================================
       INIMIGOS
    ======================================================== */

    let enemyX = 900;


    /*
        Na fase final deixamos
        apenas o Chef.
    */

    if (
        currentPhase !== 3
    ) {

        for (
            let i = 0;
            i < 10;
            i++
        ) {

            const type =
                phase.enemies[
                    Math.floor(
                        Math.random() *
                        phase.enemies.length
                    )
                ];


            enemies.push(

                new Enemy(
                    enemyX,
                    type
                )

            );


            enemyX +=
                random(
                    400,
                    700
                );

        }

    }


    /* ========================================================
       CHEF FINAL
    ======================================================== */

    if (
        currentPhase === 3
    ) {

        const chef =
            new Enemy(
                phase.width - 650,
                "chef"
            );


        enemies.push(
            chef
        );

    }


    updateHUD();

}


/* ============================================================
   CÂMERA
============================================================ */

function updateCamera() {

    if (
        !player
    ) {

        return;
    }


    const target =
        player.x -
        GAME_WIDTH *
        0.4;


    cameraX +=
        (
            target -
            cameraX
        ) *
        0.08;


    cameraX =
        clamp(

            cameraX,

            0,

            Math.max(

                0,

                phases[
                    currentPhase
                ].width -
                GAME_WIDTH

            )

        );

}


/* ============================================================
   FUNDO
============================================================ */

function drawBackground() {

    const theme =
        phases[
            currentPhase
        ].theme;


    let skyTop;

    let skyBottom;


    if (
        theme === "morning"
    ) {

        skyTop =
            "#65c9f0";

        skyBottom =
            "#d8f3ff";


    } else if (
        theme === "city"
    ) {

        skyTop =
            "#547eaa";

        skyBottom =
            "#d4dbe5";


    } else if (
        theme === "park"
    ) {

        skyTop =
            "#79d0ef";

        skyBottom =
            "#e4f7d5";


    } else {

        skyTop =
            "#111d46";

        skyBottom =
            "#392d5c";

    }


    const gradient =
        ctx.createLinearGradient(

            0,
            0,

            0,
            GAME_HEIGHT

        );


    gradient.addColorStop(
        0,
        skyTop
    );


    gradient.addColorStop(
        1,
        skyBottom
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(

        0,
        0,

        GAME_WIDTH,
        GAME_HEIGHT

    );


    /*
        Sol
    */

    if (
        theme !== "night"
    ) {

        ctx.fillStyle =
            "#ffe680";


        ctx.beginPath();


        ctx.arc(

            1050,
            120,

            65,

            0,
            Math.PI * 2

        );


        ctx.fill();

    }


    /*
        Lua
    */

    if (
        theme === "night"
    ) {

        ctx.fillStyle =
            "#fff2bd";


        ctx.beginPath();


        ctx.arc(

            1050,
            120,

            50,

            0,
            Math.PI * 2

        );


        ctx.fill();


        ctx.fillStyle =
            "#111d46";


        ctx.beginPath();


        ctx.arc(

            1070,
            105,

            50,

            0,
            Math.PI * 2

        );


        ctx.fill();

    }


    /*
        Montanhas
    */

    ctx.fillStyle =

        theme === "night"

            ? "#242847"

            : "#6eaa89";


    ctx.beginPath();


    ctx.moveTo(
        0,
        600
    );


    for (
        let x = 0;
        x <= GAME_WIDTH;
        x += 100
    ) {

        const height =

            100 +

            Math.sin(

                (
                    x +
                    cameraX *
                    0.2
                ) *
                0.01

            ) *
            60;


        ctx.lineTo(

            x,

            600 -
            height

        );

    }


    ctx.lineTo(
        GAME_WIDTH,
        GAME_HEIGHT
    );


    ctx.lineTo(
        0,
        GAME_HEIGHT
    );


    ctx.closePath();


    ctx.fill();

}


/* ============================================================
   PLATAFORMAS
============================================================ */

function drawPlatforms() {

    for (
        const platform of platforms
    ) {

        const x =
            platform.x -
            cameraX;


        if (

            x +
                platform.width <
                0 ||

            x >
                GAME_WIDTH

        ) {

            continue;
        }


        /*
            Grama
        */

        ctx.fillStyle =
            "#4f9b55";


        ctx.fillRect(

            x,

            platform.y,

            platform.width,

            8

        );


        /*
            Terra
        */

        ctx.fillStyle =
            "#805633";


        ctx.fillRect(

            x,

            platform.y + 8,

            platform.width,

            platform.height - 8

        );


        /*
            Detalhes
        */

        ctx.fillStyle =
            "#63432b";


        for (

            let i = 0;

            i <
            platform.width;

            i += 30

        ) {

            ctx.fillRect(

                x + i,

                platform.y + 13,

                8,

                5

            );

        }

    }

}


/* ============================================================
   TEXTOS FLUTUANTES
============================================================ */

function showFloatingText(
    x,
    y,
    text
) {

    floatingTexts.push({

        x,

        y,

        text,

        life: 60

    });

}


function updateFloatingTexts() {

    for (
        const text
        of floatingTexts
    ) {

        text.y -= 1;

        text.life--;

    }


    floatingTexts =
        floatingTexts.filter(

            text =>
                text.life > 0

        );

}


function drawFloatingTexts() {

    ctx.font =
        "bold 20px Arial";


    ctx.textAlign =
        "center";


    for (
        const text
        of floatingTexts
    ) {

        ctx.globalAlpha =
            text.life / 60;


        ctx.fillStyle =
            "#ffffff";


        ctx.fillText(

            text.text,

            text.x -
            cameraX,

            text.y

        );

    }


    ctx.globalAlpha =
        1;


    ctx.textAlign =
        "left";

}


/* ============================================================
   HUD
============================================================ */

function updateHUD() {

    const livesElement =
        document.getElementById(
            "lives"
        );


    const energyValue =
        document.getElementById(
            "energy-value"
        );


    const energyBar =
        document.getElementById(
            "energy-bar"
        );


    const scoreElement =
        document.getElementById(
            "score"
        );


    const foodCount =
        document.getElementById(
            "food-count"
        );


    const phaseName =
        document.getElementById(
            "phase-name"
        );


    if (
        livesElement
    ) {

        livesElement.textContent =
            lives;
    }


    if (
        energyValue
    ) {

        energyValue.textContent =
            Math.round(
                energy
            );
    }


    if (
        energyBar
    ) {

        energyBar.style.width =
            `${clamp(
                energy,
                0,
                100
            )}%`;
    }


    if (
        scoreElement
    ) {

        scoreElement.textContent =
            score;
    }


    if (
        foodCount
    ) {

        foodCount.textContent =
            collectedFoods;
    }


    if (
        phaseName
    ) {

        phaseName.textContent =
            phases[
                currentPhase
            ].name;
    }

}


/* ============================================================
   INICIAR JOGO
============================================================ */

function startGame() {

    gameState =
        "PLAYING";


    currentPhase =
        0;


    score =
        0;


    energy =
        100;


    lives =
        3;


    collectedFoods =
        0;


    gameWon =
        false;


    phaseEnding =
        false;


    showScreen(
        "game-screen"
    );


    createPhase();


    startGameLoop();

}


/* ============================================================
   INICIAR GAME LOOP
============================================================ */

function startGameLoop() {

    /*
        Se já existe um loop funcionando,
        não criamos outro.
    */

    if (
        gameLoopRunning
    ) {

        return;
    }


    gameLoopRunning =
        true;


    animationFrameId =
        requestAnimationFrame(
            gameLoop
        );

}


/* ============================================================
   PARAR GAME LOOP
============================================================ */

function stopGameLoop() {

    gameLoopRunning =
        false;


    if (
        animationFrameId !== null
    ) {

        cancelAnimationFrame(
            animationFrameId
        );

        animationFrameId =
            null;
    }

}


/* ============================================================
   PRÓXIMA FASE
============================================================ */

function nextPhase() {

    /*
        Impede clique duplo.
    */

    if (
        gameState !==
        "EDUCATION"
    ) {

        return;
    }


    currentPhase++;


    /*
        Todas as fases concluídas.
    */

    if (
        currentPhase >=
        phases.length
    ) {

        victory();

        return;
    }


    /*
        Recupera energia.
    */

    energy =
        clamp(
            energy + 20,
            0,
            100
        );


    /*
        Reseta alimentos
        da nova fase.
    */

    collectedFoods =
        0;


    /*
        Prepara a nova fase.
    */

    createPhase();


    gameState =
        "PLAYING";


    phaseEnding =
        false;


    showScreen(
        "game-screen"
    );


    /*
        Garante que o loop
        esteja funcionando.
    */

    startGameLoop();


    updateHUD();

}


/* ============================================================
   TELA EDUCATIVA
============================================================ */

function showEducation() {

    /*
        Segurança contra chamadas repetidas.
    */

    if (
        gameState !==
        "PLAYING" ||
        phaseEnding
    ) {

        return;
    }


    phaseEnding =
        true;


    gameState =
        "EDUCATION";


    const phase =
        phases[
            currentPhase
        ];


    const icon =
        document.getElementById(
            "education-icon"
        );


    const title =
        document.getElementById(
            "education-title"
        );


    const text =
        document.getElementById(
            "education-text"
        );


    const educationScore =
        document.getElementById(
            "education-score"
        );


    const educationEnergy =
        document.getElementById(
            "education-energy"
        );


    const educationFoods =
        document.getElementById(
            "education-foods"
        );


    if (
        icon
    ) {

        icon.textContent =
            phase.educationIcon;
    }


    if (
        title
    ) {

        title.textContent =
            phase.educationTitle;
    }


    if (
        text
    ) {

        text.textContent =
            phase.educationText;
    }


    if (
        educationScore
    ) {

        educationScore.textContent =
            score;
    }


    if (
        educationEnergy
    ) {

        educationEnergy.textContent =
            Math.round(
                energy
            );
    }


    if (
        educationFoods
    ) {

        educationFoods.textContent =
            collectedFoods;
    }


    const button =
        document.getElementById(
            "next-phase-button"
        );


    if (
        button
    ) {

        if (
            currentPhase ===
            phases.length - 1
        ) {

            button.textContent =
                "🏆 FINALIZAR JOGO";

        } else {

            button.textContent =
                "PRÓXIMA FASE →";
        }

    }


    showScreen(
        "education-screen"
    );

}


/* ============================================================
   GAME OVER
============================================================ */

function gameOver() {

    if (
        gameState ===
        "GAMEOVER"
    ) {

        return;
    }


    gameState =
        "GAMEOVER";


    stopGameLoop();


    const scoreElement =
        document.getElementById(
            "gameover-score"
        );


    if (
        scoreElement
    ) {

        scoreElement.textContent =
            score;
    }


    showScreen(
        "gameover-screen"
    );

}


/* ============================================================
   PERDER VIDA
============================================================ */

function loseLife() {

    if (
        gameState !==
        "PLAYING"
    ) {

        return;
    }


    lives--;


    /*
        Reposiciona personagem.
    */

    player.x =
        Math.max(
            100,
            player.x - 250
        );


    player.y =
        400;


    player.velocityY =
        0;


    energy -=
        10;


    updateHUD();


    if (
        lives <= 0 ||
        energy <= 0
    ) {

        gameOver();

    }

}


/* ============================================================
   VITÓRIA
============================================================ */

function victory() {

    gameState =
        "VICTORY";


    gameWon =
        true;


    stopGameLoop();


    const victoryScore =
        document.getElementById(
            "victory-score"
        );


    if (
        victoryScore
    ) {

        victoryScore.textContent =
            score;
    }


    showScreen(
        "victory-screen"
    );

}


/* ============================================================
   MOSTRAR TELA
============================================================ */

function showScreen(
    screenId
) {

    document
        .querySelectorAll(
            ".screen"
        )
        .forEach(
            screen => {

                screen.classList.remove(
                    "active"
                );

            }
        );


    const target =
        document.getElementById(
            screenId
        );


    if (
        target
    ) {

        target.classList.add(
            "active"
        );

    }

}


/* ============================================================
   INFORMAÇÃO DO INIMIGO
============================================================ */

let infoTimeout;


function showEnemyInfo(
    title,
    text
) {

    clearTimeout(
        infoTimeout
    );


    const existing =
        document.getElementById(
            "enemy-info"
        );


    if (
        existing
    ) {

        existing.remove();
    }


    const box =
        document.createElement(
            "div"
        );


    box.id =
        "enemy-info";


    box.innerHTML = `

        <strong>
            💡 ${title}
        </strong>

        <p>
            ${text}
        </p>

    `;


    Object.assign(

        box.style,

        {

            position:
                "fixed",

            left:
                "50%",

            bottom:
                "110px",

            transform:
                "translateX(-50%)",

            width:
                "min(500px, 90%)",

            padding:
                "18px",

            borderRadius:
                "15px",

            background:
                "rgba(10, 35, 26, 0.95)",

            border:
                "2px solid #ffe680",

            color:
                "#ffffff",

            zIndex:
                "1000",

            textAlign:
                "center",

            boxShadow:
                "0 10px 40px rgba(0,0,0,.4)",

            fontFamily:
                "Arial, sans-serif"

        }

    );


    document.body.appendChild(
        box
    );


    infoTimeout =
        setTimeout(

            () => {

                if (
                    box.parentNode
                ) {

                    box.remove();
                }

            },

            4500

        );

}


/* ============================================================
   CHECAR FIM DA FASE
============================================================ */

function checkPhaseEnd() {

    if (
        !player ||
        gameState !==
        "PLAYING" ||
        phaseEnding
    ) {

        return;
    }


    const worldWidth =
        phases[
            currentPhase
        ].width;


    /*
        Jogador chegou ao final.
    */

    if (
        player.x >
        worldWidth - 250
    ) {

        /*
            FASE 4:

            O jogador só pode terminar
            depois de derrotar o Chef.
        */

        if (
            currentPhase === 3
        ) {

            const chef =
                enemies.find(

                    enemy =>
                        enemy.type ===
                        "chef"

                );


            /*
                Chef ainda vivo.
            */

            if (
                chef &&
                !chef.dead
            ) {

                return;
            }

        }


        /*
            Fase concluída.
        */

        showEducation();

    }

}


/* ============================================================
   UPDATE
============================================================ */

function updateGame() {

    if (
        !player
    ) {

        return;
    }


    player.update();


    /*
        Alimentos
    */

    foods.forEach(

        food =>
            food.update()

    );


    /*
        Inimigos
    */

    enemies.forEach(

        enemy =>
            enemy.update()

    );


    /*
        Remove inimigos derrotados
    */

    enemies =
        enemies.filter(

            enemy =>
                !enemy.dead

        );


    updateFloatingTexts();


    updateCamera();


    checkPhaseEnd();

}


/* ============================================================
   DRAW
============================================================ */

function drawGame() {

    drawBackground();


    drawPlatforms();


    /*
        Alimentos
    */

    foods.forEach(

        food =>
            food.draw()

    );


    /*
        Inimigos
    */

    enemies.forEach(

        enemy =>
            enemy.draw()

    );


    /*
        Jogador
    */

    if (
        player
    ) {

        player.draw();
    }


    drawFloatingTexts();

}


/* ============================================================
   GAME LOOP
============================================================ */

function gameLoop() {

    /*
        Se saiu do estado PLAYING,
        encerra este ciclo.
    */

    if (
        gameState !==
        "PLAYING"
    ) {

        gameLoopRunning =
            false;

        animationFrameId =
            null;

        return;
    }


    ctx.clearRect(

        0,
        0,

        GAME_WIDTH,
        GAME_HEIGHT

    );


    updateGame();


    drawGame();


    /*
        Continua o jogo.
    */

    animationFrameId =
        requestAnimationFrame(
            gameLoop
        );

}


/* ============================================================
   BOTÕES DO HTML
============================================================ */

const startButton =
    document.getElementById(
        "start-button"
    );


if (
    startButton
) {

    startButton.addEventListener(
        "click",
        startGame
    );

}


const instructionsButton =
    document.getElementById(
        "instructions-button"
    );


if (
    instructionsButton
) {

    instructionsButton.addEventListener(

        "click",

        () => {

            showScreen(
                "instructions-screen"
            );

        }

    );

}


const backMenuButton =
    document.getElementById(
        "back-menu-button"
    );


if (
    backMenuButton
) {

    backMenuButton.addEventListener(

        "click",

        () => {

            gameState =
                "MENU";

            stopGameLoop();

            showScreen(
                "menu-screen"
            );

        }

    );

}


const restartButton =
    document.getElementById(
        "restart-button"
    );


if (
    restartButton
) {

    restartButton.addEventListener(
        "click",
        startGame
    );

}


const gameoverMenuButton =
    document.getElementById(
        "gameover-menu-button"
    );


if (
    gameoverMenuButton
) {

    gameoverMenuButton.addEventListener(

        "click",

        () => {

            gameState =
                "MENU";

            stopGameLoop();

            showScreen(
                "menu-screen"
            );

        }

    );

}


const nextPhaseButton =
    document.getElementById(
        "next-phase-button"
    );


if (
    nextPhaseButton
) {

    nextPhaseButton.addEventListener(
        "click",
        nextPhase
    );

}


const victoryRestartButton =
    document.getElementById(
        "victory-restart-button"
    );


if (
    victoryRestartButton
) {

    victoryRestartButton.addEventListener(
        "click",
        startGame
    );

}


const victoryMenuButton =
    document.getElementById(
        "victory-menu-button"
    );


if (
    victoryMenuButton
) {

    victoryMenuButton.addEventListener(

        "click",

        () => {

            gameState =
                "MENU";

            stopGameLoop();

            showScreen(
                "menu-screen"
            );

        }

    );

}


/* ============================================================
   CONTROLES MOBILE
============================================================ */

/*
    Agora não precisamos obrigatoriamente
    colocar os botões no HTML.

    O JavaScript cria tudo automaticamente.
*/


let mobileControls =
    document.getElementById(
        "mobile-controls"
    );


if (
    !mobileControls
) {

    mobileControls =
        document.createElement(
            "div"
        );

    mobileControls.id =
        "mobile-controls";

    document.body.appendChild(
        mobileControls
    );

}


/* ============================================================
   ESTILO DOS CONTROLES MOBILE
============================================================ */

const mobileStyle =
    document.createElement(
        "style"
    );


mobileStyle.textContent = `

#mobile-controls {

    position: fixed;

    left: 0;

    right: 0;

    bottom: 18px;

    width: 100%;

    display: none;

    justify-content: space-between;

    align-items: flex-end;

    padding:
        0 20px;

    box-sizing:
        border-box;

    z-index: 9999;

    pointer-events:
        none;

    user-select:
        none;

    -webkit-user-select:
        none;

    touch-action:
        none;
}


.mobile-control-group {

    display:
        flex;

    gap:
        12px;

    pointer-events:
        auto;
}


.mobile-button {

    width:
        66px;

    height:
        66px;

    border-radius:
        50%;

    border:
        3px solid
        rgba(255,255,255,.85);

    background:
        rgba(20,35,30,.82);

    color:
        white;

    font-size:
        28px;

    font-weight:
        bold;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    box-shadow:
        0 5px 15px
        rgba(0,0,0,.35);

    touch-action:
        none;

    user-select:
        none;

    -webkit-user-select:
        none;

    -webkit-tap-highlight-color:
        transparent;

    transition:
        transform .08s,
        background .08s;
}


.mobile-button:active {

    transform:
        scale(.88);

    background:
        rgba(75,150,100,.95);
}


.mobile-jump {

    width:
        74px;

    height:
        74px;

}


.mobile-attack {

    width:
        78px;

    height:
        78px;

    font-size:
        30px;

    background:
        rgba(150,45,45,.9);

}


@media
(max-width: 900px) {

    #mobile-controls {

        display:
            flex;

    }

}


@media
(orientation: landscape)
and
(max-height: 600px) {

    #mobile-controls {

        bottom:
            8px;

    }


    .mobile-button {

        width:
            55px;

        height:
            55px;

        font-size:
            23px;

    }


    .mobile-jump {

        width:
            62px;

        height:
            62px;

    }


    .mobile-attack {

        width:
            65px;

        height:
            65px;

    }

}

`;


document.head.appendChild(
    mobileStyle
);


/* ============================================================
   CRIAR BOTÃO MOBILE
============================================================ */

function createMobileButton(
    className,
    icon,
    key,
    action = null
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        `mobile-button ${className}`;


    button.textContent =
        icon;


    button.setAttribute(
        "aria-label",
        icon
    );


    /*
        Evita comportamento
        padrão do navegador.
    */

    const prevent =
        event => {

            event.preventDefault();

            event.stopPropagation();

        };


    /*
        Botão de movimento.
    */

    if (
        key
    ) {

        button.addEventListener(

            "pointerdown",

            event => {

                prevent(event);

                keys[key] =
                    true;

            }

        );


        button.addEventListener(

            "pointerup",

            event => {

                prevent(event);

                keys[key] =
                    false;

            }

        );


        button.addEventListener(

            "pointercancel",

            event => {

                prevent(event);

                keys[key] =
                    false;

            }

        );


        button.addEventListener(

            "pointerleave",

            () => {

                keys[key] =
                    false;

            }

        );

    }


    /*
        Botão de ação.
    */

    if (
        action
    ) {

        button.addEventListener(

            "pointerdown",

            event => {

                prevent(event);

                action();

            }

        );

    }


    return button;

}


/* ============================================================
   LAYOUT DOS CONTROLES
============================================================ */

const mobileLeft =
    document.createElement(
        "div"
    );


mobileLeft.className =
    "mobile-control-group";


const mobileRight =
    document.createElement(
        "div"
    );


mobileRight.className =
    "mobile-control-group";


/*
    Esquerda
*/

const leftButton =
    createMobileButton(

        "mobile-left",

        "◀",

        "ArrowLeft"

    );


/*
    Direita
*/

const rightButton =
    createMobileButton(

        "mobile-right",

        "▶",

        "ArrowRight"

    );


/*
    Agachar
*/

const crouchButton =
    createMobileButton(

        "mobile-crouch",

        "▼",

        "ArrowDown"

    );


/*
    Pulo
*/

const jumpButton =
    createMobileButton(

        "mobile-jump",

        "▲",

        "Space"

    );


/*
    Ataque
*/

const attackButton =
    createMobileButton(

        "mobile-attack",

        "👊",

        null,

        () => {

            if (
                gameState ===
                "PLAYING" &&
                player
            ) {

                player.attack();

            }

        }

    );


/*
    Monta controles
*/

mobileLeft.appendChild(
    leftButton
);


mobileLeft.appendChild(
    rightButton
);


mobileLeft.appendChild(
    crouchButton
);


mobileRight.appendChild(
    jumpButton
);


mobileRight.appendChild(
    attackButton
);


mobileControls.appendChild(
    mobileLeft
);


mobileControls.appendChild(
    mobileRight
);


/* ============================================================
   PREVENIR ZOOM / SCROLL NO CELULAR
============================================================ */

document.addEventListener(

    "gesturestart",

    event => {

        event.preventDefault();

    }

);


document.addEventListener(

    "touchmove",

    event => {

        if (
            gameState ===
            "PLAYING"
        ) {

            event.preventDefault();

        }

    },

    {
        passive:
            false
    }

);


/*
    Evita menu de contexto
    durante o jogo.
*/

canvas.addEventListener(

    "contextmenu",

    event => {

        event.preventDefault();

    }

);


/* ============================================================
   SOLTAR TECLAS AO SAIR DA JANELA
============================================================ */

window.addEventListener(

    "blur",

    () => {

        Object.keys(
            keys
        ).forEach(

            key => {

                keys[key] =
                    false;

            }

        );

    }

);


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

showScreen(
    "menu-screen"
);

updateHUD();


/* ============================================================
   LOG DE INICIALIZAÇÃO
============================================================ */

console.log(
    "🥦 NUTRI - Aventura Nutritiva carregado!"
);

console.log(
    "👩 Sprite do personagem:",
    "assets/nutri_player_sprites_32x64.png"
);

console.log(
    "📱 Controles Touch ativados."
);

console.log(
    "🎮 Sistema de fases:",
    phases.length,
    "fases."
);
