import Container from '../components/ui/Container';
import Resources from '@renderer/src/components/video-editor/Resources';
import Timeline from '@renderer/src/components/video-editor/Timeline';
import VideoEditorUI from '@renderer/src/components/video-editor/ui';
import ControlPanel from '@renderer/src/components/video-editor/ControlPanel';
import useVideoEditorManagerBridge from '@renderer/src/videoEditorModule/usePlayMangerBridge';
import { videoEditorManager } from '@renderer/src/videoEditorModule/videoEditorManager';
import { useEffect, useRef } from 'react';
import { useEventListener } from 'usehooks-ts';
import { useModal } from 'async-modal-react';
import { Button } from '@nextui-org/react';
import ExtractModal from '@renderer/src/components/modals/ExtractModal';

export default function VideoEditor() {
  const previewRef = useRef<HTMLDivElement>(null);
  const { pushModal } = useModal();
  useEffect(() => {
    if (previewRef.current) {
      console.log('set preview');
      videoEditorManager.previewEl = previewRef.current;
    }
  }, []);
  useVideoEditorManagerBridge();
  useEventListener('keydown', (e) => {
    const step = 1;
    if (e.key === 'ArrowRight') {
      videoEditorManager.seek(videoEditorManager.curFrame + step);
    } else if (e.key === 'ArrowLeft') {
      videoEditorManager.seek(videoEditorManager.curFrame - step);
    } else if (e.key === ' ') {
      videoEditorManager.playerState = videoEditorManager.playerState === 'play' ? 'pause' : 'play';
    }
  });

  return (
    <Container>
      <VideoEditorUI>
        <VideoEditorUI.ViewAndResourceSection>
          <section className="flex h-[720px] w-[1280px] flex-1 items-center justify-center bg-black/20">
            <div ref={previewRef} />
          </section>
          <section className="w-[300px] bg-neutral-950">
            <Resources />
          </section>
        </VideoEditorUI.ViewAndResourceSection>
        <VideoEditorUI.ControlSection>
          <ControlPanel />
        </VideoEditorUI.ControlSection>
        <VideoEditorUI.TimelineSection>
          <Timeline />
        </VideoEditorUI.TimelineSection>
      </VideoEditorUI>
      <section>
        <Button
          onClick={async () => {
            pushModal(ExtractModal);
          }}>
          추출
        </Button>
      </section>
    </Container>
  );
}
