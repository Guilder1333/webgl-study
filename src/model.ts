import { Program } from './program';
import { Mesh, loadObject } from './resource-loader';
import { Rotator } from './rotator';
import { loadTexture } from './texture';
import { Vector3 } from './vector';

function makeBuffer(
  gl: WebGLRenderingContext,
  vertices: number[]
): WebGLBuffer {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error('Failed to create vertex buffer.');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return buffer;
}

export class Model {
  private meshes: Mesh[];
  public readonly position = new Vector3();
  public readonly rotator = new Rotator();
  constructor() {}

  async load(objectUrl: string, gl: WebGLRenderingContext) {
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

  render(program: Program) {
    const modelView = mat4.create();
    mat4.translate(modelView, modelView, this.position);
    mat4.rotateX(modelView, modelView, this.rotator.radX());
    mat4.rotateY(modelView, modelView, this.rotator.radY());
    mat4.rotateZ(modelView, modelView, this.rotator.radZ());
    program.setModelView(modelView);

    for (const mesh of this.meshes) {
      this.draw(program, mesh);
    }
  }

  private draw(program: Program, mesh: Mesh) {
    const buffer = mesh.bufferIndex;
    if (!buffer) {
      return;
    }
    const vertexCount = mesh.buffer.length / 6;

    program.setVertices(buffer);
    program.setTextureCoords(buffer);

    if (mesh.material && mesh.material.diffuseIndex) {
      program.setTexture0(mesh.material.diffuseIndex);
    }

    program.drawArray(0, vertexCount);
  }
}
