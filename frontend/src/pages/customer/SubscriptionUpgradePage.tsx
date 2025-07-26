import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Star, Zap } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService'; // Import service

const SubscriptionUpgradePage: React.FC = () => {
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const plans = await subscriptionService.getSubscriptionPlans();
      setSubscriptionPlans(plans.filter((plan: any) => plan.isActive));

      const user = await subscriptionService.getCurrentUserProfile();
      setCurrentUser(user);

    } catch (err: any) {
      // Axios errors often have response.data.message for backend messages
      setError(err.response?.data?.message || err.message || 'Error loading data.');
      console.error('Error in SubscriptionUpgradePage fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: any) => {
    if (!currentUser) {
      setError('User information not loaded.');
      return;
    }

    setUpgrading(plan.id);
    setError(null);

    try {
      const result = await subscriptionService.initiateUpgradePayment({
        subscriptionPlanId: plan.id,
        amount: plan.price,
        // Nếu bạn vẫn đang gán cứng userId tạm thời ở frontend cho mục đích kiểm thử,
        // bạn có thể thêm nó vào đây, nhưng hãy nhớ rằng nó không an toàn cho production.
        // userId: currentUser.id, // Ví dụ: nếu bạn muốn gửi userId từ frontend
      });

      if (result.payUrl) {
        window.location.href = result.payUrl;
      } else {
        setError('Failed to create payment link: No payUrl received.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error initiating payment.');
      console.error('Error initiating payment:', err);
    } finally {
      setUpgrading(null);
    }
  };

  const getPlanIcon = (level: number) => {
    switch (level) {
      case 0:
        return <Star className="h-8 w-8 text-gray-500" />;
      case 2:
        return <Crown className="h-8 w-8 text-yellow-500" />;
      default:
        return <Zap className="h-8 w-8 text-blue-500" />;
    }
  };

  const getPlanColor = (level: number) => {
    switch (level) {
      case 0:
        return 'border-gray-300 bg-gray-50';
      case 2:
        return 'border-yellow-400 bg-yellow-50';
      default:
        return 'border-blue-400 bg-blue-50';
    }
  };

  const getPlanFeatures = (level: number) => {
    switch (level) {
      case 0:
        return [
          'Basic interview questions',
          'Limited daily usage',
          'Standard support',
        ];
      case 2:
        return [
          'All interview questions',
          'Unlimited daily usage',
          'Premium question categories',
          'Priority support',
          'Advanced analytics',
        ];
      default:
        return ['Standard features'];
    }
  };

  const isCurrentPlan = (level: number) => {
    return currentUser?.subscriptionLevel === level;
  };

  const canUpgrade = (level: number) => {
    return currentUser && currentUser.subscriptionLevel < level;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upgrade Your Account</h1>
              <p className="mt-2 text-gray-600">Choose a plan that fits your interview preparation needs</p>
            </div>
            <Link to="/" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {currentUser && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-blue-900">Current Subscription</h3>
            <p className="text-blue-700">
              You are currently on the{' '}
              <span className="font-semibold">
                {currentUser.subscriptionLevel === 0 ? 'Free Tier' : 'Premium'}
              </span>{' '}
              plan.
              {currentUser.subscriptionExpiryDate && (
                <span>
                  {' '}Expires on {new Date(currentUser.subscriptionExpiryDate).toLocaleDateString()}.
                </span>
              )}
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {subscriptionPlans.map((plan: any) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border-2 p-6 shadow-sm ${getPlanColor(plan.level)} ${
                isCurrentPlan(plan.level) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {isCurrentPlan(plan.level) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.level)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">
                    /{plan.durationMonths === 12 ? 'year' : `${plan.durationMonths} months`}
                  </span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {getPlanFeatures(plan.level).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {isCurrentPlan(plan.level) ? (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-md font-medium cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : canUpgrade(plan.level) ? (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={upgrading === plan.id}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
                  >
                    {upgrading === plan.id ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : (
                      'Upgrade Now'
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-md font-medium cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-700">Secure Payment</h4>
              <p className="text-gray-600 text-sm">
                All payments are processed securely through MoMo payment gateway.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Instant Activation</h4>
              <p className="text-gray-600 text-sm">
                Your upgraded features will be activated immediately after successful payment.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionUpgradePage;
