import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const palette = {
  wall: '#1a1c30', wallEdge: '#292b47', floor: '#22243c', floorEdge: '#151625',
  wood: '#755a58', woodTop: '#a3837d', dark: '#11131e', black: '#090b13',
  metal: '#36384d', chair: '#292c42', fabric: '#454760', silver: '#9eabbc',
  cyan: '#69e5f2', violet: '#a28bff', blue: '#5779da', paper: '#d6dacd',
  terra: '#af776d', green: '#529c82', greenLight: '#88c5a1', yellow: '#dec68b',
};

export function createBoxFactory() {
  const cache = new Map();
  const unit = new THREE.BoxGeometry(1,1,1);
  function material(color, emissive = false) {
    const key = `${color}:${emissive}`;
    if (!cache.has(key)) cache.set(key, new THREE.MeshStandardMaterial({
      color, roughness: .8, metalness: .08,
      ...(emissive ? {emissive: color, emissiveIntensity: 1.8, toneMapped: false} : {}),
    }));
    return cache.get(key);
  }
  function box(parent, color, x,y,z, w,h,d, emissive = false) {
    const mesh = new THREE.Mesh(unit, material(palette[color] || color, emissive));
    mesh.position.set(x,y,z); mesh.scale.set(w,h,d);
    mesh.castShadow = !emissive; mesh.receiveShadow = !emissive;
    parent.add(mesh); return mesh;
  }
  // Batch static boxes by material, retaining a small draw-call count for the room.
  function batch(group,recursive=true) {
    group.updateMatrixWorld(true);
    const inverse = group.matrixWorld.clone().invert();
    const buckets = new Map();
    group.traverse(object => {
      if (!object.isMesh || object.geometry !== unit || (!recursive && object.parent!==group)) return;
      const key = object.material;
      if (!buckets.has(key)) buckets.set(key, []);
      const geometry = unit.clone();
      geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld));
      buckets.get(key).push({geometry, object});
    });
    for (const [mat, items] of buckets) {
      const merged = mergeGeometries(items.map(i => i.geometry));
      const mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = !mat.emissiveIntensity; mesh.receiveShadow = true;
      // Standard materials default to emissiveIntensity=1, even with black emission.
      mesh.castShadow = mat.emissive.getHex() === 0;
      group.add(mesh);
      items.forEach(({geometry,object}) => { geometry.dispose(); object.removeFromParent(); });
    }
  }
  return {box, material, batch, unit};
}
