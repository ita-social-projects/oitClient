import BlotFormatter from 'quill-blot-formatter-mobile';
import { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

Quill.register('modules/blotFormatter', BlotFormatter);

export interface EditorHandle {
  insertImage: (url: string) => void;
}

interface EditorProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ className, value = '', onChange, onImageUpload }, ref) => {
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

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
      ],
      handlers: {
        image: () => {
          if (!onImageUpload) return;

          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.multiple = true;

          input.onchange = async () => {
            const files = Array.from(input.files ?? []);
            if (!files.length) return;

            try {
              for (const file of files) {
                try {
                  const url = await onImageUpload(file);
                  const quill = quillRef.current?.getEditor();
                  if (!quill) continue;
                  const range = quill.getSelection() ?? { index: quill.getLength(), length: 0 };
                  quill.insertEmbed(range.index, 'image', url);
                  quill.setSelection(range.index + 1, 0);
                } catch {
                  // upload failed for this file, continue with next
                }
              }
            } finally {
              input.value = '';
            }
          };

          input.click();
        },
      },
    },
    blotFormatter: {
      overlay: {
        style: {
          border: '2px solid #3b82f6',
        },
      },
      align: {
        allowedAlignments: ['left', 'center', 'right'],
      },
    },
  }), [onImageUpload]);

  return (
    <ReactQuill
      className={className}
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link', 'image']}
      ref={quillRef}
    />
  );
});

export default Editor;
