import {useState} from "react";

type Props = {

}

type TScreen = {
    name:string;
    width: number;
    height: number;
    x:number;
    y:number;
}

export default function Recorder({}:Props) {
    const [screenList, setScreenList] = useState<TScreen[]>([])
    const [selectedScreen, setSelectedScreen] = useState<TScreen | null>(null)
    return (
        <div className={'flex flex-col items-center'}>
           <div>Recorder</div>
            <section className={'m-auto inline-flex justify-center gap-1 mb-2 bg-neutral-950 p-1 rounded-full'}>
                <button className={'hover:bg-neutral-800 rounded-full py-1 px-2 text-sm'}>녹화 시작</button>
                <button className={'hover:bg-neutral-800 rounded-full py-1 px-2 text-sm'}>녹화 중지</button>
            </section>
            <section className={'flex flex-col items-center'}>
                <h3 className={'text-xl font-bold mb-2'}>스크린 목록</h3>
                {screenList.length >0 ?<ul>
                    {screenList.map((screen, index) => (
                        <li key={index} onClick={() => {
                            setSelectedScreen(screen)
                        }}>
                            <div>{screen.name}</div>
                            <div>{screen.width} x {screen.height}</div>
                        </li>
                    ))}
                </ul> : <div>녹화 가능한 스크린이 없습니다 ㅜ_ㅜ</div>}
            </section>
        </div>
    );
}
