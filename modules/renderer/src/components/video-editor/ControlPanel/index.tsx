import { FaPause, FaPlay } from 'react-icons/fa6';
import { BiReset } from 'react-icons/bi';
import { ButtonHTMLAttributes } from 'react';
import { useEditorAtom } from '@renderer/src/store/editorAtom';
import cn from '@renderer/src/utils/cn';
import { videoEditorManager } from '@renderer/src/videoEditorModule/videoEditorManager';

export default function ControlPanel() {
  const {
    state: { playerState }
  } = useEditorAtom();
  return (
    <div className="flex items-center justify-center gap-2">
      <ControlBtn
        onClick={() => {
          videoEditorManager.playerState = 'play';
        }}
        active={playerState === 'play'}>
        <FaPlay size={20} />
      </ControlBtn>
      <ControlBtn
        onClick={() => {
          videoEditorManager.playerState = 'pause';
        }}
        active={playerState === 'pause'}>
        <FaPause size={20} />
      </ControlBtn>
      <ControlBtn
        active={playerState === 'reset'}
        onClick={() => {
          videoEditorManager.playerState = 'reset';
        }}>
        <BiReset size={20} />
      </ControlBtn>
    </div>
  );
}

function ControlBtn({ children, active, ...props }: { children: React.ReactNode; active: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('rounded p-1', 'hover:bg-neutral-700', {
        'bg-neutral-700': active
      })}
      {...props}>
      {children}
    </button>
  );
}
