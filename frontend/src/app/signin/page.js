"use client"
import React, { useState } from 'react'
import { registerUser } from '../cognito' 
import { useRouter } from 'next/navigation'

const SignIn = () => {
    const router = useRouter();
    const [userData, setUserData] = useState({
        email: '',  
        userName: '', 
        password: ''
    }); 

    const [buttonLoading, setButtonLoading] = useState(false); 

    const handleChange = (e) => {
        setUserData({
            ...userData,  
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            setButtonLoading(true); 
            await registerUser(userData);
            router.push('/confirmationCode');
        }catch(e){
            console.error(e);
        }finally{
            setButtonLoading(false); 
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>Welcome Back</h1>
                    <p className='text-gray-600'>Create your account to get started</p>
                </div>
                
                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Username
                        </label>
                        <input 
                            className='w-full px-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out' 
                            type='text'  
                            name='userName' 
                            value={userData.userName}
                            onChange={handleChange} 
                            placeholder='Enter your username'
                            required 
                        /> 
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Email Address
                        </label>
                        <input 
                            className='w-full px-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out' 
                            type='email' 
                            name='email' 
                            value={userData.email}
                            onChange={handleChange} 
                            placeholder='Enter your email'
                            required 
                        /> 
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Password
                        </label>
                        <input 
                            className='w-full px-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out' 
                            type='password' 
                            name='password' 
                            value={userData.password}
                            onChange={handleChange} 
                            placeholder='Create a strong password'
                            minLength={8} 
                            required 
                        /> 
                        <p className='text-xs text-gray-500 mt-1'>Must be at least 8 characters long</p>
                    </div>
                    
                    <button 
                        className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg' 
                        type='submit'
                        disabled={buttonLoading}
                    >
                        {buttonLoading ? "Loading..." : "Create New Account"}
                    </button>
                </form>
                
                <div className='mt-6 text-center'>
                    <p className='text-sm text-gray-600'>
                        Already have an account? 
                        <a href='/login' className='text-blue-600 hover:text-blue-800 font-medium ml-1'>
                            Sign in here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignIn;