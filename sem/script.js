import * as THREE from 'three';

// Načtení video elementů
const p1Video = document.getElementById('p1GoalVideo');
const p2Video = document.getElementById('p2GoalVideo');
const backgroundOverlay = document.getElementById('backgroundOverlay');

/** Vítejte v Pongu **/

/*
 *   Nastavení dat z menu
 */
const playerSpeed = 0.05;
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
var cap = 13;
var P1 = "media/img/fire.jpg";
var P2 = "media/img/ice.jpg";
var B = "media/img/melone.jpg";
if (params.cap) { cap = parseInt(params.cap); }
if (params.P1) { P1 = params.P1; }
if (params.P2) { P2 = params.P2; }
var soundPackName = "Tennis"; 
if (params.SoundPack) { soundPackName = params.SoundPack; }
var AI = false;
var AIspeed = playerSpeed;
console.log(cap);
if (params.AI) { AI = true; AIspeed = parseFloat(params.AIspeed); }
/*
 *   Načtení zvuků tvorba objektů a skinů
 */
const over = new Howl({
    src: ['media/sound/over.wav'],
    volume: 1,
    html5: true,
});

/* NAČTENÍ ZVUKŮ ÚDERU (Dynamic Sound Loading) */
let hitSounds = []; // Pole pro připravené zvuky

fetch('sounds.json')
    .then(response => response.json())
    .then(data => {
        // Získáme seznam souborů pro vybranou kategorii
        let files = data[soundPackName];
        
        // Ošetření pro případ, že v JSONu není pole, ale jen jeden string (např. "TROLL")
        if (!Array.isArray(files)) {
            files = [files];
        }

        // Naplníme pole hitSounds objekty Howl
        // DŮLEŽITÉ: Předpokládá strukturu složek media/sound/NazevKategorie/soubor.mp3
        hitSounds = files.map(filename => {
            return new Howl({
                src: [`media/sound/hit/${soundPackName}/${filename}`],
                volume: 0.5,
                html5: true
            });
        });
    })
    .catch(err => console.error("Chyba při načítání zvuků:", err));

// Pomocná funkce pro přehrání náhodného zvuku z balíčku
function playHitSound() {
    if (hitSounds.length === 0) {
        console.warn("⚠️ Voláno playHitSound, ale pole zvuků je prázdné (ještě se nenačetly nebo chyba).");
        return;
    }
    const randomIndex = Math.floor(Math.random() * hitSounds.length);
    console.log(`🔊 Přehrávám zvuk index: ${randomIndex}`);
    hitSounds[randomIndex].play();
}
//-------------------------------------------------------------------

const fail = new Howl({
    src: ['media/sound/fail.mp3'],
    volume: 1,
    html5: true,
});
const start = new Howl({
    src: ['media/sound/start.mp3'],
    volume: 1,
    html5: true,
});
const win = new Howl({
    src: ['media/sound/win.mp3'],
    volume: 1,
    html5: true,
});

const p1GoalAudio = new Howl({
    src: ['media/sound/p1_goal.mp3'] // Nahraďte vaší cestou
});
const p2GoalAudio = new Howl({
    src: ['media/sound/p2_goal.mp3'] // Nahraďte vaší cestou
});

// Create a scene
const scene = new THREE.Scene();
var endgame=false;
var xdir=false;
var ydir=false;
var P1Count=0;
var P2Count=0;
var gameOn=false;
var isVideoPlaying = false;
var yBallspeed=0.06;
var ballSpeed = 0.06;
const pressedKeys = {};
/*
const KeyActions = {
    87: () => { var tmp=player1.position.y - playerSpeed;if(tmp<=-(cubeH / 2)+(LPH/2)){player1.position.y=-(cubeH / 2)+(LPH/2);}else{player1.position.y=tmp}player1BoundingBox.setFromObject(player1);}, // W key
    83: () => { var tmp=player1.position.y + playerSpeed;if(tmp>=(cubeH / 2)-(LPH/2)){player1.position.y=(cubeH / 2)-(LPH/2);}else{player1.position.y=tmp}player1BoundingBox.setFromObject(player1);}, // S key
    38: () => { var tmp=player2.position.y - playerSpeed;if(tmp<=-(cubeH / 2)+(LPH/2)){player2.position.y=-(cubeH / 2)+(LPH/2);}else{player2.position.y=tmp}player2BoundingBox.setFromObject(player2); }, // UP arrow
    40: () => { var tmp=player2.position.y + playerSpeed;if(tmp>=(cubeH / 2)-(LPH/2)){player2.position.y=(cubeH / 2)-(LPH/2);}else{player2.position.y=tmp}player2BoundingBox.setFromObject(player2); },
    32:()=>{if(!gameOn && !isVideoPlaying){gameOn=!gameOn;firstMove(); start.play()}}  // DOWN arrow
};
*/
function handleKeyDown(event) {
    pressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    pressedKeys[event.keyCode] = false;
}

function handleKeyPress() {
    if (isVideoPlaying) return;
    for (const keyCode in pressedKeys) {
        if (pressedKeys[keyCode]) {
            const action = KeyActions[keyCode];
            if (action) {
                action();
            }
        }
    }
}


// Create a camera
const camera = new THREE.PerspectiveCamera(-50, window.innerWidth / window.innerHeight, 0.2, 8100);
camera.position.set(0, 0, -10);
camera.lookAt(0, 0, 0);
camera.rotateZ(0);

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/**
 * playground
 */
const cubeW = 10;
const cubeH = 6;
const cubeD = 2;
const CubeGeometry = new THREE.BoxGeometry(cubeW, cubeH, cubeD);
const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: "#3a85fc", transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: "#3a85fc", transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: "#212a38", transparent: true, opacity: 1, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, wireframe: true, side: THREE.DoubleSide })
];
const solidSquare = new THREE.Mesh(CubeGeometry, materials);
solidSquare.rotation.x += 0;
solidSquare.rotation.y += 0;
solidSquare.rotation.z -= 0;

/*
 *  pálka vlevo
 */
const LPW = 0.2;
const LPH = 1.3;
const LPD = 0.6;
const leftPods = new THREE.BoxGeometry(LPW, LPH, LPD);
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(P1);
const material = new THREE.MeshBasicMaterial({ map: texture });
const Lcube = new THREE.Mesh(leftPods, material);
const edgesGeometry = new THREE.EdgesGeometry(leftPods);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
var wireframe = new THREE.LineSegments(edgesGeometry, lineMaterial);
const player1 = new THREE.Group();
player1.position.x = -4.5;
player1.rotation.x += 0;
player1.rotation.y += 0;
player1.rotation.z += 0;
player1.add(Lcube);
player1.add(wireframe);

/*
 *  pálka vpravo
 */
const RPW = 0.2;
const RPH = 1.3;
const RPD = 0.5;
const rightPods = new THREE.BoxGeometry(RPW, RPH, RPD);
const RtextureLoader = new THREE.TextureLoader();
const Rtexture = RtextureLoader.load(P2);
const material2 = new THREE.MeshBasicMaterial({ map: Rtexture });
const cube2 = new THREE.Mesh(leftPods, material2);
const edgesGeometry2 = new THREE.EdgesGeometry(rightPods);
const lineMaterial2 = new THREE.LineBasicMaterial({ color: 0x000000 });
var wireframe2 = new THREE.LineSegments(edgesGeometry2, lineMaterial2);
const player2 = new THREE.Group();
player2.position.x = 4.5;
player2.rotation.x += 0;
player2.rotation.y += 0;
player2.rotation.z += 0;
player2.add(cube2);
player2.add(wireframe2);

/*
 *  míček
 */
const ballRadius = 0.30;
const ballSegments = 128;
const ballGeometry = new THREE.SphereGeometry(ballRadius, ballSegments, ballSegments);
const balltextureLoader = new THREE.TextureLoader();
const balltexture = balltextureLoader.load(B);
const ballMaterial = new THREE.MeshBasicMaterial({ map: balltexture });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(1, 0, 0);

const player1BoundingBox = new THREE.Box3().setFromObject(player1);
const player2BoundingBox = new THREE.Box3().setFromObject(player2);

// přidání do scény
scene.add(player1);
scene.add(solidSquare);
scene.add(player2);
scene.add(ball);

/*
 * Funkce pro kontrolu kolize pálky s míčkem
 */
function checkPaddleBallCollision(paddle, ball) {
    const paddleBox = new THREE.Box3().setFromObject(paddle);
    const ballBox = new THREE.Box3().setFromObject(ball);
    return paddleBox.intersectsBox(ballBox);
}

/*
 * Pohyb hráčů s kontrolou kolize - ZAKÁZÁN POHYB PŘI KOLIZI
 */
function movePlayer(player, direction, isPlayer1 = true) {
    const moveY = direction * playerSpeed;
    const newY = player.position.y + moveY;
    
    // Kontrola hranic hrací plochy
    if (newY <= -(cubeH / 2) + (LPH / 2) || newY >= (cubeH / 2) - (LPH / 2)) {
        return;
    }
    
    // Kontrola kolize s míčkem - ZAKÁZAT POHYB PŘI KOLIZI
    if (checkPaddleBallCollision(player, ball)) {
        return; // Žádný pohyb pokud je kolize
    }
    
    // Bezpečný pohyb
    player.position.y = newY;
    
    // Aktualizovat bounding box
    if (isPlayer1) {
        player1BoundingBox.setFromObject(player1);
    } else {
        player2BoundingBox.setFromObject(player2);
    }
}

const KeyActions = {
    87: () => movePlayer(player1, -1, true), // W key
    83: () => movePlayer(player1, 1, true),  // S key
    38: () => movePlayer(player2, -1, false), // UP arrow
    40: () => movePlayer(player2, 1, false),  // DOWN arrow
    32: () => { if (!gameOn) { gameOn = !gameOn; firstMove(); start.play(); } }  // SPACE
};






// Pohyb míčku
function firstMove() {
    var X = Math.random();
    var Y = Math.random();
    if (Y > 0.5) { ydir = true; }
    else if (Y < 0.5) { ydir = false; }
    else { firstMove(); }
    if (X > 0.5) { xdir = true; }
    else if (X < 0.5) { xdir = false; }
    else { firstMove(); }
    return ballSpeed * Math.random() * 2;
}

/*
 * Padnul gól
 */
//bod pro P1
function P2scores(){
    // Vytvoření obdélníku
    if(AI && P2Count<cap*0.8){fail.play();}

    isVideoPlaying = true; // 1. Okamžitě zamknout hru

    // 2. Zobrazit pozadí (ale je stále průhledné)
    backgroundOverlay.style.display = 'block';

    // 3. Spustit fade-in
    requestAnimationFrame(() => {
        backgroundOverlay.style.opacity = '0.8';
    });
    
    // 4. Počkat 1 sekundu
    setTimeout(() => {
        // 5. Spustit video a zvuk
        p2Video.style.display = 'block';
        p2Video.style.opacity = '1';
        p2Video.play();
        p2GoalAudio.play();
    }, 1000); // za jak dlouho se spustí video po zobrazování overlaye


    const GPrectangleGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.5);
    const GPrectangleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const GP = new THREE.Mesh(GPrectangleGeometry, GPrectangleMaterial);
    GP.position.set((cubeW / 2) - P2Count - 0.3, (cubeH / 2) + 0.3);
    P2Count += 0.8;
    gameOn = !gameOn;
    return GP;
}

//Bod pro P2
function P1scores(){
    // Vytvoření obdélníku
    if(AI && P1Count<cap*0.8){win.play();}


    isVideoPlaying = true; // 1. Okamžitě zamknout hru

    // 2. Zobrazit pozadí (ale je stále průhledné)
    backgroundOverlay.style.display = 'block';

    // 3. Spustit fade-in (změna opacity aktivuje CSS transition)
    // Používám 80% opacitu, 100% (hodnota '1') je příliš tmavá. Můžete změnit.
    requestAnimationFrame(() => { // (zajistí plynulý start animace)
        backgroundOverlay.style.opacity = '0.8'; 
    });

    // 4. Počkat 1 sekundu (1000ms), než se pozadí dokončí
    setTimeout(() => {
        // 5. Po dokončení fade-in spustit video a zvuk
        p1Video.style.display = 'block';
        p1Video.style.opacity = '1';
        p1Video.play();
        p1GoalAudio.play();
    }, 1000); // za jak dlouho se spustí video po zobrazování overlaye 




    const GPrectangleGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.5);
    const GPrectangleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const GP = new THREE.Mesh(GPrectangleGeometry, GPrectangleMaterial);
    GP.position.set((-cubeW / 2) + P1Count + 0.3, (-cubeH / 2) - 0.3);
    P1Count += 0.8;
    gameOn = !gameOn;
    return GP;
}

/*
 * pohyb Bota - TAKÉ ZAKÁZÁN POHYB PŘI KOLIZI
 */
function moveAI() {
    if (AI) {
        // Kontrola kolize s míčkem - ZAKÁZAT POHYB PŘI KOLIZI
        if (checkPaddleBallCollision(player2, ball)) {
            return;
        }
        
        let moveY = 0;
        if (ydir) {
            moveY = AIspeed;
        } else {
            moveY = -AIspeed;
        }
        
        const newY = player2.position.y + moveY;
        
        // Kontrola hranic
        if (newY + LPH / 2 >= cubeH / 2) {
            player2.position.y = (cubeH / 2) - LPH / 2 - 0.01;
        } else if (newY - LPH / 2 <= -cubeH / 2) {
            player2.position.y = (-cubeH / 2) + LPH / 2 + 0.01;
        } else {
            player2.position.y = newY;
        }
    }
    player2BoundingBox.setFromObject(player2);
}

/*
 * Detekce kolize s pálkou
 */
function detectPaddleCollision(paddleBox, ballBox, prevBallPos, paddleSide) {
    if (!paddleBox.intersectsBox(ballBox)) return false;

    const ballMovingRight = ball.position.x > prevBallPos.x;
    const ballMovingLeft = ball.position.x < prevBallPos.x;
    
    if (paddleSide === -1 && !ballMovingLeft) return false;
    if (paddleSide === 1 && !ballMovingRight) return false;

    return true;
}

// Zpracování kolize s pálkou - RANDOM ÚHEL 38-48°
function handlePaddleCollision(paddle, paddleSide) {
    //hit.play();
    playHitSound();

    // Vrať míček na pozici před kolizí
    ball.position.x -= (ballSpeed * (xdir ? 1 : -1));
    ball.position.y -= (yBallspeed * (ydir ? 1 : -1));
    
    // Změň směr X
    xdir = !xdir;
    
    // Náhodný úhel mezi 38-48 stupni (v radiánech)
    const minAngle = 38 * Math.PI / 180; // 38° v radiánech
    const maxAngle = 48 * Math.PI / 180; // 48° v radiánech
    const randomAngle = minAngle + Math.random() * (maxAngle - minAngle);
    
    // Přidej efekt podle toho, kde se míček dotkl pálky
    const relativeIntersectY = (paddle.position.y - ball.position.y) / (LPH / 2);
    const clampedRelativeIntersectY = Math.max(-1, Math.min(1, relativeIntersectY));
    
    // Použij náhodný úhel s vlivem pozice na pálce
    const bounceAngle = clampedRelativeIntersectY * randomAngle;
    
    // Uprav yBallspeed podle úhlu odrazu
    yBallspeed = Math.abs(Math.sin(bounceAngle) * ballSpeed);
    ydir = relativeIntersectY > 0;
    
    // Zvyš rychlost
    ballSpeed += 0.002;
    
    // Mírně posuň míček od pálky
    const pushDistance = 0.01;
    ball.position.x += pushDistance * paddleSide;
}

// Pomocná funkce pro reset hry
function resetGame() {
    player1.position.set(-4.5, 0, 0);
    player2.position.set(4.5, 0, 0);
    ball.position.set(0, 0, 0);
    ballSpeed = 0.05;
    yBallspeed = 0.05;
    firstMove();
}

/*
 *    Míček  a jeho odrazy
 */
function moveBall() {
    // Ulož aktuální pozici pro případ kolize
    const prevBallPos = {
        x: ball.position.x,
        y: ball.position.y
    };

    // pohyb míčku
    if (xdir) {
        ball.position.x += ballSpeed;
        if (ydir) {
            ball.position.y += yBallspeed;
        } else {
            ball.position.y -= yBallspeed;
        }
    } else {
        ball.position.x -= ballSpeed;
        if (ydir) {
            ball.position.y += yBallspeed;
        } else {
            ball.position.y -= yBallspeed;
        }
    }

    // GOAL!!!
    if ((ball.position.x + (1.1*ballRadius)) >= (cubeW / 2)) {
        scene.add(P1scores());
        if (P1Count >= cap * 0.8) { endgame = true; over.play(); }
        resetGame();
        return;
    }
    if ((ball.position.x - (1.1*ballRadius)) <= -(cubeW / 2)) {
        scene.add(P2scores());
        if (P2Count >= cap * 0.8) { endgame = true; over.play(); }
        resetGame();
        return;
    }

    moveAI();

    // Aktualizuj bounding boxy
    player1BoundingBox.setFromObject(player1);
    player2BoundingBox.setFromObject(player2);
    const ballBoundingBox = new THREE.Box3().setFromObject(ball);

    // Detekce kolize s horní/dolní stěnou
    if ((ball.position.y + ballRadius) >= (cubeH / 2)) {
        ball.position.y = prevBallPos.y;
        //hit.play();
        playHitSound();
        ydir = false;
    } else if ((ball.position.y - ballRadius) <= -(cubeH / 2)) {
        ball.position.y = prevBallPos.y;
        //hit.play();
        playHitSound();
        ydir = true;
    }

    // Detekce kolize s pálkami
    if (detectPaddleCollision(player1BoundingBox, ballBoundingBox, prevBallPos, -1)) {
        handlePaddleCollision(player1, -1);
    } else if (detectPaddleCollision(player2BoundingBox, ballBoundingBox, prevBallPos, 1)) {
        handlePaddleCollision(player2, 1);
    }
}

/* řízení a naslouchání inputu a outputu */
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
});

// Detekce stisknutí a puštění kláves
window.addEventListener('keydown', handleKeyDown, false);
window.addEventListener('keyup', handleKeyUp, false);


// Nový kód:
function onVideoEnd(videoElement) {
    videoElement.style.display = 'none'; // Skrýt video
    videoElement.fadeStarted = false;    // <-- PŘIDAT: Reset vlajky
    videoElement.currentTime = 0;
    
    // PŘIDÁNO:
    backgroundOverlay.style.display = 'none'; // Okamžitě skrýt pozadí
    backgroundOverlay.style.opacity = '0';   // Resetovat opacitu pro příští gól

    isVideoPlaying = false;             // Odemknout hru
}

p1Video.addEventListener('ended', () => onVideoEnd(p1Video));
p2Video.addEventListener('ended', () => onVideoEnd(p2Video));

function animate() {
    requestAnimationFrame(animate);
    if (endgame) {
        if (P1Count > P2Count) {
            window.location.href = '/P1win.html';
        } else {
            window.location.href = '/P2win.html';
        }
    } else if (!gameOn) {
        renderer.render(scene, camera);
        handleKeyPress();
    } else {
        ball.rotateX(0.04);
        ball.rotateY(0.032);
        handleKeyPress();
        moveBall();
        // Render the scene
        renderer.render(scene, camera);
    }
}

// NOVÁ FUNKCE: Spustí se mnohokrát za sekundu během přehrávání videa
function handleTimeUpdate(event) {
    const video = event.target;
    
    // Doba, kdy má fade-out začít (1 sekunda před koncem)
    // Používáme 1.1 pro jistotu, aby se stihlo spustit
    const fadeStartTime = video.duration - 1.1; 

    // Spustit pouze pokud video dosáhlo času a pokud jsme fade ještě nespustili
    if (video.currentTime >= fadeStartTime && !video.fadeStarted) {
        
        video.fadeStarted = true; // Značka, abychom to nespustili 20x
        
        // Spustit synchronizovaný fade-out
        video.style.opacity = '0';
        backgroundOverlay.style.opacity = '0';
    }
}

// NOVÉ POSLUCHAČE: Připojení funkce k videím
p1Video.addEventListener('timeupdate', handleTimeUpdate);
p2Video.addEventListener('timeupdate', handleTimeUpdate);

// Render the scene
animate();
