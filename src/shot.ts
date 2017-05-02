import { Vector3, Mesh, SphereGeometry, MeshLambertMaterial } from 'three';

export default class Shot {
  public mesh: Mesh;

  constructor(private _pos: Vector3, public vel: Vector3) {
    const radius = 0.04;
    const segments = 50;
    const rings = 50;
    const material = new MeshLambertMaterial({ color: 0x4248f4 });
    this.mesh = new Mesh(new SphereGeometry(radius, segments, rings), material);
    this.mesh.position.set(_pos.x, _pos.y, _pos.z);
  }

  get pos(): Vector3 {
    return this._pos;
  }

  set pos(p: Vector3) {
    this._pos = p;
    this.mesh.position.set(p.x, p.y, p.z);
  }
}
