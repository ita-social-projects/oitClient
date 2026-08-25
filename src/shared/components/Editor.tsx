import BlotFormatter from 'quill-blot-formatter-mobile';
import { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

Quill.register('modules/blotFormatter', BlotFormatter);

// Quill by default only allows 'http', 'https', and 'data' protocols for images and strips 'blob:' to '//:0'.
// We extend Image.sanitize to allow 'blob:' URLs for instant local previews.
const QuillImage = Quill.import('formats/image') as any;
if (QuillImage) {
  const originalSanitize = QuillImage.sanitize;
  QuillImage.sanitize = function (url: string) {
    if (typeof url === 'string' && (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/'))) {
      return url;
    }
    return originalSanitize ? originalSanitize.call(this, url) : url;
  };
  Quill.register(QuillImage, true);
}

export interface EditorHandle {
  insertImage: (url: string) => void;
}

interface EditorProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onImageUpload?: (file: File, blobUrl: string) => void | Promise<void>;
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

          input.onchange = () => {
            const files = Array.from(input.files ?? []);
            if (!files.length) return;

            const quill = quillRef.current?.getEditor();
            let currentIndex = quill?.getSelection()?.index ?? quill?.getLength() ?? 0;

            for (const file of files) {
              const localBlobUrl = URL.createObjectURL(file);
              if (quill) {
                quill.insertEmbed(currentIndex, 'image', localBlobUrl);
                currentIndex += 1;
                quill.setSelection(currentIndex, 0);
              }
              onImageUpload(file, localBlobUrl);
            }

            input.value = '';
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
      formats={['header', 'bold', 'italic', 'underline', 'list', 'link', 'image']}
      ref={quillRef}
    />
  );
});

export default Editor;
