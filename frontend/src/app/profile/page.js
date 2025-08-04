"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout } from "../cognito";

export default function Profile() { 
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchUserData = async () => {
        try {
            setRefreshing(true);
            const userData = await getUser();
            setUser(userData);
            setError('');
        } catch (e) {
            console.error('Error fetching user data:', e);
            setError('Failed to load user data');
            // Redirect to login if no user is found
            router.push('/login');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
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

    const handleRefresh = () => {
        fetchUserData();
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
                                User Profile
                            </h1>
                            <p className='text-gray-600'>
                                Manage your account information
                            </p>
                        </div>
                        <div className='flex gap-3'>
                            <button 
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className='bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2'
                            >
                                <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                                </svg>
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
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
                            <h2 className='text-2xl font-bold text-gray-800'>{user?.username}</h2>
                            <p className='text-gray-600'>Account Details</p>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                        {/* Basic Information */}
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Basic Information</h3>
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
                                    <div className='bg-gray-50 border border-gray-300 rounded-lg p-3'>
                                        <span className='text-gray-800'>{user?.username}</span>
                                    </div>
                                </div>
                                
                                {user?.attributes?.email && (
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address</label>
                                        <div className='bg-gray-50 border border-gray-300 rounded-lg p-3 flex items-center justify-between'>
                                            <span className='text-gray-800'>{user.attributes.email}</span>
                                            {user.attributes.email_verified === 'true' && (
                                                <span className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full'>
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {user?.attributes?.sub && (
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>User ID</label>
                                        <div className='bg-gray-50 border border-gray-300 rounded-lg p-3'>
                                            <span className='text-gray-800 text-sm font-mono break-all'>{user.attributes.sub}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Status */}
                        <div>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Account Status</h3>
                            <div className='space-y-4'>
                                {user?.attributes?.email_verified && (
                                    <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                                        <div className='flex items-center'>
                                            <svg className='w-5 h-5 text-green-600 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                            </svg>
                                            <span className='text-green-800 font-medium'>Email Verified</span>
                                        </div>
                                        <p className='text-green-700 text-sm mt-1'>Your email address has been verified</p>
                                    </div>
                                )}

                                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                                    <div className='flex items-center'>
                                        <svg className='w-5 h-5 text-blue-600 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                                        </svg>
                                        <span className='text-blue-800 font-medium'>Account Active</span>
                                    </div>
                                    <p className='text-blue-700 text-sm mt-1'>Your account is active and secure</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All Attributes Section */}
                    {user?.attributes && Object.keys(user.attributes).length > 0 && (
                        <div className='mt-8'>
                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Technical Details</h3>
                            <div className='bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {Object.entries(user.attributes).map(([key, value]) => (
                                        <div key={key} className='bg-white rounded p-3 border'>
                                            <div className='text-sm font-medium text-gray-700 mb-1'>{key}</div>
                                            <div className='text-sm text-gray-600 break-all'>{value}</div>
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
                            onClick={() => router.push('/welcome')}
                            className='text-blue-600 hover:text-blue-800 font-medium'
                        >
                            Back to Welcome
                        </button>
                        <span className='text-gray-400'>|</span>
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
