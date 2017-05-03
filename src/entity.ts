import { Vector3, Mesh, SphereGeometry, MeshLambertMaterial,
         MeshStandardMaterial, Vector2 } from 'three';
import { sphereTextures } from './textureloader';

export abstract class Entity {
  public mesh: Mesh;
  public vel: Vector3;

  private _pos: Vector3;

  // Super hack!
  private _x: number;
  private _y: number;
  private _z: number;

  get pos(): Vector3 {
    return this._pos;
  }

  set pos(p: Vector3) {
    this._pos = p;
    this._x = p.x;
    this._y = p.y;
    this._z = p.z;
    this.mesh.position.set(p.x, p.y, p.z);
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
    super();

    const radius = 0.04;
    const material = new MeshLambertMaterial({ color: 0x4248f4 });
    this.mesh = new Mesh(new SphereGeometry(radius, Shot.SEGMENTS, Shot.SEGMENTS), material);
    this.mesh.position.set(pos.x, pos.y, pos.z);

    this.pos = pos;
    this.vel = vel;
  }
}

export class Asteroid extends Entity {
  private static readonly SEGMENTS = 50;

  constructor(public radius: number, public color: number, pos: Vector3, vel: Vector3) {
    super();
    const tex = sphereTextures[Math.floor(Math.random() * sphereTextures.length)];
    const material = new MeshStandardMaterial({
      color,
      displacementMap: tex,
      displacementScale: 0.3,
      metalness: 0
    });
    this.mesh = new Mesh(new SphereGeometry(radius, Asteroid.SEGMENTS, Asteroid.SEGMENTS), material);
    this.mesh.position.set(pos.x, pos.y, pos.z);

    this.pos = pos;
    this.vel = vel;
  }
}
