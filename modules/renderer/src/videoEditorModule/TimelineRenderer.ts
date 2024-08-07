import Konva from 'konva';

interface Options {
  parent: string;
}
export class TimelineRenderer {
  stage: Konva.Stage;
  rootLayer = new Konva.Layer();
  width: number;
  height: number;
  private bgColor = 'rgb(10, 10, 10)';
  parentSelector: string;

  constructor(options: Options) {
    this.parentSelector = options.parent;
    const el = document.querySelector(this.parentSelector) as HTMLDivElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.stage = new Konva.Stage({
      container: el,
      width: this.width,
      height: this.height
    });
    this.stage.content.style.position = 'absolute';
    this.stage.content.style.top = '0';
    this.stage.content.style.left = '0';

    this.stage.add(this.rootLayer);
    this.setupBg();
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  initCanvas() {}

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
    if (!this.stage) return;
    const el = document.querySelector(this.parentSelector) as HTMLDivElement;
    if (!el) return;
    const newWidth = el.offsetWidth;
    const newHeight = el.offsetHeight;
    console.log(newWidth);

    this.stage.content.style.width = `${newWidth}px`;
    this.stage.content.style.height = `${newHeight}px`;

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
