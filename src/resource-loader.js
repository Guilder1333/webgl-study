import { normalizeSub } from './vector';

/**
 * @typedef {object} ObjectItem
 * @property {string} name
 * @property {Array<number>} vertices
 * @property {Array<number>} normals
 * @property {Array<number>} texCoords
 * @property {Array<Array<Array<number>>>} faces
 * @property {boolean} smooth
 * @property {string} material
 */

/**
 * @typedef {object} Material
 * @property {number[]} ambient
 * @property {number[]} diffuse
 * @property {number[]} specular
 * @property {number} opaque
 * @property {string} diffuseMap
 * @property {string} normalMap
 * @property {WebGLTexture} diffuseIndex
 * @property {WebGLTexture} normalIndex
 */

/**
 * @typedef {object} BoundingBox
 * @property {number} maxX
 * @property {number} maxY
 * @property {number} maxZ
 * @property {number} minX
 * @property {number} minY
 * @property {number} minZ
 */

/**
 * @typedef {object} Mesh
 * @property {Float32Array} buffer
 * @property {number} bufferIndex
 * @property {BoundingBox} box
 * @property {Material} material
 */

/**
 *
 * @param {string} str
 * @returns
 */
function parseFaceItem(str) {
  const items = str.split('/');
  if (items.length === 1) {
    const v = Number(items[0]);
    return [v, 0, 0];
  } else if (items.length === 2) {
    const v = Number(items[0]);
    const vt = Number(items[1]);
    return [v, vt, 0];
  } else if (items.length === 3) {
    const v = Number(items[0]);
    const vt = items[1] ? Number(items[1]) : 0;
    const vn = Number(items[2]);
    return [v, vt, vn];
  }
  throw new Error(`Failed to parse face item '${str}'.`);
}

function copyVertex(buffer, vertices, index, bb) {
  const x = vertices[index];
  const y = vertices[index + 1];
  const z = vertices[index + 2];
  bb.maxX = Math.max(bb.maxX, x);
  bb.maxY = Math.max(bb.maxY, y);
  bb.maxZ = Math.max(bb.maxZ, z);
  bb.minX = Math.min(bb.maxX, x);
  bb.minY = Math.min(bb.maxY, y);
  bb.minZ = Math.min(bb.maxZ, z);
  buffer.push(x);
  buffer.push(y);
  buffer.push(z);
  buffer.push(vertices[index + 3]);
}

function copyTexCoords(buffer, texCoords, index) {
  buffer.push(texCoords[index]);
  buffer.push(texCoords[index + 1]);
}

/**
 *
 * @param {string} url
 * @returns {Material[]}
 */
export async function loadMaterial(url) {
  const response = await fetch(url);
  const data = await response.text();

  const lines = data.split('\n');
  const materials = {};
  let material = null;
  for (const line of lines) {
    if (line.startsWith('#')) {
      continue;
    }
    const [token, ...params] = line.split(' ');

    if (token === 'newmtl') {
      material = {
        ambient: [1, 1, 1],
        diffuse: [1, 1, 1],
        specular: [1, 1, 1, 0],
        opaque: 1,
        diffuseMap: null,
        normalMap: null,
        diffuseIndex: null,
        normalIndex: null,
      };
      materials[params[0].trim()] = material;
    } else if (material) {
      if (token === 'Ns') {
        material.specular[3] = parseFloat(params[0]);
      } else if (token === 'Ks') {
        material.specular[0] = parseFloat(params[0]);
        material.specular[1] = parseFloat(params[1]);
        material.specular[2] = parseFloat(params[2]);
      } else if (token === 'Kd') {
        material.diffuse[0] = parseFloat(params[0]);
        material.diffuse[1] = parseFloat(params[1]);
        material.diffuse[2] = parseFloat(params[2]);
      } else if (token === 'Ka') {
        material.ambient[0] = parseFloat(params[0]);
        material.ambient[1] = parseFloat(params[1]);
        material.ambient[2] = parseFloat(params[2]);
      } else if (token === 'map_Kd') {
        material.diffuseMap = params[0].trim();
      } else if (token === 'normal') {
        material.normalMap = params[0].trim();
      }
    }
  }
  return materials;
}

/**
 *
 * @param {string} url
 * @returns {Mesh[]}
 */
export async function loadObject(url) {
  /**
   * @type {Response}
   */
  const response = await fetch(url);
  const data = await response.text();
  const lines = data.split('\n');
  let mtlib = '';
  let objects = [];
  let object = null;
  const vertices = [0, 0, 0, 0];
  const normals = [0, 0, 0];
  const texCoords = [0, 0, 0];
  for (const line of lines) {
    if (line.startsWith('#')) {
      continue;
    }

    const [token, ...params] = line.split(' ');
    if (token === 'v') {
      vertices.push(parseFloat(params[0]));
      vertices.push(parseFloat(params[1]));
      vertices.push(parseFloat(params[2]));
      vertices.push(params[3] ? parseFloat(params[3]) : 1.0);
    } else if (token === 'vn') {
      normals.push(parseFloat(params[0]));
      normals.push(parseFloat(params[1]));
      normals.push(parseFloat(params[2]));
      normalizeSub(normals, normals.length - 3);
    } else if (token === 'vt') {
      texCoords.push(parseFloat(params[0]));
      texCoords.push(parseFloat(params[1]));
      texCoords.push(params[2] ? parseFloat(params[2]) : 1.0);
    } else if (token === 'mtllib') {
      mtlib = params[0];
    } else if (token === 'o') {
      object = {
        name: params[0],
        faces: [],
        smooth: true,
        material: '',
      };
      objects.push(object);
    } else if (object) {
      if (token === 'f') {
        const face = [];
        for (const item of params) {
          face.push(parseFaceItem(item));
        }
        object.faces.push(face);
      } else if (token === 's') {
        object.smooth = params[0] === 'on' || params[0] === '1';
      } else if (token === 'usemtl') {
        object.material = params[0];
      }
    }
  }

  const materials = await loadMaterial(`./3d/${mtlib}`);

  const result = [];
  for (const obj of objects) {
    const buffer = [];
    const bb = {
      maxX: -Infinity,
      maxY: -Infinity,
      maxZ: -Infinity,
      minX: Infinity,
      minY: Infinity,
      minZ: Infinity,
    };
    for (const face of obj.faces) {
      if (face.length === 3) {
        copyVertex(buffer, vertices, face[0][0] * 4, bb);
        copyTexCoords(buffer, texCoords, face[0][1] * 3);
        copyVertex(buffer, vertices, face[1][0] * 4, bb);
        copyTexCoords(buffer, texCoords, face[1][1] * 3);
        copyVertex(buffer, vertices, face[2][0] * 4, bb);
        copyTexCoords(buffer, texCoords, face[2][1] * 3);
      } else if (face.length === 4) {
        copyVertex(buffer, vertices, face[0][0] * 4, bb);
        copyTexCoords(buffer, texCoords, face[0][1] * 3);
        copyVertex(buffer, vertices, face[1][0] * 4, bb);
        copyTexCoords(buffer, texCoords, face[1][1] * 3);
        copyVertex(buffer, vertices, face[2][0] * 4, bb);
        copyTexCoords(buffer, texCoords, face[2][1] * 3);

        copyVertex(buffer, vertices, face[0][0] * 4, bb);
        copyTexCoords(buffer, texCoords, face[0][1] * 3);
        copyVertex(buffer, vertices, face[2][0] * 4, bb);
        copyTexCoords(buffer, texCoords, face[2][1] * 3);
        copyVertex(buffer, vertices, face[3][0] * 4, bb);
        copyTexCoords(buffer, texCoords, face[3][1] * 3);
      }
    }
    const material = materials[obj.material ?? 'default'];
    console.log(materials);
    result.push({
      buffer,
      material,
      box: bb,
      bufferIndex: null,
    });
  }

  return result;
}
