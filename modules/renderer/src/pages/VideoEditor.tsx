import Container from '../components/ui/Container';
import Title from '@renderer/src/components/ui/Title';
import { Layer, Rect, Stage, Star, Text, Image } from 'react-konva';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { OpenDialogSyncOptions } from 'electron';
import { convertToMediaPath } from '@shared/path';
import Konva from 'konva';
import Button from '@renderer/src/components/ui/Button';
import { FrameToVideoArgs } from '../../../../typings/preload';

export default function VideoEditor() {
  const frameCanvas = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const videoFrameCache = useRef(new Map<number, string>());
  const ctx = useRef<CanvasRenderingContext2D | null>(frameCanvas.current?.getContext('2d'));
  const [outputSize, setOutputSize] = useState<[number, number]>([1280, 720]);
  const [inputFps, setInputFps] = useState<number>(60);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [inputDuration, setInputDuration] = useState<number>(0);
  const totalFrames = inputDuration * inputFps;
  const [currentFrameImageUrl, setCurrentFrameImageUrl] = useState('');

  const stageRef = useRef<Konva.Stage>(null);

  const [videoPath, setVideoPath] = useState('');
  const imageRef = useRef<Konva.Image>(null);
  const seeking = useRef(false);

  const [outputFrameRange, setOutputFrameRange] = useState<[number, number]>([0, 0 + 60 * 1]);
  const [outputFrames, setOutputFrames] = useState<string[]>([]);

  /** Konva 에서 사용할 Video Element */
  const videoEl = useMemo(() => {
    const el = document.createElement('video');
    el.src = videoPath;
    return el;
  }, [videoPath]);

  /** Video 가 load 되었을 때 */
  useEffect(() => {
    const onLoad = () => {
      setInputDuration(videoEl.duration);
      setVideoFrame(0);
      // videoEl.play();
    };

    const onSeeking = () => {
      seeking.current = true;
    };

    const onSeeked = () => {
      seeking.current = false;
    };

    if (videoEl) {
      videoEl.addEventListener('loadedmetadata', onLoad);
      videoEl.addEventListener('seeking', onSeeking);
      videoEl.addEventListener('seeked', onSeeked);
    }

    return () => {
      if (videoEl) {
        videoEl.removeEventListener('loadedmetadata', onLoad);
        videoEl.removeEventListener('seeking', onSeeking);
        videoEl.removeEventListener('seeked', onSeeked);
      }
    };
  }, [videoEl]);

  /** video 가 생성 되었을 때 */
  useEffect(() => {
    if (!videoEl) return;
    // videoEl.play();
    const layer = imageRef.current?.getLayer();
    const anim = new Konva.Animation(() => {}, layer);
    anim.start();
    return () => {
      anim.stop();
    };
  }, [videoEl]);

  const setVideoFrame = (frame: number) => {
    if (seeking.current) return;
    if (videoEl) {
      videoEl.currentTime = frameToSec(frame);
    }
  };

  const handleFindVideo = async () => {
    const [path] = await window.app.invoke<string[], OpenDialogSyncOptions>('dialog:open', {
      title: '비디오 선택',
      properties: ['openFile'],
      filters: [{ name: '비디오 파일', extensions: ['mp4'] }]
    });
    setVideoPath(convertToMediaPath(path));
  };

  const handleGetFrameImage = (frame: number) => {
    console.time('프레임 추출 시간');
    setVideoFrame(frame);
    const layer = imageRef.current?.getLayer();
    if (!layer) {
      console.log('레이어가 없습니다');
      return;
    }
    layer.batchDraw();
    const image = stageRef.current?.toDataURL();
    console.timeEnd('프레임 추출 시간');
    return image;
  };

  const frameToSec = (frame: number) => {
    return frame / inputFps;
  };

  // useEffect(() => {
  //   if (!videoRef.current) return;
  //   videoEl.currentTime = frameToSec(currentFrame);
  //   // const imgUrl = handleGetFrameImage(frameToSec(currentFrame));
  //   // if (imgUrl) {
  //   //   setCurrentFrameImageUrl(imgUrl);
  //   // }
  // }, [currentFrame]);

  const extractOutputFrames = async () => {
    const [startFrame, endFrame] = outputFrameRange;
    for (let i = startFrame; i < endFrame; i++) {
      await new Promise((resolve) => setTimeout(() => resolve(0), 0));
      const outputImageDataUrl = handleGetFrameImage(i);
      if (!outputImageDataUrl) {
        console.log(`${i} 프레임 이미지 추출 실패`);
        continue;
      }
      // setOutputFrames((prev) => [...prev, outputImageDataUrl]);

      const base64Data = outputImageDataUrl.replace(/^data:image\/png;base64,/, '');
      await window.app.invoke('video-editor:save-frame', { frame: i, imageBase64: base64Data, outputName: 'test-output' });
    }
    console.log('추출 완료');
  };

  const generateVideo = async () => {
    const res = await window.app.invoke<string, FrameToVideoArgs>('video-editor:frames-to-video', {
      outputPath: 'output.mp4',
      imagePath: 'temp/test-output',
      fps: 60,
      width: 1280,
      height: 720
    });
  };

  const handleExtractCurrentFrame = () => {
    const image = handleGetFrameImage(currentFrame);
    if (image) {
      setCurrentFrameImageUrl(image);
    }
  };

  return (
    <Container>
      <Title>비디오 편집</Title>
      <div>
        <p>출력 정보</p>
        <p>Size : {outputSize.join('x')}</p>
        <hr />
        <p>원본 정보</p>
        <p>Duration : {inputDuration}</p>
        <p>Total Frames : {totalFrames}</p>
        <p>FPS : {inputFps}</p>
        <p>Path : {videoPath || 'path 를 입력해주세요'}</p>
        <input
          type="number"
          // value={currentFrame}
          onChange={(e) => {
            const frame = +e.target.value;
            setCurrentFrame(frame);
            setVideoFrame(frame);
          }}
        />
        <Button onClick={handleFindVideo}>찾기</Button>
        <div className="flex gap-2 py-2">
          <Button onClick={handleExtractCurrentFrame}>현재 프레임 Preview</Button>
          <Button onClick={extractOutputFrames}>렌더링 범위 만큼 이미지 출력하기 </Button>
          <Button onClick={generateVideo}>비디오 렌더링 시작</Button>
        </div>
        {/*<div>*/}
        {/*  <p>output frames</p>*/}
        {/*  <div*/}
        {/*    style={{*/}
        {/*      display: 'grid',*/}
        {/*      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',*/}
        {/*      gap: '10px'*/}
        {/*    }}>*/}
        {/*    {outputFrames.map((frame, i) => (*/}
        {/*      <img key={i} src={frame} alt="" />*/}
        {/*    ))}*/}
        {/*  </div>*/}
        {/*</div>*/}
        {currentFrameImageUrl && (
          <div className="fixed right-0 top-0 w-[150px]">
            <p>Preview</p>
            <img src={currentFrameImageUrl} alt="" />
          </div>
        )}
        {/*<video ref={videoRef} src={videoPath} muted controls style={{ display: 'none' }}></video>*/}
      </div>
      <hr style={{ margin: '20px 0' }} />
      <Stage width={1280} height={720} ref={stageRef}>
        <Layer>
          <Image ref={imageRef} image={videoEl} width={1280} height={720} />
          <Text text="Hello,world" fontSize={50} fill="white" shadowBlur={5} shadowColor="#fff" draggable />
          <Star id="1" x={100} y={100} numPoints={5} fill="red" innerRadius={40} outerRadius={70} draggable />
          <Rect x={200} y={100} width={100} height={100} fill="#fff" cornerRadius={8} draggable shadowColor="#fff" shadowBlur={10} />
        </Layer>
      </Stage>
    </Container>
  );
}
