import { Program } from './program';
import { loadObject } from './resource-loader';
import { Rotator } from './rotator';
import { loadTexture } from './texture';
import { Vector3 } from './vector';

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Array<number>} vertices
 * @returns {WebGLBuffer}
 */
function makeBuffer(gl, vertices) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return buffer;
}

export class Model {
  /**
   * @type {import('./resource-loader').Mesh[]}
   */
  meshes;
  position = new Vector3();
  rotator = new Rotator();
  constructor() {}

  /**
   * @param {string} objectUrl
   * @param {WebGLRenderingContext} gl
   */
  async load(objectUrl, gl) {
    const meshes = await loadObject(objectUrl);
    for (const mesh of meshes) {
      const mat = mesh.material;
      if (mat && mat.diffuseMap && !mat.diffuseIndex) {
        mat.diffuseIndex = loadTexture(gl, `./3d/${mat.diffuseMap}`);
      }
      mesh.bufferIndex = makeBuffer(gl, mesh.buffer);
    }
    this.meshes = meshes;
  }

  /**
   * @param {Program} program
   */
  render(program) {
    const modelView = mat4.create();
    mat4.translate(modelView, modelView, this.position);
    mat4.rotateX(modelView, modelView, this.rotator.radX());
    mat4.rotateY(modelView, modelView, this.rotator.radY());
    mat4.rotateY(modelView, modelView, this.rotator.radZ());
    console.log(this.position);
    program.setModelView(modelView);

    for (const mesh of this.meshes) {
      this.#draw(program, mesh);
    }
  }

  /**
   *
   * @param {Program} program
   * @param {import('./resource-loader').Mesh} mesh
   */
  #draw(program, mesh) {
    const vertexCount = mesh.buffer.length / 6;
    const buffer = mesh.bufferIndex;

    program.setVertices(buffer);
    program.setTextureCoords(buffer);

    if (mesh.material && mesh.material.diffuseIndex) {
      program.setTexture0(mesh.material.diffuseIndex);
    }

    program.drawArray(0, vertexCount);
  }
}
