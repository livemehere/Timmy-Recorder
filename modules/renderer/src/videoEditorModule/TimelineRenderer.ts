import Konva from 'konva';
import { VideoEditorManager } from '@renderer/src/videoEditorModule/videoEditorManager';
import { map } from '@renderer/src/utils/math';

interface Options {
  parent: HTMLDivElement;
  videoEditorManager: VideoEditorManager;
}
export class TimelineRenderer {
  stage: Konva.Stage;
  rootLayer = new Konva.Layer();
  width: number;
  height: number;
  private bgColor = 'rgb(10, 10, 10)';
  parent: HTMLDivElement;
  videoEditorManager: VideoEditorManager;
  raf: number;

  constructor(options: Options) {
    this.parent = options.parent;
    this.width = this.parent.offsetWidth;
    this.height = this.parent.offsetHeight;
    this.videoEditorManager = options.videoEditorManager;

    this.initCanvas();
    this.setupBg();
    this.resize();
    this.initObjects();
    window.addEventListener('resize', this.resize.bind(this));
    this.raf = requestAnimationFrame(this.update.bind(this));

    console.log(this.videoEditorManager);
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
    this.width = newWidth;
    this.height = newHeight;

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

  initObjects() {
    // 2 layer
    const overlayLayer = new Konva.Layer();
    this.stage.add(overlayLayer);

    const indicator = new Konva.Rect({
      x: 0,
      y: 0,
      width: 2,
      height: this.height,
      fill: 'red',
      id: 'indicator',
      offsetX: 1
    });
    const startRangeIndicator = new Konva.Rect({
      x: this.frameToX(this.videoEditorManager.outputRange[0]),
      y: 0,
      width: 2,
      height: this.height,
      fill: 'rgba(0,161,255,0.99)',
      id: 'startRangeIndicator',
      draggable: true,
      dragBoundFunc: function (pos) {
        return {
          x: pos.x < 0 ? 0 : pos.x,
          y: this.absolutePosition().y
        };
      }
    });
    const endRangeIndicator = new Konva.Rect({
      x: this.frameToX(this.videoEditorManager.outputRange[1]),
      y: 0,
      width: 2,
      height: this.height,
      fill: 'rgba(0,161,255,0.99)',
      id: 'endRangeIndicator',
      offsetX: 1,
      draggable: true,
      dragBoundFunc: function (pos) {
        return {
          x: pos.x,
          y: this.absolutePosition().y
        };
      }
    });
    startRangeIndicator.on('dragmove', () => {
      this.videoEditorManager.outputRange = [this.xToFrame(startRangeIndicator.x()), this.videoEditorManager.outputRange[1]];
    });
    endRangeIndicator.on('dragmove', () => {
      this.videoEditorManager.outputRange = [this.videoEditorManager.outputRange[0], this.xToFrame(endRangeIndicator.x())];
    });

    overlayLayer.zIndex(2);
    overlayLayer.add(indicator);
    overlayLayer.add(startRangeIndicator);
    overlayLayer.add(endRangeIndicator);

    // normal layer
    const handleBar = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.width,
      height: 20,
      fill: '#333333',
      id: 'handleBar'
    });

    handleBar.on('pointerdown', () => {
      const x = this.stage.getPointerPosition()?.x || 0;
      const frame = this.frameToX(x);
      this.videoEditorManager.seek(Math.floor(frame));
    });

    const startFrameText = new Konva.Text({
      x: 10,
      y: 5,
      text: '0 frame',
      fill: 'white'
    });

    const endFrameText = new Konva.Text({
      x: this.width - 70,
      y: 5,
      text: `${this.videoEditorManager.totalFrames} frame`,
      fill: 'white'
    });

    const curFrameText = new Konva.Text({
      x: this.width / 2 - 30,
      y: 5,
      text: '0 frame',
      fill: 'white',
      id: 'curFrameText'
    });

    this.rootLayer.add(handleBar);
    this.rootLayer.add(startFrameText);
    this.rootLayer.add(endFrameText);
    this.rootLayer.add(curFrameText);

    // set layer
    this.updateLayerResources();
  }

  updateLayerResources() {
    this.videoEditorManager.layers.forEach((layer, i) => {
      const layerObj = this.stage.findOne(`#layer-${layer.id}`);
      const gap = 10;
      const layerHeight = 30;
      const layerY = 50 + (layerHeight + gap) * i;
      if (!layerObj) {
        const layerRect = new Konva.Rect({
          x: 0,
          y: layerY,
          width: this.width,
          height: layerHeight,
          fill: 'rgba(255,255,255,0.1)',
          id: `layer-${layer.id}`
        });
        this.rootLayer.add(layerRect);
      }

      layer.layerResources.forEach((layerResource, j) => {
        const resourceObj = this.stage.findOne(`#layer-${layerResource.layerId}-resource-${layerResource.resourceId}`);
        if (!resourceObj) {
          const resourceX = this.frameToX(layerResource.startFrame);
          const resourceWidth = this.frameToX(layerResource.originResource?.metaData?.totalFrames ?? 0);
          const resourceRect = new Konva.Rect({
            x: resourceX,
            y: layerY,
            width: resourceWidth,
            height: layerHeight,
            fill: 'rgb(0,102,162)',
            id: `layer-${layerResource.layerId}-resource-${layerResource.resourceId}`
          });
          this.rootLayer.add(resourceRect);
        }
      });
    });
  }

  private frameToX(frame: number) {
    return map(frame, 0, this.videoEditorManager.totalFrames, 0, this.width);
  }

  private xToFrame(x: number) {
    return Math.floor(map(x, 0, this.width, 0, this.videoEditorManager.totalFrames));
  }

  update() {
    // TODO: 최대 60프레임으로 조정 필요

    const indicator = this.stage.findOne('#indicator')!;
    const xPos = this.frameToX(this.videoEditorManager.curFrame);
    indicator.x(xPos);

    const curFrameText = this.stage.findOne<Konva.Text>('#curFrameText')!;
    curFrameText.text(`${this.videoEditorManager.curFrame} frame`);

    this.updateLayerResources();
    this.raf = requestAnimationFrame(this.update.bind(this));
  }
}
