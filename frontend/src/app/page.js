"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "./cognito";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (authenticated) {
          router.push('/welcome');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>Welcome</h1>
          <p className='text-gray-600 text-lg'>
            Please choose an option to continue
          </p>
        </div>
        
        <div className='space-y-4'>
          <Link 
            href='/login'
            className='block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-lg'
          >
            Sign In
          </Link>
          
          <Link 
            href='/signin'
            className='block w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-lg'
          >
            Create Account
          </Link>
        </div>
        
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <p className='text-sm text-gray-500'>
            Secure authentication powered by AWS Cognito
          </p>
        </div>
      </div>
    </div>
  );
}
