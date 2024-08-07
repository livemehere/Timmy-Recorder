import Konva from 'konva';

interface Options {
  parent: HTMLDivElement;
}
export class TimelineRenderer {
  stage: Konva.Stage;
  rootLayer = new Konva.Layer();
  width: number;
  height: number;
  private bgColor = 'rgb(10, 10, 10)';
  parent: HTMLDivElement;

  constructor(options: Options) {
    this.parent = options.parent;
    this.width = this.parent.offsetWidth;
    this.height = this.parent.offsetHeight;

    this.initCanvas();
    this.setupBg();
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  initCanvas() {
    this.stage = new Konva.Stage({
      container: this.parent,
      width: this.width,
      height: this.height
    });
    this.stage.content.style.position = 'absolute';
    this.stage.content.style.top = '0';
    this.stage.content.style.left = '0';
    this.stage.add(this.rootLayer);
  }

  setupBg() {
    const bg = new Konva.Rect({
      width: this.width,
      height: this.height,
      fill: this.bgColor,
      id: 'rootBg'
    });
    this.rootLayer.add(bg);
    this.rootLayer.draw();
  }

  resize() {
    const newWidth = this.parent.offsetWidth;
    const newHeight = this.parent.offsetHeight;

    this.stage.width(newWidth);
    this.stage.height(newHeight);

    const [bgRect] = this.stage.find('#rootBg');
    bgRect.width(newWidth);
    bgRect.height(newHeight);
  }

  cleanUp() {
    this.stage?.destroy();
    window.removeEventListener('resize', this.resize);
  }
}
