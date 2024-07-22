type Props = {
  children: React.ReactNode;
};

export default function Usage({ children }: Props) {
  return <div className="font-light">{children}</div>;
}

function Raw({ children }: Props) {
  return <div className="items-centet yx-2 flex justify-between pr-2">{children}</div>;
}

function Value({ children }: Props) {
  return <div className="text-sm opacity-80">{children}</div>;
}

Usage.Raw = Raw;
Usage.Value = Value;
