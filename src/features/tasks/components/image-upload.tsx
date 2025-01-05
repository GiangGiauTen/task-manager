// import React, { useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { Button } from '@/components/ui/button';
// import { ImageIcon } from 'lucide-react';
// import { Editor } from '@tiptap/react';

// interface ImageUploadProps {
//   editor: Editor | null;
// }

// export const ImageUpload = ({ editor }: ImageUploadProps) => {
//   const [isUploading, setIsUploading] = useState(false);

//   const onDrop = (acceptedFiles: File[]) => {
//     if (!acceptedFiles || acceptedFiles.length === 0) return;

//     const file = acceptedFiles[0];
//     setIsUploading(true);

//     // Giả sử bạn đang dùng Appwrite hoặc bất kỳ dịch vụ nào để upload file
//     uploadImage(file).then(url => {
//       // Chèn ảnh vào editor
//       if (editor) {
//         editor.chain().focus().setImage({ src: url }).run();
//       }
//       setIsUploading(false);
//     });
//   };

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop,
//     accept: 'image/*',
//   });

//   const uploadImage = async (file: File) => {
//     // Upload ảnh lên Appwrite hoặc S3 (hoặc dịch vụ khác)
//     // Sau khi upload thành công, trả về URL của ảnh
//     const formData = new FormData();
//     formData.append('file', file);

//     // Ví dụ: Upload ảnh lên Appwrite hoặc một dịch vụ lưu trữ khác
//     const response = await fetch('/upload', {
//       method: 'POST',
//       body: formData,
//     });

//     const data = await response.json();
//     return data.url; // URL ảnh đã upload
//   };

//   return (
//     <div {...getRootProps()} className="border p-2 cursor-pointer">
//       <input {...getInputProps()} />
//       <Button variant="ghost" disabled={isUploading}>
//         {isUploading ? 'Uploading...' : <ImageIcon className="w-5 h-5" />}
//       </Button>
//     </div>
//   );
// };
