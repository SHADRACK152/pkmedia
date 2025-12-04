import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write your article here...", 
  className = "",
  onImageUpload
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const onImageUploadRef = useRef(onImageUpload);
  const onChangeRef = useRef(onChange);
  const isUpdatingRef = useRef(false);

  // Update the refs when props change
  useEffect(() => {
    onImageUploadRef.current = onImageUpload;
  }, [onImageUpload]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !editorRef.current || quillRef.current) return;

    // Dynamically import Quill to avoid SSR issues
    import('quill').then((Quill) => {
      if (quillRef.current) return; // Already initialized

      const quill = new Quill.default(editorRef.current!, {
        theme: 'snow',
        placeholder,
        modules: {
          toolbar: {
            container: [
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'font': [] }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'script': 'sub'}, { 'script': 'super' }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'align': [] }],
              ['blockquote', 'code-block'],
              ['link', 'image', 'video'],
              ['clean']
            ],
            handlers: {
              image: function() {
                if (onImageUploadRef.current) {
                  const input = document.createElement('input');
                  input.setAttribute('type', 'file');
                  input.setAttribute('accept', 'image/*');
                  input.click();

                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (file) {
                      try {
                        const url = await onImageUploadRef.current!(file);
                        const range = quill.getSelection(true);
                        quill.insertEmbed(range.index, 'image', url);
                        quill.setSelection(range.index + 1, 0);
                      } catch (error) {
                        console.error('Image upload failed:', error);
                        alert('Failed to upload image');
                      }
                    }
                  };
                } else {
                  // Default image handler (URL prompt)
                  const url = prompt('Enter image URL:');
                  if (url) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', url);
                    quill.setSelection(range.index + 1, 0);
                  }
                }
              }
            }
          }
        }
      });

      // Set initial value
      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }

      // Handle changes
      quill.on('text-change', () => {
        if (!isUpdatingRef.current) {
          const html = quill.root.innerHTML;
          onChangeRef.current(html);
        }
      });

      quillRef.current = quill;
    });

    // Cleanup function
    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
        quillRef.current = null;
      }
    };
  }, [mounted]); // Only depend on mounted

  // Update content when value prop changes externally
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      isUpdatingRef.current = true;
      const selection = quillRef.current.getSelection();
      quillRef.current.clipboard.dangerouslyPasteHTML(value || '');
      if (selection) {
        quillRef.current.setSelection(selection);
      }
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [value]);

  if (!mounted) {
    return (
      <div className={`border rounded-md p-4 min-h-[400px] bg-slate-50 ${className}`}>
        Loading editor...
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={editorRef} className="min-h-[400px] bg-white" />
      <style>{`
        .ql-toolbar {
          background: #f8fafc;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px 8px 0 0;
        }
        .ql-container {
          border: 1px solid #e2e8f0 !important;
          border-radius: 0 0 8px 8px;
          font-family: Georgia, serif;
          font-size: 16px;
        }
        .ql-editor {
          min-height: 400px;
        }
        .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
