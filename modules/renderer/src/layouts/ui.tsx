import { ReactNode } from 'react';
// import YoutubeLogo from '@renderer/src/assets/images/youtube.png';
import cn from '@renderer/src/utils/cn';

export default function SideBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <aside className={cn('w-sidebar fixed flex h-full flex-col bg-zinc-950', className)}>
      <div className="my-8 flex items-center justify-center">{/*<img src={YoutubeLogo} className="w-20" />*/}</div>
      <nav className="flex flex-1 flex-col">{children}</nav>
    </aside>
  );
}

function Menu({ children, title, className }: { children: ReactNode; title: string; className?: string }) {
  return (
    <div className={cn('pl-6 pr-2', className)}>
      <h2 className="mb-4 text-sm font-light">{title}</h2>
      <ul className="flex flex-col gap-1">{children}</ul>
    </div>
  );
}
function MenuItem({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <li
      className={cn('transition-all hover:opacity-100 [&>*]:flex [&>*]:items-center [&>*]:gap-4 [&>*]:rounded [&>*]:px-2 [&>*]:py-2', {
        'opacity-100': active,
        'opacity-40': !active
      })}>
      {children}
    </li>
  );
}

SideBar.Menu = Menu;
SideBar.MenuItem = MenuItem;
