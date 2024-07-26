import Container from '../components/ui/Container';
import Title from '@renderer/src/components/ui/Title';
import { Layer, Rect, Stage, Star, Text } from 'react-konva';
import { useRef, useState } from 'react';
import type { OpenDialogSyncOptions } from 'electron';
import { convertToMediaPath } from '@shared/path';
import Konva from 'konva';
import Button from '@renderer/src/components/ui/Button';
import { CreateBlankVideoParams, FrameToVideoArgs } from '../../../../typings/preload';
import useInvoke from '@renderer/src/hooks/useInvoke';
import VideoSource, { TVideoControls, TVideoMetaData } from '@renderer/src/components/video-editor/VideoSource';
import ProgressBar, { TProgressControls } from '@renderer/src/components/video-editor/ProgressBar';

export default function VideoEditor() {
  const [currentFrameImageUrl, setCurrentFrameImageUrl] = useState('');
  const sequenceRef = useRef<Konva.Stage>(null);
  const currentFrameDisplayRef = useRef<HTMLDivElement>(null);

  const sequenceControls = useRef<TVideoControls>();
  const progressControls = useRef<TProgressControls>();
  const [inputVideoPath, setInputVideoPath] = useState('');
  const [inputVideoData, setInputVideoData] = useState<TVideoMetaData>();

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

  const { invoke } = useInvoke<any, CreateBlankVideoParams>('video-editor:create-sequence');

  const handleSetupOutput = async () => {
    const [outputPath] = await window.app.invoke('dialog:open', {
      title: '저장위치 선택',
      properties: ['openDirectory']
    });
    const res = await invoke<CreateBlankVideoParams>({
      outputPath: outputPath,
      filename: 'test-output.mp4',
      fps: 60,
      duration: 60,
      width: 1920,
      height: 1080
    });
    console.log(outputPath);
  };

  const handleFindVideo = async () => {
    const [path] = await window.app.invoke<string[], OpenDialogSyncOptions>('dialog:open', {
      title: '비디오 선택',
      properties: ['openFile'],
      filters: [{ name: '비디오 파일', extensions: ['mp4'] }]
    });
    setInputVideoPath(convertToMediaPath(path));
  };

  /** 시퀀스 비디오를 특정시간으로 set 하고 캔버스를 이미지로 반환. */
  const handleGetFrameImage = (time: number) => {
    console.time('프레임 추출 시간');
    sequenceControls.current?.seek(time);
    const image = sequenceRef.current?.toDataURL();
    console.timeEnd('프레임 추출 시간');
    return image;
  };

  /** 시퀀스의 현재 시간을 기준으로 추출된 이미지를 preview 로 set */
  const handleExtractCurrentFrame = () => {
    if (!sequenceControls.current) return;
    const currentTime = sequenceControls.current.getCurrentTime();
    const image = handleGetFrameImage(currentTime);
    if (image) {
      setCurrentFrameImageUrl(image);
    }
  };

  const play = () => {
    sequenceControls.current?.play();
  };

  const pause = () => {
    sequenceControls.current?.pause();
  };

  const reset = () => {
    sequenceControls.current?.seek(0);
  };

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

  return (
    <Container>
      <Title>비디오 편집</Title>
      <section className="mb-4 flex gap-2">
        <Button onClick={handleFindVideo}>비디오 선택</Button>
        <Button onClick={handleSetupOutput}>저장위치 선택</Button>
      </section>
      <section className="flex gap-10">
        <div>
          <p>입력 정보</p>
          <p>
            Size : {inputVideoData?.width}x{inputVideoData?.height}
          </p>
          <p>Duration : {inputVideoData?.duration}</p>
          <p>Total Frames : {inputVideoData?.totalFrames}</p>
          <p>FPS : {inputVideoData?.fps}</p>
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
          <ProgressBar
            controls={progressControls}
            onForceChange={(ratio) => {
              if (sequenceControls.current && inputVideoData) {
                sequenceControls.current.seek(ratio * inputVideoData.duration);
              }
            }}
          />
        </div>
        {currentFrameImageUrl && (
          <div className="fixed right-0 top-0 w-[150px]">
            <p>Preview</p>
            <img src={currentFrameImageUrl} alt="" />
          </div>
        )}
      </div>
      <hr style={{ margin: '20px 0' }} />
      <Stage width={1280} height={720} ref={sequenceRef}>
        <Layer>
          <VideoSource
            width={1280}
            height={720}
            path={inputVideoPath}
            controls={sequenceControls}
            onChangeFrame={({ process }) => {
              progressControls.current?.seek(process);
            }}
            onChangeMetaData={setInputVideoData}
          />
          <Text text="Hello,world" fontSize={50} fill="white" shadowBlur={5} shadowColor="#fff" draggable />
          <Star id="1" x={100} y={100} numPoints={5} fill="red" innerRadius={40} outerRadius={70} draggable />
          <Rect x={200} y={100} width={100} height={100} fill="#fff" cornerRadius={8} draggable shadowColor="#fff" shadowBlur={10} />
        </Layer>
      </Stage>
    </Container>
  );
}
