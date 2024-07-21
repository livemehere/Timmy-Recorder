import { FC, ReactNode, useEffect } from 'react';
import useDeepLink from '@renderer/src/hooks/useDeepLink';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiFillSetting } from 'react-icons/ai';
import SideBar from '@renderer/src/layouts/ui';
import { MdAutoFixHigh } from 'react-icons/md';
import { FaRecordVinyl } from 'react-icons/fa';
import { CgEditFlipH } from 'react-icons/cg';
import { useModal } from 'async-modal-react';
import RecordingOverlay from '@renderer/src/components/modals/RecordingOverlay';
import { useGlobalAtom } from '@renderer/src/store/globalAtom';

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
    title: '편집',
    path: '/video-editor',
    icon: <CgEditFlipH />
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
  const {
    state: { isRecording }
  } = useGlobalAtom();
  const { pushModal, closeAllModals } = useModal();

  useEffect(() => {
    if (isRecording) {
      pushModal(
        RecordingOverlay,
        {},
        {
          onClickOutsideClose: false
        }
      );
    } else {
      closeAllModals();
    }
  }, [isRecording]);

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
