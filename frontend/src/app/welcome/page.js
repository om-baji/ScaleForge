"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout } from "../cognito";

export default function Welcome() { 
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await getUser();
                setUser(userData);
            } catch (e) {
                console.error('Error fetching user data:', e);
                setError('Failed to load user data');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (e) {
            console.error('Error logging out:', e);
        }
    };

    if (loading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
                <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p className='text-gray-600'>Loading user data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
                <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center'>
                    <div className='text-red-600 mb-4'>
                        <svg className='w-12 h-12 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                    </div>
                    <h2 className='text-xl font-bold text-gray-800 mb-2'>Error</h2>
                    <p className='text-gray-600 mb-4'>{error}</p>
                    <button 
                        onClick={() => router.push('/login')}
                        className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200'
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }
    
    return(
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
            <div className='max-w-4xl mx-auto'>
                {/* Header */}
                <div className='bg-white rounded-2xl shadow-2xl p-6 mb-6'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
                                Welcome, {user?.username}!
                            </h1>
                            <p className='text-gray-600'>
                                You have successfully logged into your account
                            </p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className='bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>

                {/* User Profile Card */}
                <div className='bg-white rounded-2xl shadow-2xl p-6'>
                    <div className='flex items-center mb-6'>
                        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4'>
                            <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                            </svg>
                        </div>
                        <div>
                            <h2 className='text-2xl font-bold text-gray-800'>User Profile</h2>
                            <p className='text-gray-600'>Your account information</p>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
                                <div className='bg-gray-50 border border-gray-300 rounded-lg p-3'>
                                    <span className='text-gray-800'>{user?.username}</span>
                                </div>
                            </div>
                            
                            {user?.attributes?.email && (
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                                    <div className='bg-gray-50 border border-gray-300 rounded-lg p-3'>
                                        <span className='text-gray-800'>{user.attributes.email}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='space-y-4'>
                            {user?.attributes?.email_verified && (
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email Verified</label>
                                    <div className='bg-gray-50 border border-gray-300 rounded-lg p-3'>
                                        <span className={`font-semibold ${
                                            user.attributes.email_verified === 'true' 
                                                ? 'text-green-600' 
                                                : 'text-red-600'
                                        }`}>
                                            {user.attributes.email_verified === 'true' ? 'Verified' : 'Not Verified'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {user?.attributes?.sub && (
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>User ID</label>
                                    <div className='bg-gray-50 border border-gray-300 rounded-lg p-3'>
                                        <span className='text-gray-800 text-sm font-mono'>{user.attributes.sub}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* All Attributes Section */}
                    {user?.attributes && Object.keys(user.attributes).length > 0 && (
                        <div className='mt-8'>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>All Attributes</h3>
                            <div className='bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto'>
                                <div className='space-y-2'>
                                    {Object.entries(user.attributes).map(([key, value]) => (
                                        <div key={key} className='flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0'>
                                            <span className='font-medium text-gray-700'>{key}:</span>
                                            <span className='text-gray-600 text-sm'>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <div className='mt-6 text-center'>
                    <div className='space-x-4'>
                        <button 
                            onClick={() => router.push('/profile')}
                            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200'
                        >
                            View Full Profile
                        </button>
                        <button 
                            onClick={() => router.push('/login')}
                            className='text-blue-600 hover:text-blue-800 font-medium'
                        >
                            Login Page
                        </button>
                        <span className='text-gray-400'>|</span>
                        <button 
                            onClick={() => router.push('/signin')}
                            className='text-blue-600 hover:text-blue-800 font-medium'
                        >
                            Register New User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}