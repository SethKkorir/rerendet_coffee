// actions/paymentActions.js
import axios from 'axios';
import {
  INITIATE_MPESA_PAYMENT_REQUEST,
  INITIATE_MPESA_PAYMENT_SUCCESS,
  INITIATE_MPESA_PAYMENT_FAIL,
  CHECK_MPESA_PAYMENT_STATUS_REQUEST,
  CHECK_MPESA_PAYMENT_STATUS_SUCCESS,
  CHECK_MPESA_PAYMENT_STATUS_FAIL
} from '../constants/paymentConstants';

export const initiateMpesaPayment = (paymentData) => async (dispatch, getState) => {
  try {
    dispatch({ type: INITIATE_MPESA_PAYMENT_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.post('/api/payments/mpesa/stk-push', paymentData, config);

    dispatch({
      type: INITIATE_MPESA_PAYMENT_SUCCESS,
      payload: data
    });

    return data;
  } catch (error) {
    dispatch({
      type: INITIATE_MPESA_PAYMENT_FAIL,
      payload: error.response && error.response.data.message 
        ? error.response.data.message 
        : error.message
    });
    throw error;
  }
};

// Similarly for checkMpesaPaymentStatus and Airtel Money actions.