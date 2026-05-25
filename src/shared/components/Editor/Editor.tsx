import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useRef, forwardRef, useImperativeHandle } from 'react';

export interface EditorHandle {
  insertImage: (url: string) => void;
}

interface EditorProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ className, value = '', onChange }, ref) => {
  const quillRef = useRef<ReactQuill>(null);

  useImperativeHandle(ref, () => ({
    insertImage: (url: string) => {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;
      const range = quill.getSelection() ?? { index: quill.getLength(), length: 0 };
      quill.insertEmbed(range.index, 'image', url);
      quill.setSelection(range.index + 1, 0);
    },
  }));

  return (
    <ReactQuill
      className={className}
      theme="snow"
      value={value}
      onChange={onChange}
      formats={['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link', 'image']}
      ref={quillRef}
    />
  );
});

export default Editor;
