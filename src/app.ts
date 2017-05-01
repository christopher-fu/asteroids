import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, SphereGeometry,
         MeshLambertMaterial, PointLight, BoxGeometry, Vector3, Euler,
         Geometry, Face3, MeshBasicMaterial, DoubleSide, DirectionalLight,
         FaceColors } from 'three';
import Stats = require('stats.js');

class App {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private viewAngle: number = 45;
  private aspect: number;
  private scene: Scene;
  private isKeyDown: { [key: string]: boolean };
  private velocity: Vector3;
  private stats: Stats;
  private debugMode: boolean;

  private readonly WIDTH = 1024;
  private readonly HEIGHT = 768;

  private readonly KEY_W = 'KeyW';
  private readonly KEY_A = 'KeyA';
  private readonly KEY_S = 'KeyS';
  private readonly KEY_D = 'KeyD';
  private readonly KEY_Q = 'KeyQ';
  private readonly KEY_E = 'KeyE';
  private readonly KEY_X = 'KeyX';
  private readonly KEY_R = 'KeyR';
  private readonly KEY_SPC = 'Space';
  private readonly KEY_LSHIFT = 'ShiftLeft';
  private readonly KEY_BACKQUOTE = 'Backquote';

  private readonly MAX_VELOCITY = 1;

  constructor(container: HTMLElement) {
    this.aspect = this.WIDTH / this.HEIGHT;
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera(this.viewAngle, this.aspect);
    this.scene = new Scene();
    this.scene.add(this.camera);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);

    container.appendChild(this.renderer.domElement);

    this.isKeyDown = {};
    this.velocity = new Vector3(0, 0, 0);

    this.stats = new Stats();
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
      case this.KEY_BACKQUOTE:
        this.debugMode = !this.debugMode;
        console.log('Debug mode', this.debugMode);
        break;
      case this.KEY_R:
        if (this.debugMode) {
          const rot = this.camera.rotation;
          rot.set(rot.x, rot.y, 0);
        }
        break;
      }
    };

    this.addObjects();
    this.draw();
  }

  private addObjects() {
    // const RADIUS = 50;
    // const SEGMENTS = 16;
    // const RINGS = 16;
    const material = new MeshLambertMaterial({ color: 0xcc0000 });
    // const sphere = new Mesh(new SphereGeometry(RADIUS, SEGMENTS, RINGS), material);
    // sphere.position.z = -300;
    // this.scene.add(sphere);

    const geometry = new BoxGeometry(1, 1, 1);
    let cube = new Mesh(geometry, material);
    cube.position.z = -5;
    cube.position.y = -0.5;
    this.scene.add(cube);

    cube = new Mesh(geometry, new MeshLambertMaterial({ color: 0xffff00 }));
    cube.position.x = -1;
    cube.position.y = 0.5;
    cube.position.z = -10;
    this.scene.add(cube);

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
    spaceship.rotateX(30 * Math.PI / 180);
    spaceship.position.z = -1.5;
    spaceship.position.y = -0.6;
    this.camera.add(spaceship);

    const pointLight = new PointLight(0xffffff);
    pointLight.position.x = 0;
    pointLight.position.y = 100;
    pointLight.position.z = 130;
    this.scene.add(pointLight);

    const dirLight = new DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, 1, -1);
    this.scene.add(dirLight);
  }

  private updateCameraRotation(): Vector3 {
    const rotRate = 0.02;
    const rot = new Vector3(0, 0, 0);
    if (this.isKeyDown[this.KEY_W]) {
      rot.x += rotRate;
    }
    if (this.isKeyDown[this.KEY_S]) {
      rot.x -= rotRate;
    }
    if (this.isKeyDown[this.KEY_A]) {
      rot.y += rotRate;
    }
    if (this.isKeyDown[this.KEY_D]) {
      rot.y -= rotRate;
    }
    if (this.isKeyDown[this.KEY_E]) {
      rot.z += rotRate;
    }
    if (this.isKeyDown[this.KEY_Q]) {
      rot.z -= rotRate;
    }
    return rot;
  }

  private updateCameraVelocity() {
    if (this.debugMode) {
      let vel = 0;
      const velRate = 0.1;
      if (this.isKeyDown[this.KEY_SPC]) {
        vel += velRate;
      }
      if (this.isKeyDown[this.KEY_LSHIFT]) {
        vel -= velRate;
      }
      this.velocity = this.getLookAt().normalize().multiplyScalar(vel);
      return;
    }

    if (this.isKeyDown[this.KEY_X]) {
      this.velocity = new Vector3(0, 0, 0);
      return;
    }
    const accelRate = 0.001;
    let accel = 0;
    if (this.isKeyDown[this.KEY_SPC]) {
      accel += accelRate;
    }
    if (this.isKeyDown[this.KEY_LSHIFT]) {
      accel -= accelRate;
    }
    if (accel === 0) { return; }
    const accelV = this.getLookAt().multiplyScalar(accel);
    this.velocity.add(accelV);
    if (this.velocity.length() > this.MAX_VELOCITY) {
      this.velocity.normalize().multiplyScalar(this.MAX_VELOCITY);
    }
  }

  private getLookAt(): Vector3 {
    return (new Vector3(0, 0, -1)).applyQuaternion(this.camera.quaternion);
  }

  private draw() {
    this.stats.begin();

    this.renderer.render(this.scene, this.camera);

    const rot = this.updateCameraRotation();
    this.camera.rotateX(rot.x);
    this.camera.rotateY(rot.y);
    this.camera.rotateZ(rot.z);
    this.updateCameraVelocity();

    this.camera.position.add(this.velocity);

    this.stats.end();
    requestAnimationFrame(this.draw.bind(this));
  }
}

document.body.onload = () => {
  const container = document.getElementById('container');
  const app = new App(container);
};
