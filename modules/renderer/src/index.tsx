import { createRoot } from 'react-dom/client';
import App from '@renderer/src/App';
import { ErrorBoundary } from 'react-error-boundary';

const root = createRoot(document.getElementById('root')!);
root.render(
  <ErrorBoundary
    onError={(err) => {
      console.log(err);
    }}
    fallback={
      <div>
        <h1>Something went wrong</h1>
      </div>
    }>
    <App />
  </ErrorBoundary>
);
