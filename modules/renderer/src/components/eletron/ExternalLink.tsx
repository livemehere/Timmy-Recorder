import { HTMLAttributes } from 'react';

type Props = {
  href: string;
  children: React.ReactNode;
};

export default function ExternalLink({ href, children, onClick, ...props }: Props & HTMLAttributes<HTMLDivElement>) {
  const _onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    window.app.invoke('shell:openExternal', href);
    onClick?.(e);
  };

  return (
    <div {...props} onClick={_onClick} className={'cursor-pointer ' + props.className}>
      {children}
    </div>
  );
}
