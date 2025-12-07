'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { faceService } from '../../services/face';
import FaceCapture from '../face/FaceCapture';
import { LoadingSpinner } from '../common/Loading';

const FaceRegistration = () => {
  const [hasRegisteredFace, setHasRegisteredFace] = useState(false);
  const [registeredAt, setRegisteredAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCapture, setShowCapture] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadFaceStatus();
  }, []);

  const loadFaceStatus = async () => {
    try {
      setIsLoading(true);
      const response = await faceService.getFaceStatus();
      if (response.success) {
        setHasRegisteredFace(response.data.hasRegisteredFace);
        setRegisteredAt(response.data.registeredAt);
      }
    } catch (error) {
      console.error('Error loading face status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    setShowCapture(true);
  };

  const handleCapture = async (imageData) => {
    try {
      setIsProcessing(true);
      const response = await faceService.registerFace(imageData);
      
      if (response.success) {
        toast.success('Face registered successfully!');
        setHasRegisteredFace(true);
        setRegisteredAt(new Date());
        setShowCapture(false);
      }
    } catch (error) {
      console.error('Face registration error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to register face';
      toast.error(errorMsg);
      setShowCapture(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your face registration? You will need to register again for face recognition check-in.')) {
      return;
    }

    try {
      setIsProcessing(true);
      const response = await faceService.deleteFaceRegistration();
      
      if (response.success) {
        toast.success('Face registration deleted');
        setHasRegisteredFace(false);
        setRegisteredAt(null);
      }
    } catch (error) {
      console.error('Delete face error:', error);
      toast.error('Failed to delete face registration');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelCapture = () => {
    setShowCapture(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (showCapture) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Register Your Face</h3>
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Processing face registration...</p>
          </div>
        ) : (
          <FaceCapture
            onCapture={handleCapture}
            onCancel={handleCancelCapture}
            mode="register"
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Face Recognition</h3>
          <p className="text-sm text-gray-500 mt-1">
            Register your face for quick and secure check-in/check-out
          </p>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          hasRegisteredFace 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {hasRegisteredFace ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Registered
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
              </svg>
              Not Registered
            </>
          )}
        </div>
      </div>

      {hasRegisteredFace ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Face recognition active</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your face has been registered for quick check-in and check-out.</p>
                  {registeredAt && (
                    <p className="mt-1 text-xs">
                      Registered on: {new Date(registeredAt).toLocaleDateString()} at {new Date(registeredAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleRegister}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-register Face
            </button>
            <button
              onClick={handleDelete}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Registration
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Face not registered</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Register your face to enable quick check-in and check-out without manual login.</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register Face Now
          </button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Benefits</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Quick check-in and check-out without password
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure biometric authentication
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Contactless attendance marking
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FaceRegistration;
