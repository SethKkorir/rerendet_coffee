import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
// import ContactsManagement from './components/Admin/ContactsManagement';
import Analytics from './components/Admin/Analytics';
import Settings from './components/Admin/Settings';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Checkout from './components/Checkout/Checkout';
import AccountDashboard from './components/Account/AccountDashboard';
import Orders from './pages/Orders';
import AOS from 'aos';
import 'aos/dist/aos.css';

import './App.css';
import Alert from './components/Alert/Alert';

function App() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-in-out' });

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

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppProvider>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Public Routes */}
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
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<AccountDashboard />} />
          <Route path="/orders" element={<Orders />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute>
              <AdminLayout>
                <OrdersManagement />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <AdminLayout>
                <ProductsManagement />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminLayout>
                <UsersManagement />
              </AdminLayout>
            </AdminRoute>
          } />
          {/* <Route path="/admin/contacts" element={
            <AdminRoute>
              <AdminLayout>
                <ContactsManagement />
              </AdminLayout>
            </AdminRoute>
          } /> */}
          <Route path="/admin/analytics" element={
            <AdminRoute>
              <AdminLayout>
                <Analytics />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute>
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </AdminRoute>
          } />

          {/* Redirect to home for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <CartSidebar />
        <Alert />
        <MpesaModal />
        <CardModal />
        <BackToTop />
      </div>
    </AppProvider>
  );
}

export default App;