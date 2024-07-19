import { ReactNode } from 'react';
// import YoutubeLogo from '@renderer/src/assets/images/youtube.png';
import cn from '@renderer/src/utils/cn';

export default function SideBar({ children }: { children: ReactNode }) {
  return (
    <aside className="w-sidebar fixed h-full bg-zinc-950">
      <div className="my-8 flex items-center justify-center">{/*<img src={YoutubeLogo} className="w-20" />*/}</div>
      <nav className="">{children}</nav>
    </aside>
  );
}

function Menu({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="pl-6 pr-2">
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
