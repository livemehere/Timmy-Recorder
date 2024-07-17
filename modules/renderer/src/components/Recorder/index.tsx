import { useState } from 'react';
import useInvoke from '@renderer/src/hooks/useInvoke';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

type Props = {};

type TScreen = {
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

export default function Recorder({}: Props) {
  const [screenList, setScreenList] = useState<TScreen[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<TScreen | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedFPS, setSelectedFPS] = useState<number | null>(null);
  const { data: formats } = useInvoke<string[]>('osn:formatValues', true, (formats) => {
    setSelectedFormat(formats[0]);
  });
  const { data: fpsValues } = useInvoke<number[]>('osn:getFpsValues', true, (fpsValues) => {
    setSelectedFPS(fpsValues[0]);
  });
  const { invoke: invokeSetFormat } = useInvoke<undefined>('osn:setFormat');
  const { invoke: invokeSetFps } = useInvoke<undefined>('osn:setFps');

  const start = () => {
    window.app.invoke('osn:start');
  };

  const stop = () => {
    window.app.invoke('osn:stop');
  };

  return (
    <div className={'flex flex-col items-center'}>
      <div>Recorder</div>
      <section className={'m-auto mb-2 inline-flex justify-center gap-1 rounded-full bg-neutral-950 p-1'}>
        <button className={'rounded-full px-2 py-1 text-sm hover:bg-neutral-800'} onClick={start}>
          녹화 시작
        </button>
        <button className={'rounded-full px-2 py-1 text-sm hover:bg-neutral-800'} onClick={stop}>
          녹화 중지
        </button>
      </section>
      <section className={'flex gap-6'}>
        <Listbox
          value={selectedFormat}
          onChange={(value) => {
            setSelectedFormat(value);
            invokeSetFormat(value);
          }}>
          <div className={'flex flex-col gap-2'}>
            <ListboxButton>{selectedFormat}</ListboxButton>
            <ListboxOptions>
              {formats?.map((format) => (
                <ListboxOption key={format} value={format} className={'cursor-pointer'}>
                  {format}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        <Listbox
          value={selectedFPS}
          onChange={(value) => {
            setSelectedFPS(value);
            invokeSetFps(value);
          }}>
          <div className={'flex flex-col gap-2'}>
            <ListboxButton>{selectedFPS}</ListboxButton>
            <ListboxOptions>
              {fpsValues?.map((fps) => (
                <ListboxOption key={fps} value={fps} className={'cursor-pointer'}>
                  {fps}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </section>
      <section className={'flex flex-col items-center'}>
        <h3 className={'mb-2 text-xl font-bold'}>스크린 목록</h3>
        {screenList.length > 0 ? (
          <ul>
            {screenList.map((screen, index) => (
              <li
                key={index}
                onClick={() => {
                  setSelectedScreen(screen);
                }}>
                <div>{screen.name}</div>
                <div>
                  {screen.width} x {screen.height}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div>녹화 가능한 스크린이 없습니다 ㅜ_ㅜ</div>
        )}
      </section>
    </div>
  );
}
