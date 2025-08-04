"use client"
import React, { useState } from 'react'
import { confirmation, resendCode } from '../cognito.js'
import { useRouter } from 'next/navigation'

const ConfirmationCode = () => {
    const router = useRouter(); 
    const [confirmationCode, setConfirmationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setConfirmationCode(value);
        setError(''); 
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (confirmationCode.length < 6) {
            setError('Please enter a valid 6-digit confirmation code');
            return;
        }
        
        const username = localStorage.getItem('pendingUsername');
        if (!username) {
            setError('Session expired. Please register again.');
            return;
        }
        
        setLoading(true);
        try{
            await confirmation(confirmationCode, username); 
            console.log("Confirmation successful");
            localStorage.removeItem('pendingUsername'); 
            router.push('/welcome');
        }catch(e){
            console.log("Error occurred", e); 
            setError('Invalid confirmation code. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleResendCode = async () => {
        const username = localStorage.getItem('pendingUsername');
        if (!username) {
            setError('Session expired. Please register again.');
            return;
        }

        setResendLoading(true);
        setError('');
        setSuccessMessage('');
        
        try {
            await resendCode(username);
            setSuccessMessage('Confirmation code sent successfully!');
            console.log('Resending confirmation code...');
        } catch (e) {
            console.error('Error resending code:', e);
            setError('Failed to resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md'>
                <div className='text-center mb-8'>
                    <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                        <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 7.89a1 1 0 001.42 0L21 7M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                        </svg>
                    </div>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>Check Your Email</h1>
                    <p className='text-gray-600'>We've sent a 6-digit confirmation code to your email address</p>
                </div>
                
                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2 text-center'>
                            Confirmation Code
                        </label>
                        <input 
                            className='w-full px-4 py-4 text-2xl text-center text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out tracking-widest' 
                            type='text'  
                            value={confirmationCode}
                            onChange={handleChange} 
                            placeholder='000000'
                            maxLength={6}
                            required 
                        /> 
                        <p className='text-xs text-gray-500 mt-2 text-center'>Enter the 6-digit code sent to your email</p>
                        {error && (
                            <p className='text-sm text-red-600 mt-2 text-center'>{error}</p>
                        )}
                        {successMessage && (
                            <p className='text-sm text-green-600 mt-2 text-center'>{successMessage}</p>
                        )}
                    </div>
                    
                    <button 
                        className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 focus:ring-blue-500 text-white'
                        }`}
                        type='submit'
                        disabled={loading}
                    >
                        {loading ? (
                            <div className='flex items-center justify-center'>
                                <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' fill='none' viewBox='0 0 24 24'>
                                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                                </svg>
                                Verifying...
                            </div>
                        ) : (
                            'Verify Code'
                        )}
                    </button>
                </form>
                
                <div className='mt-6 text-center'>
                    <p className='text-sm text-gray-600 mb-2'>
                        Didn't receive the code?
                    </p>
                    <button 
                        onClick={handleResendCode}
                        disabled={resendLoading}
                        className={`font-medium text-sm underline hover:no-underline transition duration-200 ${
                            resendLoading 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-blue-600 hover:text-blue-800'
                        }`}
                    >
                        {resendLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                </div>
                
                <div className='mt-4 text-center'>
                    <a href='/signin' className='text-sm text-gray-500 hover:text-gray-700'>
                        ← Back to Sign In
                    </a>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationCode