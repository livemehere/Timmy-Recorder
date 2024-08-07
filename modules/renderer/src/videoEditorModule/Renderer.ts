export class Renderer {
  canvas = document.createElement('canvas');
  ctx = this.canvas.getContext('2d')!;
  width = 1280;
  height = 720;
  previewEl: HTMLElement | null;
  cache: Record<string, HTMLImageElement> = {};

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  set preview(previewEl: HTMLElement) {
    this.previewEl = previewEl;
    if (!previewEl.hasChildNodes()) {
      previewEl.appendChild(this.canvas);
    } else {
      console.error('Preview element already has child nodes');
    }
  }

  loadImage(path: string): Promise<HTMLImageElement> {
    const cached = this.cache[path];
    if (cached) {
      return Promise.resolve(cached);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        resolve(img);
        this.cache[path] = img;
      };
      img.onerror = reject;
    });
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  async drawImage(layerIndex: number, imagePath: string) {
    const img = await this.loadImage(imagePath);
    if (img) {
      this.clear();
      this.ctx.drawImage(img, 0, 0, this.width, this.height);
    }
  }

  getPNG() {
    return this.canvas.toDataURL('image/png');
  }
}
