import { Image } from 'react-konva';
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Konva from 'konva';
import debugLog from '@shared/debugLog';
import { RVideoMetaData } from '../../../../../typings/preload';
import { removeMediaPathPrefix } from '@shared/path';

export type TVideoControls = {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
};

type TChangeFrameRes = {
  currentTime: number;
  process: number;
};

export type TVideoMetaData = {
  duration: number;
  totalFrames: number;
  fps: number;
  width: number;
  height: number;
  displayAspectRatio?: string;
  bitRate: number;
};

type Props = {
  path: string;
  width: number;
  height: number;
  controls: React.MutableRefObject<any>;
  onChangeFrame?: (res: TChangeFrameRes) => void;
  onChangeMetaData?: (data: TVideoMetaData | undefined) => void;
};

export default function VideoSource({ path, width, height, controls, onChangeFrame, onChangeMetaData }: Props) {
  const [metaData, setMetaData] = useState<TVideoMetaData | undefined>(undefined);
  const imageRef = useRef<Konva.Image>(null);
  const frameTimer = useRef<number>(0);
  const videoEl = useMemo(() => {
    const el = document.createElement('video');
    el.src = path;
    return el;
  }, [path]);

  /** callbacks */
  const _onChangeFrameCb = useRef(onChangeFrame);
  useEffect(() => {
    _onChangeFrameCb.current = onChangeFrame;
  }, [onChangeFrame]);

  useEffect(() => {
    onChangeMetaData?.(metaData);
  }, [metaData, onChangeMetaData]);

  /** Video 가 업데이트 될때 마다 캔버스도 업데이트 되도록 설정 */
  useEffect(() => {
    if (!videoEl) return;
    const layer = imageRef.current?.getLayer();
    const anim = new Konva.Animation(() => {}, layer);
    anim.start();

    /** loading 이 되자 마자 플레이를 해줌으로써 첫 장면 노출 */
    videoEl.play();
    setTimeout(() => {
      videoEl.pause();
    }, 50);

    /** 프레임마다 callback 호출 등록 */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onFrame = (now: number, metadata: VideoFrameCallbackMetadata) => {
      const currentTime = videoEl.currentTime;
      const process = currentTime / videoEl.duration;
      frameTimer.current = videoEl.requestVideoFrameCallback(onFrame);
      _onChangeFrameCb.current?.({ currentTime, process });
    };
    frameTimer.current = videoEl.requestVideoFrameCallback(onFrame);

    /** metadata 추출 */
    getMetaData().then((data) => {
      console.log(data);
      setMetaData(data);
    });

    return () => {
      anim.stop();
      videoEl.cancelVideoFrameCallback(frameTimer.current);
    };
  }, [videoEl]);

  useImperativeHandle<any, TVideoControls>(controls, () => ({
    play: () => {
      videoEl.play();
      debugLog('play video');
    },
    pause: () => {
      videoEl.pause();
      debugLog('pause video');
    },
    seek: (time: number) => {
      videoEl.currentTime = time;
      debugLog(`seek video to ${time}`);
    },
    getCurrentTime: () => videoEl.currentTime
  }));

  const getMetaData = async (): Promise<TVideoMetaData | undefined> => {
    /** metadata 추출 */
    const metaData = await window.app.invoke<RVideoMetaData>('video-editor:getMetaData', removeMediaPathPrefix(path));
    const videoStream = metaData.streams.find((s) => s.codec_type === 'video');
    if (videoStream) {
      const totalFrames = Number(videoStream.nb_frames) ?? 0;
      const duration = Number(videoStream.duration) ?? 0;
      const avgFrameRate = videoStream.avg_frame_rate;
      const fps = avgFrameRate ? +avgFrameRate.split('/')[0] : 0;
      const { width, height, display_aspect_ratio, bit_rate } = videoStream;
      return {
        duration,
        totalFrames,
        fps,
        width: Number(width),
        height: Number(height),
        displayAspectRatio: display_aspect_ratio,
        bitRate: Number(bit_rate)
      };
    }
  };

  return <Image ref={imageRef} image={videoEl} width={width} height={height} />;
}
