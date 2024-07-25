import Container from '../components/ui/Container';
import Title from '@renderer/src/components/ui/Title';
import { Layer, Rect, Stage, Star, Text, Image } from 'react-konva';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { OpenDialogSyncOptions } from 'electron';
import { convertToMediaPath } from '@shared/path';
import Konva from 'konva';
import Button from '@renderer/src/components/ui/Button';
import { FrameToVideoArgs, RVideoMetaData } from '../../../../typings/preload';

export default function VideoEditor() {
  const [currentFrameImageUrl, setCurrentFrameImageUrl] = useState('');
  const stageRef = useRef<Konva.Stage>(null);
  const imageRef = useRef<Konva.Image>(null);
  const seeking = useRef(false);
  const currentFrameDisplayRef = useRef<HTMLDivElement>(null);

  const playStartTimeRef = useRef(0);
  const currentFrameRef = useRef(0);
  const frameTimer = useRef<number | undefined>(undefined);
  const [inputVideoPath, setInputVideoPath] = useState('');
  const [inputVideoData, setInputVideoData] = useState({
    duration: 0,
    totalFrames: 0,
    fps: 0,
    width: 0,
    height: 0,
    displayAspectRatio: '1/1',
    bitRate: 0
  });

  const [outputVideoData, setOutputVideoData] = useState({
    duration: 0,
    totalFrames: 0,
    fps: 0,
    width: 0,
    height: 0,
    displayAspectRatio: '1/1',
    bitRate: 0,
    renderFrameRange: [0, 0]
  });

  /** Konva 에서 사용할 Video Element */
  const videoEl = useMemo(() => {
    const el = document.createElement('video');
    el.src = inputVideoPath;
    return el;
  }, [inputVideoPath]);

  /** Video 가 load 되었을 때 */
  useEffect(() => {
    const onSeeking = () => {
      seeking.current = true;
    };

    const onSeeked = () => {
      seeking.current = false;
    };

    if (videoEl) {
      videoEl.addEventListener('seeking', onSeeking);
      videoEl.addEventListener('seeked', onSeeked);
    }

    return () => {
      if (videoEl) {
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
    currentFrameRef.current = frame;
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

    /** metadata 추출 */
    const metaData = await window.app.invoke<RVideoMetaData>('video-editor:getMetaData', path);
    const videoStream = metaData.streams.find((s) => s.codec_type === 'video');
    if (videoStream) {
      const totalFrames = Number(videoStream.nb_frames) ?? 0;
      const duration = Number(videoStream.duration) ?? 0;
      const avgFrameRate = videoStream.avg_frame_rate;
      const fps = avgFrameRate ? +avgFrameRate.split('/')[0] : 0;
      const { width, height, display_aspect_ratio, bit_rate } = videoStream;
      setInputVideoData({
        duration,
        totalFrames,
        fps,
        width: Number(width),
        height: Number(height),
        displayAspectRatio: display_aspect_ratio ?? '1/1',
        bitRate: Number(bit_rate)
      });
    }
    setInputVideoPath(convertToMediaPath(path));
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
    return frame / inputVideoData.fps;
  };

  const play = () => {
    if (videoEl) {
      videoEl.play();
      const onFrame = (now: number, metadata: VideoFrameCallbackMetadata) => {
        if (playStartTimeRef.current === 0.0) {
          playStartTimeRef.current = now;
        }
        const elapsed = (now - startTime) / 1000.0;
        const fps = (++currentFrameRef.current / elapsed).toFixed(3);
        currentFrameDisplayRef.current!.innerText = `current: ${currentFrameRef.current} / fps: ${fps}`;

        frameTimer.current = videoEl.requestVideoFrameCallback(onFrame);
      };
      frameTimer.current = videoEl.requestVideoFrameCallback(onFrame);
    }
  };

  const pause = () => {
    videoEl.pause();
    if (frameTimer.current) {
      window.cancelAnimationFrame(frameTimer.current);
    }
  };

  const reset = () => {
    videoEl.pause();
    videoEl.currentTime = 0;
    currentFrameRef.current = 0;
    playStartTimeRef.current = 0;
    if (frameTimer.current) {
      videoEl.cancelVideoFrameCallback(frameTimer.current);
    }
    currentFrameDisplayRef.current!.innerText = `current: ${currentFrameRef.current}`;
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
    const [startFrame, endFrame] = outputVideoData.renderFrameRange;
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
      fps: outputVideoData.fps,
      width: outputVideoData.width,
      height: outputVideoData.height
    });
  };

  const handleExtractCurrentFrame = () => {
    const image = handleGetFrameImage(currentFrameRef.current);
    if (image) {
      setCurrentFrameImageUrl(image);
    }
  };

  return (
    <Container>
      <Title>비디오 편집</Title>
      <section className="mb-4 flex gap-2">
        <Button onClick={handleFindVideo}>비디오 선택</Button>
      </section>
      <section className="flex gap-10">
        <div>
          <p>입력 정보</p>
          <p>
            Size : {inputVideoData.width}x{inputVideoData.height}
          </p>
          <p>Duration : {inputVideoData.duration}</p>
          <p>Total Frames : {inputVideoData.totalFrames}</p>
          <p>FPS : {inputVideoData.fps}</p>
          <p>Path : {inputVideoPath || 'path 를 입력해주세요'}</p>
        </div>
        <hr />
        <div>
          <p>출력 정보</p>
          <p>
            Size : {outputVideoData.width}x{outputVideoData.height}
          </p>
          <p>Duration : {outputVideoData.duration}</p>
          <p>Total Frames : {outputVideoData.totalFrames}</p>
          <p>FPS : {outputVideoData.fps}</p>
          <p>Path : {outputVideoData.renderFrameRange.join(' ~ ')}</p>
        </div>
      </section>
      <div>
        <div>
          <div>
            <div ref={currentFrameDisplayRef}>0 fps</div>
          </div>
          <div className="flex gap-2 py-2">
            <Button onClick={play}>재생</Button>
            <Button onClick={pause}>일시정지</Button>
            <Button onClick={reset}>리셋</Button>
            <Button onClick={handleExtractCurrentFrame}>현재 프레임 Preview</Button>
            <Button onClick={extractOutputFrames}>렌더링 범위 만큼 이미지 출력하기 </Button>
            <Button onClick={generateVideo}>비디오 렌더링 시작</Button>
          </div>
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
