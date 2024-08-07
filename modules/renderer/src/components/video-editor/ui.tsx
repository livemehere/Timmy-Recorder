type Props = {
  children: React.ReactNode;
};

export default function VideoEditorUI({ children }: Props) {
  return <div className="flex max-w-[1920px] flex-col gap-1">{children}</div>;
}

function ViewAndResourceSection({ children }: Props) {
  return <section className="flex h-[720px] gap-1 ">{children}</section>;
}

function ControlSection({ children }: Props) {
  return <section className="bg-neutral-950 p-1">{children}</section>;
}

function TimelineSection({ children }: Props) {
  return <section className="relative mb-8">{children}</section>;
}

VideoEditorUI.ViewAndResourceSection = ViewAndResourceSection;
VideoEditorUI.ControlSection = ControlSection;
VideoEditorUI.TimelineSection = TimelineSection;
