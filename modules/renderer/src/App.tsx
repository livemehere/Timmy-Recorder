import { HashRouter, Route, Routes } from 'react-router-dom';
import Home from '@renderer/src/pages/Home';
import { ModalProvider } from 'async-modal-react';
import '@renderer/src/styles/index.scss';
import Layout from '@renderer/src/layouts/Layout';
import { DevTools } from 'jotai-devtools';
import 'jotai-devtools/styles.css';
import { NextUIProvider } from '@nextui-org/react';

const App = () => {
  return (
    <NextUIProvider>
      <HashRouter>
        <DevTools />
        <ModalProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </Layout>
        </ModalProvider>
      </HashRouter>
    </NextUIProvider>
  );
};

export default App;
