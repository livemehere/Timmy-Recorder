type Props = {
  children: React.ReactNode;
};

export default function Container({ children }: Props) {
  return <div className="px-8 py-4">{children}</div>;
}
