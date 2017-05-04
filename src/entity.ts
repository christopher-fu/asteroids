import {
  Vector3, Mesh, SphereGeometry, MeshLambertMaterial,
  MeshStandardMaterial
} from 'three';
import { sphereTextures } from './textureloader';

export class Entity {
  public mesh: Mesh;
  public vel: Vector3;

  private _pos: Vector3;

  // Super hack!
  private _x: number;
  private _y: number;
  private _z: number;

  constructor(pos: Vector3, vel: Vector3) {
    this.pos = pos;
    this.vel = vel;
  }

  get pos(): Vector3 {
    return this._pos;
  }

  set pos(p: Vector3) {
    this._pos = p;
    this._x = p.x;
    this._y = p.y;
    this._z = p.z;
    if (this.mesh) {
      this.mesh.position.set(p.x, p.y, p.z);
    }
  }

  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get z(): number { return this._z; }

  public equal(e: Entity | undefined): boolean {
    if (e) {
      return this.mesh === e.mesh;
    }
    return false;
  }
}

export class Shot extends Entity {
  private static readonly SEGMENTS = 50;

  constructor(pos: Vector3, vel: Vector3) {
    super(pos, vel);

    const radius = 0.04;
    const material = new MeshLambertMaterial({ color: 0x4248f4 });
    this.mesh = new Mesh(new SphereGeometry(radius, Shot.SEGMENTS, Shot.SEGMENTS), material);
    this.mesh.position.set(pos.x, pos.y, pos.z);

    // Update mesh position as well
    this.pos = pos;
  }
}

export class Asteroid extends Entity {
  private static readonly SEGMENTS = 50;

  constructor(public radius: number, public color: number, pos: Vector3, vel: Vector3) {
    super(pos, vel);
    const tex = sphereTextures[Math.floor(Math.random() * sphereTextures.length)];
    const material = new MeshStandardMaterial({
      color,
      displacementMap: tex,
      displacementScale: 0.3,
      metalness: 0
    });
    this.mesh = new Mesh(new SphereGeometry(radius, Asteroid.SEGMENTS, Asteroid.SEGMENTS), material);
    this.mesh.position.set(pos.x, pos.y, pos.z);

    // Update mesh position as well
    this.pos = pos;
  }

  public split(): [Asteroid, Asteroid] {
    // TODO: An asteroid can split into 2-4 smaller asteroids?
    // const nNewAsts = Math.random() * 3 + 2;
    const nNewAsts = 2;
    const r: number[] = [];
    for (let i = 0; i < nNewAsts; i++) {
      r.push(Math.random());
    }
    const sum = r.reduce((a, b) => a + b, 0);
    const radii = r.map((x) => (x / sum * this.radius ** 3) ** (1 / 3));
    // Mass is proportional to volume
    const masses = radii.map((x) => x ** 3);
    /*
                m1
               / t1
       m0 -----  -  -  -  -  -
               \ t2
                m2
    */
    const t1 = (Math.random() * 30 + 15) * Math.PI / 180;  // 15-45 degrees
    const t2 = (Math.random() * 30 + 15) * Math.PI / 180;  // 15-45 degrees
    const [m1, m2] = masses;
    // Conservation of momentum:
    // m1 v1 sin t1 = m2 v2 sin t2
    // m1 v1 cos t1 + m2 v2 cos t2 = m0 v0
    const m0 = this.radius ** 3;
    const v0Mag = this.vel.length();
    const v1Mag = m0 * v0Mag * Math.sin(t2) /
      (m1 * (Math.cos(t2) * Math.sin(t1) + Math.cos(t1) * Math.sin(t2)));
    const v2Mag = m0 * v0Mag * (1 / Math.cos(t2)) * Math.sin(t1) /
      (m2 * (Math.sin(t1) + Math.cos(t1) * Math.tan(t2)));

    // Need to rotate by an axis perpendicular to original velocity
    const axisX = Math.random();
    const axisY = Math.random();
    const axisZ = - (this.vel.x * axisX + this.vel.y * axisY) / this.vel.z;
    const axis = new Vector3(axisX, axisY, axisZ);

    const v1 = this.vel.clone().applyAxisAngle(axis, t1)
      .normalize().multiplyScalar(v1Mag);
    const v2 = this.vel.clone().applyAxisAngle(axis, -t2)
      .normalize().multiplyScalar(v2Mag);
    const ast1 = new Asteroid(radii[0], this.color, this.pos.clone(), v1);
    const ast2 = new Asteroid(radii[1], this.color, this.pos.clone(), v2);
    return [ast1, ast2];
  }
}
