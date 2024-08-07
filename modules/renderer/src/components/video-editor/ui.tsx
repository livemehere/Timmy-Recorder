type Props = {
  children: React.ReactNode;
};

export default function VideoEditorUI({ children }: Props) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

function ViewAndResourceSection({ children }: Props) {
  return <section className="flex gap-1">{children}</section>;
}

function ControlSection({ children }: Props) {
  return <section className="bg-neutral-950 p-1">{children}</section>;
}

function TimelineSection({ children }: Props) {
  return <section className="relative mb-8 h-[300px] bg-neutral-950">{children}</section>;
}

VideoEditorUI.ViewAndResourceSection = ViewAndResourceSection;
VideoEditorUI.ControlSection = ControlSection;
VideoEditorUI.TimelineSection = TimelineSection;
