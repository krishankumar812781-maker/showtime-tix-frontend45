import Navbar from './Components/Navbar.jsx'
import Home from './Pages/Home.jsx'
import Footer from './Components/Footer.jsx'
import { Route, Routes } from 'react-router-dom'
import MovieDetails from './Pages/MovieDetails.jsx'
import SeatLayout from './Pages/SeatSelection.jsx' // This is your SeatSelection component
import AdminDashboard from './Components/AdminDashboard.jsx'
import AuthModal from './Pages/AuthModal.jsx'
import GoogleCallback from './Components/GoogleCallback';
import ProtectedRoute from './Components/ProtectedRoute'; 
import { AuthProvider } from './context/AuthContext.jsx'
import MovieSchedule from './Components/MovieSchedule.jsx'
import Payment from './Components/Payment.jsx'
import PaymentSuccess from './Components/PaymentSuccess.jsx'
import MyBookings from './Pages/MyBookings.jsx'


const App = () => {

  return (
    <div>
      <AuthProvider>
        <Navbar/>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/book/:movieId" element={<MovieSchedule/>} />
        {/* ⚡ UPDATED: Added :showId parameter to match your SeatSelection logic */}
        <Route path="/select-seats/:showId" element={
          <ProtectedRoute>
            <SeatLayout />
          </ProtectedRoute>
          } />
        <Route path="/mybookings" element={<ProtectedRoute><MyBookings/></ProtectedRoute>} />
        
        {/* ⚡ NEW: Payment Routes */}
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route path="/oauth2/callback" element={<GoogleCallback />} />
        <Route path="/login" element={<AuthModal onClose={() => window.history.back()} />} />

        {/* ⚡ SECURE ADMIN ROUTE */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
      </AuthProvider>
      
      <Footer />
    </div>
  )
}

export default App