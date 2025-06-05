import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import Notification from './components/Notification/Notification';
import { MpesaModal, CardModal } from './components/Modals/PaymentModal';
import BackToTop from './components/BackToTop/BackToTop';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLogin from './components/Admin/AdminLogin';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Checkout from './components/Checkout/Checkout';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    // Check for admin session on initial load
    return localStorage.getItem('adminSession') === 'true';
  });

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

  const handleAdminLogin = () => {
    localStorage.setItem('adminSession', 'true');
    setIsAdmin(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminSession');
    setIsAdmin(false);
  };

  return (
    <AppProvider>
      <div className="App">
        <Navbar />
        <Routes>
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
          <Route 
            path="/admin" 
            element={
              isAdmin 
                ? <AdminDashboard onLogout={handleAdminLogout} /> 
                : <AdminLogin onLogin={handleAdminLogin} />
            } 
          />
        </Routes>

        <CartSidebar />
        <Notification />
        <MpesaModal />
        <CardModal />
        <BackToTop />
      </div>
    </AppProvider>
  );
}

export default App;