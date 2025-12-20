// components/PaymentProcessingModal/PaymentProcessingModal.jsx
import React, { useEffect, useState } from 'react';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaPhone, FaCreditCard } from 'react-icons/fa';
import './PaymentProcessingModal.css';

const PaymentProcessingModal = ({
    isOpen,
    paymentMethod,
    amount,
    phone,
    onSuccess,
    onFailure,
    onCancel
}) => {
    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [message, setMessage] = useState('');
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setStatus('processing');
            setMessage('');
            setTransactionId('');
            return;
        }

        if (paymentMethod === 'mpesa') {
            simulateMpesaPayment();
        } else if (paymentMethod === 'card') {
            simulateCardPayment();
        }
    }, [isOpen, paymentMethod]);

    const simulateMpesaPayment = async () => {
        setStatus('processing');
        setMessage(`Sending STK push to ${phone}...`);

        // Simulate STK push delay (3 seconds)
        await new Promise(resolve => setTimeout(resolve, 1500));

        setMessage('Waiting for M-Pesa confirmation...');

        await new Promise(resolve => setTimeout(resolve, 1500));

        // 90% success rate for realism
        const success = Math.random() > 0.1;

        if (success) {
            const txId = `MPE${Date.now()}${Math.floor(Math.random() * 1000)}`;
            setTransactionId(txId);
            setStatus('success');
            setMessage('Payment confirmed successfully!');

            // Call success callback after showing success message
            setTimeout(() => {
                onSuccess({ transactionId: txId, method: 'mpesa' });
            }, 1500);
        } else {
            setStatus('failed');
            setMessage('Payment cancelled or timed out');
            setTimeout(() => {
                onFailure('Payment was cancelled by user');
            }, 2000);
        }
    };

    const simulateCardPayment = async () => {
        setStatus('processing');
        setMessage('Processing card payment...');

        await new Promise(resolve => setTimeout(resolve, 2000));

        setMessage('Verifying card details...');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 95% success rate for cards
        const success = Math.random() > 0.05;

        if (success) {
            const txId = `CRD${Date.now()}${Math.floor(Math.random() * 1000)}`;
            setTransactionId(txId);
            setStatus('success');
            setMessage('Payment successful!');

            setTimeout(() => {
                onSuccess({ transactionId: txId, method: 'card' });
            }, 1500);
        } else {
            setStatus('failed');
            setMessage('Card declined. Please try another card.');
            setTimeout(() => {
                onFailure('Card payment failed');
            }, 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal">
                <div className="payment-modal-content">
                    {/* Icon */}
                    <div className={`payment-icon-container ${status}`}>
                        {status === 'processing' && (
                            <FaSpinner className="spinner" />
                        )}
                        {status === 'success' && (
                            <FaCheckCircle className="success-icon" />
                        )}
                        {status === 'failed' && (
                            <FaTimesCircle className="error-icon" />
                        )}
                    </div>

                    {/* Payment Method Badge */}
                    <div className="payment-method-badge">
                        {paymentMethod === 'mpesa' ? (
                            <>
                                <FaPhone /> M-Pesa Payment
                            </>
                        ) : (
                            <>
                                <FaCreditCard /> Card Payment
                            </>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="payment-amount">
                        KSh {amount.toLocaleString()}
                    </div>

                    {/* Message */}
                    <div className={`payment-message ${status}`}>
                        {message}
                    </div>

                    {/* Transaction ID (only on success) */}
                    {transactionId && (
                        <div className="transaction-id">
                            <span className="label">Transaction ID:</span>
                            <span className="value">{transactionId}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="payment-actions">
                        {status === 'processing' && paymentMethod === 'mpesa' && (
                            <button
                                className="btn-cancel"
                                onClick={onCancel}
                            >
                                Cancel Payment
                            </button>
                        )}
                        {status === 'failed' && (
                            <button
                                className="btn-retry"
                                onClick={onCancel}
                            >
                                Try Again
                            </button>
                        )}
                    </div>

                    {/* Instructions (M-Pesa only) */}
                    {status === 'processing' && paymentMethod === 'mpesa' && (
                        <div className="payment-instructions">
                            <p>📱 Check your phone for the M-Pesa prompt</p>
                            <p>🔢 Enter your M-Pesa PIN to complete payment</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentProcessingModal;
