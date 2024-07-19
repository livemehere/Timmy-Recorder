type Props = {
  children: React.ReactNode;
};

export default function Title({ children }: Props) {
  return <h1 className="my-6 text-2xl font-bold">{children}</h1>;
}

function Sub({ children }: Props) {
  return <h2 className="my-4 text-xl font-bold">{children}</h2>;
}

Title.Sub = Sub;
