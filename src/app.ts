import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, MeshLambertMaterial,
         PointLight, Vector3, Geometry, Face3, DoubleSide, DirectionalLight,
         FaceColors, Box3 } from 'three';
import Stats = require('stats.js');
import { Entity, Shot, Asteroid } from './entity';
import KdTree = require('kd-tree');

class App {
  private static readonly WIDTH = 1024;
  private static readonly HEIGHT = 768;
  private static readonly DRAW_DISTANCE = 100;

  private static readonly KEY_W = 'KeyW';
  private static readonly KEY_A = 'KeyA';
  private static readonly KEY_S = 'KeyS';
  private static readonly KEY_D = 'KeyD';
  private static readonly KEY_Q = 'KeyQ';
  private static readonly KEY_E = 'KeyE';
  private static readonly KEY_X = 'KeyX';
  private static readonly KEY_R = 'KeyR';
  private static readonly KEY_F = 'KeyF';
  private static readonly KEY_P = 'KeyP';
  private static readonly KEY_SPC = 'Space';
  private static readonly KEY_LSHIFT = 'ShiftLeft';
  private static readonly KEY_BACKQUOTE = 'Backquote';

  private static readonly ASPECT = App.WIDTH / App.HEIGHT;
  private static readonly VIEW_ANGLE = 45;

  private static distanceFn(a: Entity, b: Entity): number {
    return Math.sqrt((a.x - b.x) ** 2 +
                     (a.y - b.y) ** 2 +
                     (a.z - b.z) ** 2);
  }

  private renderer = new WebGLRenderer({ antialias: true });
  private camera = new PerspectiveCamera(App.VIEW_ANGLE, App.ASPECT);
  private scene = new Scene();

  private isKeyDown: { [key: string]: boolean } = {};
  private velocity = new Vector3(0, 0, 0);
  private stats = new Stats();
  private debugMode: boolean;
  private shots: Shot[] = [];
  private asteroidKdt = new KdTree.kdTree<Entity>([], App.distanceFn, ['x', 'y', 'z']);
  private asteroids: Asteroid[] = [];
  private canFireShot: boolean = true;
  private shotCooldown = 500;
  private rotRate = 0.02;
  private velRate = 0.1;
  private accelRate = 0.001;
  private maxVel = 0.3;
  private shotVel = 0.4;
  private spaceship: Mesh;
  // private ssRotAng: number;

  constructor(container: HTMLElement) {
    this.scene.add(this.camera);
    this.renderer.setSize(App.WIDTH, App.HEIGHT);

    container.appendChild(this.renderer.domElement);

    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    // Set up keyboard controls
    document.onkeydown = (ev) => {
      this.isKeyDown[ev.code] = true;
    };

    document.onkeyup = (ev) => {
      this.isKeyDown[ev.code] = false;
    };

    document.onkeypress = (ev) => {
      switch (ev.code) {
      case App.KEY_BACKQUOTE:
        this.debugMode = !this.debugMode;
        console.log('Debug mode', this.debugMode);
        break;
      case App.KEY_R:
        if (this.debugMode) {
          const rot = this.camera.rotation;
          rot.set(rot.x, rot.y, 0);
        }
        break;
      case App.KEY_P:
        console.log('camera', this.camera.position);
        console.log((new Vector3(0, -1, 0)).applyMatrix4(this.camera.matrixWorld));
        const v = new Vector3(0, -1, 0);
        console.log(this.camera.localToWorld(v));
        console.log(v);
        break;
      }
    };

    this.addObjects();
  }

  public draw() {
    this.stats.begin();
    this.renderer.render(this.scene, this.camera);

    this.updateCameraRotation();
    this.updateCameraVelocity();
    this.camera.position.add(this.velocity);

    if (this.asteroids.length !== this.asteroidKdt.items().length) {
      console.error('error!');
    }
    this.updateAsteroidPositions();
    if (this.asteroids.length !== this.asteroidKdt.items().length) {
      console.error('error!');
    }

    this.fireShot();
    this.checkForCollisions();

    this.stats.end();
    requestAnimationFrame(this.draw.bind(this));
  }

  private addObjects() {
    const ast = new Asteroid(1, 0xf442e5, new Vector3(0, -0.5, -5), new Vector3(0, 0, -0.02));
    this.scene.add(ast.mesh);
    this.asteroidKdt.insert(ast);
    this.asteroids.push(ast);

    // ast = new Asteroid(1, 0xf532ab, new Vector3(-1, 0.5, -10), new Vector3());
    // this.scene.add(ast.mesh);
    // this.asteroidKdt.insert(ast);
    // this.asteroids.push(ast);

    // Spaceship
    const ssGeom = new Geometry();
    ssGeom.vertices = [
      new Vector3(-0.5, -0.5, 0),
      new Vector3(-0.5, 0.5, 0),
      new Vector3(0.5, 0.5, 0),
      new Vector3(0.5, -0.5, 0),
      new Vector3(0, 0, 1)
    ];
    ssGeom.faces = [
      new Face3(0, 1, 2),
      new Face3(0, 2, 3),
      new Face3(1, 0, 4),
      new Face3(2, 1, 4),
      new Face3(3, 2, 4),
      new Face3(0, 3, 4)
    ];
    ssGeom.computeFaceNormals();
    ssGeom.computeVertexNormals();
    ssGeom.scale(0.4, 0.25, -0.5);
    ssGeom.faces[0].color.setHex(0xff0000);
    ssGeom.faces[1].color.setHex(0xff0000);
    ssGeom.faces[3].color.setHex(0x00ff00);
    const spaceship = new Mesh(ssGeom, new MeshLambertMaterial({
      color: 0xffffff,
      vertexColors: FaceColors,
      side: DoubleSide
    }));
    spaceship.position.z = -1.5;
    spaceship.position.y = -0.6;
    // this.ssRotAng = 10 * Math.PI / 180;
    // spaceship.rotateX(this.ssRotAng);
    this.camera.add(spaceship);
    this.spaceship = spaceship;

    const pointLight = new PointLight(0xffffff);
    pointLight.position.x = 0;
    pointLight.position.y = 100;
    pointLight.position.z = 130;
    this.scene.add(pointLight);

    const dirLight = new DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, 1, -1);
    this.scene.add(dirLight);

    this.camera.updateMatrixWorld(true);
    this.spaceship.updateMatrixWorld(true);
  }

  private updateCameraRotation() {
    const rot = new Vector3(0, 0, 0);
    if (this.isKeyDown[App.KEY_W]) {
      rot.x += this.rotRate;
    }
    if (this.isKeyDown[App.KEY_S]) {
      rot.x -= this.rotRate;
    }
    if (this.isKeyDown[App.KEY_A]) {
      rot.y += this.rotRate;
    }
    if (this.isKeyDown[App.KEY_D]) {
      rot.y -= this.rotRate;
    }
    if (this.isKeyDown[App.KEY_E]) {
      rot.z -= this.rotRate;
    }
    if (this.isKeyDown[App.KEY_Q]) {
      rot.z += this.rotRate;
    }
    this.camera.rotateX(rot.x);
    this.camera.rotateY(rot.y);
    this.camera.rotateZ(rot.z);
  }

  private updateCameraVelocity() {
    if (this.debugMode) {
      let vel = 0;
      if (this.isKeyDown[App.KEY_F]) {
        vel += this.velRate;
      }
      if (this.isKeyDown[App.KEY_LSHIFT]) {
        vel -= this.velRate;
      }
      this.velocity = this.getLookAt().normalize().multiplyScalar(vel);
      return;
    }

    if (this.isKeyDown[App.KEY_X]) {
      this.velocity = new Vector3(0, 0, 0);
      return;
    }
    let accel = 0;
    if (this.isKeyDown[App.KEY_F]) {
      accel += this.accelRate;
    }
    if (this.isKeyDown[App.KEY_LSHIFT]) {
      accel -= this.accelRate;
    }
    if (accel === 0) { return; }
    const accelV = this.getLookAt().multiplyScalar(accel);
    this.velocity.add(accelV);
    if (this.velocity.length() > this.maxVel) {
      this.velocity.normalize().multiplyScalar(this.maxVel);
    }
  }

  private getLookAt(): Vector3 {
    return (new Vector3(0, 0, -1)).applyQuaternion(this.camera.quaternion);
  }

  private checkForCollisions() {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const shot = this.shots[i];
      // Remove shot if it is >= DRAW_DISTANCE away
      if (shot.mesh.position.distanceTo(this.camera.position) >= App.DRAW_DISTANCE) {
        this.shots.splice(i, 1);
        this.scene.remove(shot.mesh);
        continue;
      }
      shot.pos = shot.pos.add(shot.vel);
      // Check for 10 closest asteroids in kd-tree
      const nearestAsts = this.asteroidKdt.nearest(shot, 10).map((x) => x[0]);
      for (const a of nearestAsts) {
        const ast = a as Asteroid;
        const astBox = new Box3().setFromObject(ast.mesh);
        const shotBox = new Box3().setFromObject(shot.mesh);
        if (astBox.intersectsBox(shotBox)) {
          console.log('Collision', ast, shot);

          this.scene.remove(ast.mesh);

          const [ast1, ast2] = ast.split();
          const index = this.asteroids.indexOf(ast);
          if (index === -1) {
            console.log('error!');
          }
          this.asteroids.splice(index, 1);
          const l1 = this.asteroidKdt.items().length;
          this.asteroidKdt.remove(ast);
          const l2 = this.asteroidKdt.items().length;
          if (l2 !== l1 - 1) {
            console.error('error!');
          }
          this.asteroids.push(ast1, ast2);
          this.asteroidKdt.insert(ast1);
          this.asteroidKdt.insert(ast2);

          this.scene.add(ast1.mesh);
          this.scene.add(ast2.mesh);

          this.shots.splice(i, 1);
          this.scene.remove(shot.mesh);

          console.log(this.asteroids.length);
          console.log(this.asteroidKdt.items().length);

          break;
        }
      }
    }
  }

  private updateAsteroidPositions() {
    for (const ast of this.asteroids) {
      this.asteroidKdt.remove(ast);
      ast.pos = ast.pos.clone().add(ast.vel);
      this.asteroidKdt.insert(ast);
    }
  }

  private fireShot() {
    if (this.isKeyDown[App.KEY_SPC] && this.canFireShot) {
      console.log('Firing shot');
      this.camera.updateMatrixWorld(true);
      this.spaceship.updateMatrixWorld(true);

      const pos = (new Vector3(0, -0.6, -1.5)).add(new Vector3(0, 0, -0.5));
      const shot = new Shot(this.camera.localToWorld(pos), this.getLookAt().normalize().multiplyScalar(this.shotVel));
      this.shots.push(shot);
      this.scene.add(shot.mesh);
      this.canFireShot = false;
      setTimeout(() => this.canFireShot = true, this.shotCooldown);
    }
  }
}

document.body.onload = () => {
  const container = document.getElementById('container');
  if (container) {
    const app = new App(container);
    app.draw();
  }
};
