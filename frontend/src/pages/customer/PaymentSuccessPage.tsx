import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, Home, User } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [upgradeResult, setUpgradeResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract payment parameters from URL
    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transId');
    const resultCode = searchParams.get('resultCode');

    if (resultCode === '0' && orderId && transactionId) {
      // Payment was successful, simulate upgrade result
      // Trong ứng dụng thực tế, bạn có thể gọi một API backend ở đây để lấy trạng thái cuối cùng
      const mockResult: any = {
        message: 'Your account has been successfully upgraded!',
        newSubscriptionLevel: 2, // Cấp độ Premium
        subscriptionExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 năm kể từ bây giờ
        transactionId: transactionId,
      };

      setUpgradeResult(mockResult);
      setLoading(false);

    } else {
      setError('Payment was not successful or missing required parameters.');
      setLoading(false);
    }
  }, [searchParams]);

  const getSubscriptionLevelName = (level: number) => {
    switch (level) {
      case 0:
        return 'Free Tier';
      case 2:
        return 'Premium Annual';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your upgrade...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              to="/upgrade"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors inline-block"
            >
              Try Again
            </Link>
            <Link
              to="/"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors inline-block"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          {upgradeResult?.message || 'Your account has been successfully upgraded.'}
        </p>

        {/* Upgrade Details */}
        {upgradeResult && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Crown className="w-5 h-5 text-yellow-500 mr-2" />
              Upgrade Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">New Plan:</span>
                <span className="font-medium text-gray-900">
                  {getSubscriptionLevelName(upgradeResult.newSubscriptionLevel)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valid Until:</span>
                <span className="font-medium text-gray-900">
                  {new Date(upgradeResult.subscriptionExpiryDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-gray-900 text-xs">
                  {upgradeResult.transactionId}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* New Features */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-gray-900 mb-3">What's New</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Unlimited daily interview sessions
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Access to premium question categories
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Advanced analytics and insights
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Priority customer support
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors inline-flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
          <Link
            to="/profile"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors inline-flex items-center justify-center"
          >
            <User className="w-4 h-4 mr-2" />
            View Profile
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 mt-6">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
