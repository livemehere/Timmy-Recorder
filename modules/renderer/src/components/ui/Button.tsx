import cn from '@renderer/src/utils/cn';

type Props = {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, className, ...props }: Props) {
  return (
    <button className={cn('rounded-sm bg-blue-500 px-2 transition-all hover:bg-blue-900', className)} {...props}>
      {children}
    </button>
  );
}
