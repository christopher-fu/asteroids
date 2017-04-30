import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, SphereGeometry,
         MeshLambertMaterial, PointLight, BoxGeometry, Vector3, Euler } from 'three';
import Stats = require('stats.js');

class App {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private viewAngle: number = 45;
  private aspect: number;
  private scene: Scene;
  private cube: Mesh;
  private isKeyDown: { [key: number]: boolean };
  private velocity: Vector3;
  private stats: Stats;

  private readonly WIDTH = 1024;
  private readonly HEIGHT = 768;

  private readonly KEY_W = 87;
  private readonly KEY_A = 65;
  private readonly KEY_S = 83;
  private readonly KEY_D = 68;
  private readonly KEY_Q = 81;
  private readonly KEY_E = 69;
  private readonly KEY_SPC = 32;
  private readonly KEY_LSHIFT = 16;

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
      this.isKeyDown[ev.keyCode] = true;
    };

    document.onkeyup = (ev) => {
      this.isKeyDown[ev.keyCode] = false;
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
    this.cube = new Mesh(geometry, material);
    this.cube.position.z = -5;
    this.cube.position.y = -0.5;
    this.scene.add(this.cube);

    const cube = new Mesh(geometry, new MeshLambertMaterial({ color: 0xffff00 }));
    cube.position.x = -1;
    cube.position.y = 0.5;
    cube.position.z = -10;
    this.scene.add(cube);

    const pointLight = new PointLight(0xffffff);
    pointLight.position.x = 0;
    pointLight.position.y = 100;
    pointLight.position.z = 130;
    this.scene.add(pointLight);
  }

  private updateCameraRotation(): Vector3 {
    const rot = new Vector3(0, 0, 0);
    if (this.isKeyDown[this.KEY_W]) {
      rot.x += 0.01;
    }
    if (this.isKeyDown[this.KEY_S]) {
      rot.x -= 0.01;
    }
    if (this.isKeyDown[this.KEY_A]) {
      rot.y += 0.01;
    }
    if (this.isKeyDown[this.KEY_D]) {
      rot.y -= 0.01;
    }
    if (this.isKeyDown[this.KEY_E]) {
      rot.z += 0.01;
    }
    if (this.isKeyDown[this.KEY_Q]) {
      rot.z -= 0.01;
    }
    return rot;
  }

  private updateCameraVelocity() {
    let accel = 0;
    if (this.isKeyDown[this.KEY_SPC]) {
      accel += 0.001;
    }
    if (this.isKeyDown[this.KEY_LSHIFT]) {
      accel -= 0.001;
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
