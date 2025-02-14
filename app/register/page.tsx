'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

function Register() {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [error, seterror] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      seterror('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = res.json();
      if (!res.ok) {
        seterror("Couldn't register");
        return;
      }
      router.push('/login');
    } catch (error) {}
  };

  return <div>Register</div>;
}

export default Register;
