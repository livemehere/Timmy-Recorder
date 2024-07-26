import { Image } from 'react-konva';
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Konva from 'konva';
import { RVideoMetaData } from '../../../../../typings/preload';
import { removeMediaPathPrefix } from '@shared/path';
import { uid } from 'uid';

export type TVideoControls = {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  addChangeFrameListener: (cb: (res: TChangeFrameRes) => void) => string;
  removeChangeFrameListener: (id: string) => void;
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
  const frameChangeListeners = useRef<{ [key: string]: (res: TChangeFrameRes) => void }>({});
  const [metaData, setMetaData] = useState<TVideoMetaData | undefined>(undefined);
  const isSeeking = useRef(false);
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
      const res = {
        currentTime,
        process
      };
      _onChangeFrameCb.current?.(res);
      Object.values(frameChangeListeners.current).forEach((cb) => cb(res));
    };
    frameTimer.current = videoEl.requestVideoFrameCallback(onFrame);

    /** metadata 추출 */
    getMetaData().then((data) => {
      setMetaData(data);
    });

    const onSeeking = () => {
      isSeeking.current = true;
    };

    const onSeeked = () => {
      isSeeking.current = false;
    };

    videoEl.addEventListener('seeking', onSeeking);
    videoEl.addEventListener('seeked', onSeeked);

    return () => {
      anim.stop();
      videoEl.cancelVideoFrameCallback(frameTimer.current);
      videoEl.removeEventListener('seeking', onSeeking);
      videoEl.removeEventListener('seeked', onSeeked);
    };
  }, [videoEl]);

  useImperativeHandle<any, TVideoControls>(controls, () => ({
    play: () => {
      videoEl.play();
    },
    pause: () => {
      videoEl.pause();
    },
    seek: (time: number) => {
      window.requestAnimationFrame(() => {
        if (isSeeking.current) return;
        videoEl.currentTime = time;
      });
    },
    getCurrentTime: () => videoEl.currentTime,
    addChangeFrameListener: (cb) => {
      const id = uid(8);
      frameChangeListeners.current[id] = cb;
      return id;
    },
    removeChangeFrameListener: (id) => {
      delete frameChangeListeners.current[id];
    }
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
