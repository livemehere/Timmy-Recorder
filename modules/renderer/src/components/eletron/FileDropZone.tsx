import { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onDrop: (files: FileList) => void;
}

const FileDropZone: FC<Props> = ({ children, onDrop }) => {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          onDrop(files);
        }
      }}>
      {children}
    </div>
  );
};

export default FileDropZone;
