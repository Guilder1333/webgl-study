import { BoundingBox, loadObject } from './object-loader';
import * as textureLoader from './texture';

type CachedMesh = {
  bufferIndex: WebGLBuffer | null;
};

export type RenderableMaterial = {
  ambient: number[];
  diffuse: number[];
  specular: number[];
  opaque: number;
  diffuseIndex: WebGLTexture | null;
  normalIndex: WebGLTexture | null;
  diffuseLock: object | null;
  normalLock: object | null;
};

export type RenderableMesh = {
  bufferSize: number;
  bufferIndex: WebGLBuffer | null;
  box: BoundingBox;
  material: RenderableMaterial;
};

type CachedModel = {
  renderable: WeakRef<RenderableMesh[]>;
  cached: CachedMesh[];
};

type TextureCache = {
  lock: WeakRef<object>;
  index: WebGLTexture;
};

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

const defaultAmbient = [1, 1, 1];
const defaultDiffuse = [0.3, 0.6, 0.9];
const defaultSpecular = [1, 1, 1, 1];

export class ResourceManager {
  private readonly models = new Map<string, CachedModel>();
  private readonly textures = new Map<string, TextureCache>();

  constructor(private readonly gl: WebGLRenderingContext) {}

  async loadModel(path: string): Promise<RenderableMesh[]> {
    const cache = this.models.get(path);
    if (cache) {
      const renderable = cache.renderable.deref();
      if (renderable) {
        return renderable;
      }
      this.destroyModel(cache.cached);
    }
    const meshes = await loadObject(path);
    const renderable: RenderableMesh[] = [];
    const cached: CachedMesh[] = [];
    for (const mesh of meshes) {
      const mat = mesh.material;
      const renderableMesh: RenderableMesh = {
        bufferSize: mesh.buffer.length / 6,
        bufferIndex: null,
        box: mesh.box,
        material: {
          ambient: defaultAmbient,
          diffuse: defaultDiffuse,
          specular: defaultSpecular,
          opaque: 1,
          diffuseIndex: null,
          normalIndex: null,
          diffuseLock: null,
          normalLock: null,
        },
      };
      const cachedMesh: CachedMesh = {
        bufferIndex: null,
      };
      if (mat) {
        const rm = renderableMesh.material;
        rm.ambient = mat.ambient;
        rm.diffuse = mat.diffuse;
        rm.specular = mat.specular;
        rm.opaque = mat.opaque;
        if (mat.diffuseMap) {
          const [index, lock] = this.loadTexture(`./3d/${mat.diffuseMap}`);
          rm.diffuseIndex = index;
          rm.diffuseLock = lock;
        }
        if (mat.normalMap) {
          const [index, lock] = this.loadTexture(`./3d/${mat.normalMap}`);
          rm.normalIndex = index;
          rm.normalLock = lock;
        }
      }
      renderableMesh.bufferIndex = makeBuffer(this.gl, mesh.buffer);
      cachedMesh.bufferIndex = renderableMesh.bufferIndex;
      renderable.push(renderableMesh);
      cached.push(cachedMesh);
    }
    this.models.set(path, {
      cached: cached,
      renderable: new WeakRef<RenderableMesh[]>(renderable),
    });
    return renderable;
  }

  private loadTexture(path: string): [WebGLTexture, object] {
    const cached = this.textures.get(path);
    if (cached) {
      let lock = cached.lock.deref();
      if (!lock) {
        lock = {};
        cached.lock = new WeakRef<object>(lock);
      }
      return [cached.index, lock];
    }
    const index = textureLoader.loadTexture(this.gl, path);
    const lock = {};
    this.textures.set(path, {
      index,
      lock: new WeakRef<object>(lock),
    });
    return [index, lock];
  }

  private destroyModel(cached: CachedMesh[]) {
    for (const mesh of cached) {
      if (mesh.bufferIndex) {
        this.gl.deleteBuffer(mesh.bufferIndex);
      }
    }
  }
}
