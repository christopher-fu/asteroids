import { TextureLoader, Texture } from 'three';

const tl = new TextureLoader();
const sphereTextures: Texture[] = [];
for (let i = 0; i < 10; i++) {
  sphereTextures.push(tl.load(`static/tex${i}.png`));
}
export { sphereTextures };
