type Props = {
  children: React.ReactNode;
};

export default function Title({ children }: Props) {
  return <h1 className="my-6 text-2xl font-bold">{children}</h1>;
}
