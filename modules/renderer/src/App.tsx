import { HashRouter, Route, Routes } from 'react-router-dom';
import ManualRecord from '@renderer/src/pages/ManualRecord';
import { ModalProvider } from 'async-modal-react';
import '@renderer/src/styles/index.scss';
import Layout from '@renderer/src/layouts/Layout';
import { DevTools } from 'jotai-devtools';
import 'jotai-devtools/styles.css';
import { NextUIProvider } from '@nextui-org/react';
import Settings from '@renderer/src/pages/Settings';
import AutoRecord from '@renderer/src/pages/AutoRecord';
import VideoEditor from '@renderer/src/pages/VideoEditor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const App = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 1000 * 60 * 2,
            staleTime: 1000 * 60
          }
        }
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <NextUIProvider>
        <HashRouter>
          <DevTools />
          <ModalProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<ManualRecord />} />
                <Route path="/auto-record" element={<AutoRecord />} />
                <Route path="/video-editor" element={<VideoEditor />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </ModalProvider>
        </HashRouter>
      </NextUIProvider>
    </QueryClientProvider>
  );
};

export default App;
