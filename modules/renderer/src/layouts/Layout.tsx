import { FC, ReactNode } from 'react';
import useDeepLink from '@renderer/src/hooks/useDeepLink';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiFillSetting } from 'react-icons/ai';
import SideBar from '@renderer/src/layouts/ui';
import { MdAutoFixHigh } from 'react-icons/md';
import { FaRecordVinyl } from 'react-icons/fa';

interface Props {
  children: ReactNode;
}

const MENU = [
  {
    title: '수동 녹화',
    path: '/',
    icon: <FaRecordVinyl />
  },
  {
    title: '자동 녹화',
    path: '/auto-record',
    icon: <MdAutoFixHigh />
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <AiFillSetting />
  }
];

const Layout: FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useDeepLink((url) => {
    navigate(url);
  }, []);

  return (
    <>
      <nav id="window-handle">
        <p>Timmy Recorder</p>
      </nav>
      <div className="flex">
        <SideBar>
          <SideBar.Menu title="메뉴">
            {MENU.map((menu) => (
              <SideBar.MenuItem active={location.pathname === menu.path} key={menu.path}>
                <Link to={menu.path}>
                  {menu.icon}
                  <span>{menu.title}</span>
                </Link>
              </SideBar.MenuItem>
            ))}
          </SideBar.Menu>
        </SideBar>
        <main className="ml-sidebar flex-1">{children}</main>
      </div>
    </>
  );
};

export default Layout;
