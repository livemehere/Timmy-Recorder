import { ModalProps } from 'async-modal-react/dist/types/modal';
import Button from '@renderer/src/components/ui/Button';
import { videoEditorManager } from '@renderer/src/videoEditorModule/videoEditorManager';
import { useEditorAtom } from '@renderer/src/store/editorAtom';
import { useState } from 'react';

export interface ExtractModalProps extends ModalProps {}

const ExtractModal = ({ close, resolve, reject }: ExtractModalProps) => {
  const {
    state: { output }
  } = useEditorAtom();
  const [filename, setFilename] = useState(output ? output.outputFilename : '');
  const handleSetupOutput = async () => {
    const [outputPath] = await window.app.invoke('dialog:open', {
      title: '저장위치 선택',
      properties: ['openDirectory']
    });
    videoEditorManager.outDir = outputPath;
  };

  const handleRenderingStart = async () => {
    try {
      await videoEditorManager.saveFrames();
      const res = await videoEditorManager.generateVideo();
      resolve(res);
    } catch (e) {
      reject(e);
    }
  };

  return (
    <div>
      <h2>영상을 추출합니다.</h2>
      <div>
        <Button onClick={handleSetupOutput}>저장위치 선택</Button>
        <span>저장 위치</span>
        <span>{output ? output.outDir : '선택해주세요'}</span>
      </div>
      <div>
        <label>파일이름</label>
        <input
          type="text"
          value={filename}
          onChange={(e) => {
            const v = e.target.value;
            setFilename(v);
            videoEditorManager.OutputFilename = v;
          }}
        />
      </div>
      <Button onClick={handleRenderingStart}>렌더링 시작</Button>
    </div>
  );
};

export default ExtractModal;
