import { FC, ReactNode } from 'react';
import useDeepLink from '@renderer/src/hooks/useDeepLink';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  const navigate = useNavigate();

  useDeepLink((url) => {
    navigate(url);
  }, []);

  return (
    <>
      <nav id="window-handle">
        <p>Timmy Recorder</p>
      </nav>
      <main>{children}</main>
    </>
  );
};

export default Layout;
