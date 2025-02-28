'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '../components/Notification';
import Link from 'next/link';
import FileUpload from '../components/FileUpload';
import { IKUploadResponse } from 'imagekitio-next/dist/types/components/IKUpload/props';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const router = useRouter();
  const { showNotification } = useNotification();

  const handleUploadSuccess = (response: IKUploadResponse) => {
    // console.log(response);
    setAvatar(response.filePath);
    showNotification('Avatar uploaded!', 'success');
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
   e.preventDefault();

   if (password !== confirmPassword) {
     showNotification('Passwords do not match', 'error');
     return;
   }

   if (!avatar) {
     showNotification('Please upload an avatar', 'error');
     return;
   }

   setLoading(true);
   try {
     const res = await fetch('/api/auth/register', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         email,
         password,
         username,
         avatar, // Send the actual uploaded avatar URL
       }),
     });

     const data = await res.json();

     if (!res.ok) {
       throw new Error(data.error || 'Registration failed');
     }

     showNotification('Registration successful! Please log in.', 'success');
     router.push('/login');
   } catch (error) {
     showNotification(
       error instanceof Error ? error.message : 'Registration failed',
       'error'
     );
   } finally {
     setLoading(false);
   }
 };


  return (
    <div className='max-w-md mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Register</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='username' className='block mb-1'>
            Username
          </label>
          <input
            type='text'
            id='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className='w-full px-3 py-2 border rounded'
          />
        </div>
        <div>
          <h2>File upload</h2>
          <FileUpload
            fileType='image'
            onSuccess={handleUploadSuccess}
            onProgress={handleUploadProgress}
          />
          {uploadProgress > 0 && (
            <div className='w-full bg-gray-200 rounded-full h-2.5 mt-2'>
              <div
                className='bg-primary h-2.5 rounded-full transition-all duration-300'
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor='email' className='block mb-1'>
            Email
          </label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-3 py-2 border rounded'
          />
        </div>
        <div>
          <label htmlFor='password' className='block mb-1'>
            Password
          </label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='w-full px-3 py-2 border rounded'
          />
        </div>
        <div>
          <label htmlFor='confirmPassword' className='block mb-1'>
            Confirm Password
          </label>
          <input
            type='password'
            id='confirmPassword'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className='w-full px-3 py-2 border rounded'
          />
        </div>
        <button
          type='submit'
          className='w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600'>
          Register
        </button>
        <p className='text-center mt-4'>
          Already have an account?{' '}
          <Link href='/login' className='text-blue-500 hover:text-blue-600'>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
