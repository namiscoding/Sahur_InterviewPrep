import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';

const PaymentFailurePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    orderId?: string;
    resultCode?: string;
  }>({
    message: 'Payment was unsuccessful. Please try again.',
  });

  useEffect(() => {
    // Extract error parameters from URL
    const orderId = searchParams.get('orderId');
    const message = searchParams.get('message');
    const resultCode = searchParams.get('resultCode');
    const localMessage = searchParams.get('localMessage');

    // Determine error message based on result code or message
    let errorMessage = 'Payment was unsuccessful. Please try again.';
    
    if (message) {
      errorMessage = message;
    } else if (localMessage) {
      errorMessage = localMessage;
    } else if (resultCode) {
      switch (resultCode) {
        case '1006':
          errorMessage = 'Transaction was cancelled by user.';
          break;
        case '1001':
          errorMessage = 'Payment failed due to insufficient balance.';
          break;
        case '1002':
          errorMessage = 'Transaction limit exceeded.';
          break;
        case '1004':
          errorMessage = 'Payment amount is invalid.';
          break;
        case '1005':
          errorMessage = 'Payment URL has expired.';
          break;
        case '2001':
          errorMessage = 'Order not found or invalid.';
          break;
        case '2007':
          errorMessage = 'Payment request timeout.';
          break;
        default:
          errorMessage = `Payment failed with error code: ${resultCode}`;
      }
    }

    setErrorDetails({
      message: errorMessage,
      orderId: orderId || undefined,
      resultCode: resultCode || undefined,
    });
  }, [searchParams]);

  const getErrorIcon = () => {
    return <XCircle className="w-8 h-8 text-red-600" />;
  };

  const getErrorTitle = () => {
    if (errorDetails.resultCode === '1006') {
      return 'Payment Cancelled';
    }
    return 'Payment Failed';
  };

  const getHelpText = () => {
    if (errorDetails.resultCode === '1006') {
      return 'You cancelled the payment process. No charges were made to your account.';
    }
    return 'Your payment could not be processed. Please check your payment method and try again.';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {getErrorIcon()}
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{getErrorTitle()}</h1>
        
        {/* Error Message */}
        <p className="text-gray-600 mb-4">{errorDetails.message}</p>
        
        {/* Help Text */}
        <p className="text-sm text-gray-500 mb-6">{getHelpText()}</p>

        {/* Error Details (if available) */}
        {(errorDetails.orderId || errorDetails.resultCode) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <HelpCircle className="w-5 h-5 text-gray-500 mr-2" />
              Error Details
            </h3>
            <div className="space-y-2 text-sm">
              {errorDetails.orderId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium text-gray-900 text-xs">
                    {errorDetails.orderId}
                  </span>
                </div>
              )}
              {errorDetails.resultCode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Code:</span>
                  <span className="font-medium text-gray-900">
                    {errorDetails.resultCode}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Common Issues */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-gray-900 mb-3">Common Solutions</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Check your internet connection and try again
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Ensure your payment method has sufficient balance
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Try using a different payment method
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Contact your bank if the issue persists
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/upgrade"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors inline-flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Link>
          <Link
            to="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors inline-flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Support Contact */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Need help?</p>
          <a
            href="mailto:support@interviewprep.com"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;