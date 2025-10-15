import * as THREE from 'three';


/** Vítejte v Pongu **/

/*
 *   Nastavení dat z menu
 */
const playerSpeed=0.05;
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
var cap = 13;
var P1 = "media/img/fire.jpg";
var P2 = "media/img/ice.jpg";
var B = "media/img/melone.jpg"
if(params.cap){cap = parseInt(params.cap);}
if(params.P1){P1 = params.P1;}
if(params.P2){P2 = params.P2;}
if(params.Ball){B = params.Ball;}
var AI=false
var AIspeed=playerSpeed;
console.log(cap);
if(params.AI){AI = true;AIspeed=parseFloat(params.AIspeed)}
/*
 *   Načtení zvuků tvorba objektů a skinů
 */

const over = new Howl({
    src: ['media/sound/over.wav'],
    volume: 1,
    html5: true,
    // preload: true,
});
const hit = new Howl({
    src: ['media/sound/hit.wav'],
    volume: 0.5,
    html5: true,
    // preload: true,
});
const fail = new Howl({
    src: ['media/sound/fail.mp3'],
    volume: 1,
    html5: true,
    // preload: true,
});
const start = new Howl({
    src: ['media/sound/start.mp3'],
    volume: 1,
    html5: true,
    // preload: true,
});
const win = new Howl({
    src: ['media/sound/win.mp3'],
    volume: 1,
    html5: true,
    // preload: true,
});
// Create a scene
const scene = new THREE.Scene();
var endgame=false;
var xdir=false;
var ydir=false;
var P1Count=0;
var P2Count=0;
var gameOn=false;
var yBallspeed=0.06;
var ballSpeed = 0.06;
const pressedKeys = {};
const KeyActions = {
    87: () => { var tmp=player1.position.y - playerSpeed;if(tmp<=-(cubeH / 2)+(LPH/2)){player1.position.y=-(cubeH / 2)+(LPH/2);}else{player1.position.y=tmp}player1BoundingBox.setFromObject(player1);}, // W key
    83: () => { var tmp=player1.position.y + playerSpeed;if(tmp>=(cubeH / 2)-(LPH/2)){player1.position.y=(cubeH / 2)-(LPH/2);}else{player1.position.y=tmp}player1BoundingBox.setFromObject(player1);}, // S key
    38: () => { var tmp=player2.position.y - playerSpeed;if(tmp<=-(cubeH / 2)+(LPH/2)){player2.position.y=-(cubeH / 2)+(LPH/2);}else{player2.position.y=tmp}player2BoundingBox.setFromObject(player2); }, // UP arrow
    40: () => { var tmp=player2.position.y + playerSpeed;if(tmp>=(cubeH / 2)-(LPH/2)){player2.position.y=(cubeH / 2)-(LPH/2);}else{player2.position.y=tmp}player2BoundingBox.setFromObject(player2); },
    32:()=>{if(!gameOn){gameOn=!gameOn;firstMove(); start.play()}}  // DOWN arrow
};
function handleKeyDown(event) {
    pressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    pressedKeys[event.keyCode] = false;
}

function handleKeyPress() {
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
// camera.position.set(0, 5,-10);
camera.position.set(0, 0,-10);
camera.lookAt(0,0,0);
camera.rotateZ(0);


// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/**
 * playground
 */

// Create a square area around the cube
const cubeW=10;
const cubeH=6;
const cubeD=2;
const CubeGeometry = new THREE.BoxGeometry(cubeW, cubeH, cubeD);
// Create a multimaterial for the square's surface
const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2, side: THREE.DoubleSide  }), // Right side
    new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.2, side: THREE.DoubleSide  }), // Left side
    new THREE.MeshBasicMaterial({ color: "#3a85fc", transparent: true, opacity: 0.5, side: THREE.DoubleSide  }), // Top side
    new THREE.MeshBasicMaterial({ color: "#3a85fc", transparent: true, opacity: 0.5, side: THREE.DoubleSide }), // Bottom side
    new THREE.MeshBasicMaterial({ color: "#212a38", transparent: true, opacity: 1, side: THREE.DoubleSide  }), // Front side
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, wireframe: true, side: THREE.DoubleSide})  // Back side
  ];
// Create the solid part of the square
const solidSquare = new THREE.Mesh(CubeGeometry,materials);
solidSquare.rotation.x += 0;
solidSquare.rotation.y += 0;
solidSquare.rotation.z -= 0;


/*
 *  pálka vlevo
*/

// Create a small rectangle
const LPW=0.2;
const LPH=1.3;
const LPD=0.6;
const leftPods = new THREE.BoxGeometry(LPW, LPH, LPD);
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(P1);
const material = new THREE.MeshBasicMaterial( {map: texture}); //color: 0xD351D5
const Lcube = new THREE.Mesh(leftPods, material);
const edgesGeometry = new THREE.EdgesGeometry(leftPods);
const lineMaterial = new THREE.LineBasicMaterial({color: 0x000000});
var wireframe = new THREE.LineSegments(edgesGeometry,lineMaterial);
const player1 = new THREE.Group();
player1.position.x=-4.5
player1.rotation.x += 0;
player1.rotation.y += 0;
player1.rotation.z += 0;
player1.add(Lcube);
player1.add(wireframe);

/*
 *  pálka vpravo
*/

// Create a small rectangle
const RPW=0.2;
const RPH=1.3;
const RPD=0.5;
const rightPods = new THREE.BoxGeometry(RPW, RPH, RPD);
const RtextureLoader = new THREE.TextureLoader();
const Rtexture = RtextureLoader.load(P2);
const material2 = new THREE.MeshBasicMaterial( {map: Rtexture}); //color: 0xD351D5
const cube2 = new THREE.Mesh(leftPods, material2);
const edgesGeometry2 = new THREE.EdgesGeometry(rightPods);
const lineMaterial2 = new THREE.LineBasicMaterial({color: 0x000000});
var wireframe2 = new THREE.LineSegments(edgesGeometry2,lineMaterial2);
const player2 = new THREE.Group();
player2.position.x=4.5;
player2.rotation.x += 0;
player2.rotation.y += 0;
player2.rotation.z += 0;
player2.add(cube2);
player2.add(wireframe2);

/*
 *  míček
*/
// Create a ball (sphere)
const ballRadius = 0.30;
const ballSegments = 128;
const ballGeometry = new THREE.SphereGeometry(ballRadius, ballSegments, ballSegments);
const balltextureLoader = new THREE.TextureLoader();
const balltexture = balltextureLoader.load(B);
// const balltexture = RtextureLoader.load('melone.avif');
const ballMaterial = new THREE.MeshBasicMaterial({ map:balltexture }); // Green color
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(1,0,0);

const player1BoundingBox = new THREE.Box3().setFromObject(player1);
const player2BoundingBox = new THREE.Box3().setFromObject(player2);

//přidání do scény
scene.add(player1);
scene.add(solidSquare);
scene.add(player2);
scene.add(ball);

// Pohyb míčku
function firstMove(){
    var X=Math.random();
    var Y=Math.random();
    if (Y>0.5){ydir=true}
    else if(Y<0.5){ydir=false}
    else{firstMove()}
    if (X>0.5){xdir=true}
    else if(X<0.5){xdir=false}
    else{firstMove()}
    return ballSpeed*Math.random()*2;
}
/*
 * Padnul gól
 */
//bod pro P1
function P2scores(){
    // Vytvoření obdélníku
    if(AI && P2Count<cap*0.8){fail.play();}
    const GPrectangleGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.5);
    const GPrectangleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const GP = new THREE.Mesh(GPrectangleGeometry, GPrectangleMaterial);
    GP.position.set((cubeW/2)-P2Count-0.3,(cubeH/2)+0.3);
    P2Count+=0.8;
    gameOn=!gameOn;
    return GP;
}
//Bod pro P2
function P1scores(){
    // Vytvoření obdélníku
    if(AI && P1Count<cap*0.8){win.play();}
    const GPrectangleGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.5);
    const GPrectangleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const GP = new THREE.Mesh(GPrectangleGeometry, GPrectangleMaterial);
    GP.position.set((-cubeW/2)+P1Count+0.3,(-cubeH/2)-0.3);
    P1Count+=0.8;
    gameOn=!gameOn;
    return GP;
}
/*
 * pohyb Bota
 */
function moveAI(){
    if(AI){
        if(ydir){
            player2.position.y+=AIspeed;
            if(player2.position.y+LPH/2  >= cubeH/2){
                player2.position.y= (cubeH/2)-LPH/2 -0.01;
            }
        }else{
            player2.position.y-=AIspeed;
            if(player2.position.y-LPH/2 <= -cubeH/2){
                player2.position.y= (-cubeH/2)+LPH/2 +0.01;
            }
        }
    }
    player2BoundingBox.setFromObject(player2);
}

/*
 *    Míček  a jeho odrazy
 */
function moveBall() {

    //pohyb míčku
    if(xdir){
    ball.position.x+=ballSpeed;
        if(ydir){
    ball.position.y+=yBallspeed;
        }else{
            ball.position.y-=yBallspeed
        }
    }else{
        ball.position.x-=ballSpeed;
        if(ydir){
            ball.position.y+=yBallspeed;
                }else{
                    ball.position.y-=yBallspeed
                }
    }
    //GOAL!!!
    if((ball.position.x+(ballRadius/2))>=(cubeW/2)){
        scene.add(P1scores());
        if(P1Count>=cap*0.8){endgame=true;over.play();}
        player1.position.set(-4.5,0,0);
        player2.position.set(4.5,0.0);
        ball.position.set(0,0,0);
        ballSpeed=0.05;
        yBallspeed=0.05;
        firstMove();
    }
    if((ball.position.x-(ballRadius/2))<=-(cubeW/2)){
        scene.add(P2scores());
        if(P2Count>=cap*0.8){endgame=true; over.play(); }
        player1.position.set(-4.5,0,0);
        player2.position.set(4.5,0.0);
        ball.position.set(0,0,0);
        ballSpeed=0.05;
        yBallspeed=0.05;;
        firstMove();
    }
    moveAI();

    //kontrola kolize s pálkou
    /**
     * Tady je potřeba vyřešit kolizi se spodní stranou pálky
     */
    if(player2BoundingBox.intersectsBox(new THREE.Box3().setFromObject(ball))) {
        ball.position.x-=ballSpeed;
        hit.play();
        ballSpeed+=0.002;
        yBallspeed+=0.002;
        xdir=!xdir;
    }else if (player1BoundingBox.intersectsBox(new THREE.Box3().setFromObject(ball))) {
        ball.position.x+=ballSpeed;
        hit.play();
        ballSpeed+=0.002;
        yBallspeed+=0.002;
        xdir=!xdir
    }else if((ball.position.y+(ballRadius/2))>=(cubeH/2)){
        hit.play();
        ydir=!ydir;
    }else if((ball.position.y-(ballRadius/2))<=-(cubeH/2)){
        hit.play();
        ydir=!ydir
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

function animate() {
    requestAnimationFrame(animate);
    if(endgame){
        if(P1Count>P2Count){
            window.location.href = '/P1win.html';
        }else{
            window.location.href = '/P2win.html';
        }
    }else if(!gameOn){
        renderer.render(scene, camera);
        handleKeyPress();

    }else{
    ball.rotateX(0.04);
    ball.rotateY(0.032);
    handleKeyPress();
    moveBall();
    // Render the scene
    renderer.render(scene, camera);
  }
}
animate();
// Render the scene
