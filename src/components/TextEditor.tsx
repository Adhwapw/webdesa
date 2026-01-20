'use client'

import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css' // Perhatikan import CSS dari 'react-quill-new'

// Import library baru secara dinamis
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as any

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TextEditor({ value, onChange }: TextEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'], 
      [{ list: 'ordered' }, { list: 'bullet' }], 
      ['link'], 
      ['clean'], 
    ],
  }

  return (
    <div className="bg-white text-black rounded-lg overflow-hidden border border-gray-300">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
        className="h-64 mb-12" 
      />
    </div>
  )
}