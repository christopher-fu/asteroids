import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, SphereGeometry,
         MeshLambertMaterial, PointLight, BoxGeometry } from 'three';

class App {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private viewAngle: number = 45;
  private aspect: number;
  private readonly WIDTH = 1024;
  private readonly HEIGHT = 768;
  private scene: Scene;
  private cube: Mesh;
  private isKeyDown: { [key: number]: boolean };

  private readonly KEY_W = 87;
  private readonly KEY_A = 65;
  private readonly KEY_S = 83;
  private readonly KEY_D = 68;
  private readonly KEY_Q = 81;
  private readonly KEY_E = 69;

  constructor(container: HTMLElement) {
    this.aspect = this.WIDTH / this.HEIGHT;
    this.renderer = new WebGLRenderer();
    this.camera = new PerspectiveCamera(this.viewAngle, this.aspect);
    this.scene = new Scene();
    this.scene.add(this.camera);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);

    container.appendChild(this.renderer.domElement);

    this.isKeyDown = {};

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

    const pointLight = new PointLight(0xffffff);
    pointLight.position.x = 0;
    pointLight.position.y = 100;
    pointLight.position.z = 130;
    this.scene.add(pointLight);
  }

  private draw() {
    this.renderer.render(this.scene, this.camera);
    if (this.isKeyDown[this.KEY_W]) {
      this.camera.rotation.x += 0.01;
    }
    if (this.isKeyDown[this.KEY_S]) {
      this.camera.rotation.x -= 0.01;
    }
    if (this.isKeyDown[this.KEY_A]) {
      this.camera.rotation.y += 0.01;
    }
    if (this.isKeyDown[this.KEY_D]) {
      this.camera.rotation.y -= 0.01;
    }
    if (this.isKeyDown[this.KEY_E]) {
      this.camera.rotation.z += 0.01;
    }
    if (this.isKeyDown[this.KEY_Q]) {
      this.camera.rotation.z -= 0.01;
    }
    requestAnimationFrame(this.draw.bind(this));
  }
}

document.body.onload = () => {
  console.log('hello world!');
  const container = document.getElementById('container');
  const app = new App(container);
};
