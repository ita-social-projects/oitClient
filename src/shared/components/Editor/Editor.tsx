import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface EditorProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function Editor({ className, value = '', onChange }: EditorProps) {
  return (
    <ReactQuill
      className={className}
      theme="snow"
      value={value}
      onChange={onChange}
      formats={['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link']}
    />
  );
}
