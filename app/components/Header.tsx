'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useNotification } from './Notification';

export default function Header() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification('Signed out successfully', 'success');
    } catch {
      showNotification('Failed to sign out', 'error');
    }
  };

  return (
    <div className='navbar bg-base-100'>
      <div className='flex-1'>
        <Link href='/' className='btn btn-ghost text-xl'>
          ImageKit ReelsPro
        </Link>
      </div>
      <div className='flex-none gap-2'>
        <div className='form-control'>
          <input
            type='text'
            placeholder='Search'
            className='input input-bordered w-24 md:w-auto'
          />
        </div>
        <div className='dropdown dropdown-end'>
          <div
            tabIndex={0}
            role='button'
            className='btn btn-ghost btn-circle avatar'>
            <div className='w-10 rounded-full'>
              <img
                alt='User Profile'
                src='https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className='menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow'>
            {session ? (
              <>
                <li>
                  <span className='justify-between'>
                    {session.user?.email?.split('@')[0]}
                  </span>
                </li>
                <li>
                  <Link href='/upload'>Video Upload</Link>
                </li>
                <li>
                  <button onClick={handleSignOut}>Sign Out</button>
                </li>
              </>
            ) : (
              <li>
                <Link href='/login'>Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
