import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState({
        countryCode: 'US',
        countryName: 'United States',
        currency: 'USD',
        currencySymbol: '$',
        exchangeRate: 0.0077 // 1 KES = 0.0077 USD
    });
    const [loading, setLoading] = useState(true);

    // Mapping of countries to currencies
    // Base currency is KES
    const countryCurrencyMap = {
        'KE': { currency: 'KES', symbol: 'KSh', rate: 1 },
        'TZ': { currency: 'TZS', symbol: 'TSh', rate: 19.5 }, // 1 KES = ~19.5 TZS
        'UG': { currency: 'UGX', symbol: 'USh', rate: 28 }, // 1 KES = ~28 UGX
        'RW': { currency: 'RWF', symbol: 'FRw', rate: 9.87 }, // 1 KES = ~9.87 RWF
        'CN': { currency: 'CNY', symbol: '¥', rate: 0.056 }, // 1 KES = ~0.056 CNY
        'GB': { currency: 'GBP', symbol: '£', rate: 0.006 }, // 1 KES = ~0.006 GBP
        'EU': { currency: 'EUR', symbol: '€', rate: 0.007 }, // 1 KES = ~0.007 EUR
        'US': { currency: 'USD', symbol: '$', rate: 0.0077 }, // 1 KES = ~0.0077 USD
        // Add more as needed
    };

    // List of Eurozone countries for better mapping
    const eurozone = ['AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES'];

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                // Using ipapi.co for free location data
                const response = await axios.get('https://ipapi.co/json/');
                const data = response.data;

                if (data && data.country_code) {
                    let currencyCode = 'USD';
                    let currencySymbol = '$';
                    let exchangeRate = 0.0077; // Default USD rate

                    if (countryCurrencyMap[data.country_code]) {
                        const mapData = countryCurrencyMap[data.country_code];
                        currencyCode = mapData.currency;
                        currencySymbol = mapData.symbol;
                        exchangeRate = mapData.rate;
                    } else if (eurozone.includes(data.country_code)) {
                        currencyCode = 'EUR';
                        currencySymbol = '€';
                        exchangeRate = 0.007;
                    }

                    setLocation({
                        countryCode: data.country_code,
                        countryName: data.country_name,
                        currency: currencyCode,
                        currencySymbol: currencySymbol,
                        exchangeRate: exchangeRate
                    });

                    console.log('📍 Location detected:', data.country_name, currencyCode);
                }
            } catch (error) {
                console.error('Error fetching location:', error);
                // Fallback to default (US/USD)
            } finally {
                setLoading(false);
            }
        };

        fetchLocation();
    }, []);

    // Helper to format price (assumes input is in KES)
    const formatPrice = (priceInKES) => {
        if (!priceInKES && priceInKES !== 0) return `${location.currencySymbol}0`;

        const converted = priceInKES * location.exchangeRate;

        // For integer-heavy currencies (KES, TZS, UGX, RWF, JPY etc)
        if (['KES', 'TZS', 'UGX', 'RWF', 'JPY'].includes(location.currency)) {
            return `${location.currencySymbol}${Math.ceil(converted).toLocaleString()}`;
        }

        return `${location.currencySymbol}${converted.toFixed(2)}`;
    };

    // Helper to get converted price value (number)
    const getConvertedPrice = (priceInKES) => {
        return priceInKES * location.exchangeRate;
    }

    return (
        <LocationContext.Provider value={{ location, setLocation, formatPrice, getConvertedPrice, loading }}>
            {children}
        </LocationContext.Provider>
    );
};
