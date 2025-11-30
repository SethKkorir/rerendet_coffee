// App.js
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Features from './components/Features/Features';
import About from './components/About/About';
import CoffeeShop from './components/CoffeeShop/CoffeeShop';
import Testimonials from './components/Testimonials/Testimonials';
import Contact from './components/Contact/Contact';
import Newsletter from './components/Newsletter/Newsletter';
import Footer from './components/Footer/Footer';
import CartSidebar from './components/Cart/CartSidebar';
import { MpesaModal, CardModal } from './components/Modals/PaymentModal';
import BackToTop from './components/BackToTop/BackToTop';
import AdminLayout from './components/Admin/AdminLayout';
import AdminRoute from './components/Admin/AdminRoute';
import Dashboard from './components/Admin/Dashboard';
import OrdersManagement from './components/Admin/OrdersManagement';
import ProductsManagement from './components/Admin/ProductsManagement';
import UsersManagement from './components/Admin/UsersManagement';
import Analytics from './components/Admin/Analytics';
import Settings from './components/Admin/Settings';
import AdminLogin from './components/Admin/AdminLogin';
import Checkout from './components/Checkout/Checkout';
import AccountDashboard from './components/Account/AccountDashboard';
import Orders from './pages/Orders';
import OrderReceipt from './components/Checkout/OrderReceipt';
import AdminOrders from './components/Admin/Orders';
import Profile from './components/Profile/Profile';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Initialize AOS animations
    AOS.init({ 
      duration: 800, 
      once: true, 
      easing: 'ease-in-out',
      offset: 100 
    });

    // Custom scroll animations
    const handleScroll = () => {
      const fadeElements = document.querySelectorAll('.fade-in');
      fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementTop < windowHeight * 0.8) {
          element.classList.add('active');
        }
      });
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      AOS.refresh();
    };
  }, []);

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AppProvider>
      <div className="App">
        {/* Don't show navbar on admin routes */}
        {!isAdminRoute && <Navbar />}
        
        {/* Main Routes */}
        <Routes>
          {/* Home Page with all sections */}
          <Route
            path="/"
            element={
              <>
                <main>
                  <Hero />
                  <Features />
                  <About />
                  <CoffeeShop />
                  <Testimonials />
                  <Contact />
                  <Newsletter />
                </main>
                <Footer />
              </>
            }
          />
          
          {/* Redirect old auth routes to home */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          
          {/* Checkout & Orders */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/:id" element={<OrderReceipt />} />
          <Route path="/orders" element={<Orders />} />
          
          {/* User Account Routes */}
          <Route path="/account" element={<AccountDashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/orders" element={<OrdersManagement />} />
                    <Route path="/orders-view" element={<AdminOrders />} />
                    <Route path="/products" element={<ProductsManagement />} />
                    <Route path="/users" element={<UsersManagement />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Components - Don't show on admin routes */}
        {!isAdminRoute && (
          <>
            <CartSidebar />
            <MpesaModal />
            <CardModal />
            <BackToTop />
          </>
        )}
      </div>
    </AppProvider>
  );
}

export default App;