import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSupabaseQuery } from './hooks/useSupabaseQuery';
import { db } from './db';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PlantDetail from './components/PlantDetail';
import MyPlants from './components/MyPlants';
import Schedule from './components/Schedule';
import PestDatabase from './components/PestDatabase';
import Settings from './components/Settings';
import Alerts from './components/Alerts';
import Inventory from './components/Inventory';
import Locations from './components/Locations';
import Login from './components/Login';
import About from './components/About';
import ErrorBoundary from './ErrorBoundary';

export const UserContext = createContext(null);

// A layout wrapper to provide Sidebar everywhere
function Layout({ children }) {
  const location = useLocation();
  const activePath = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className="flex h-screen w-full bg-forest-bg text-gray-100 font-sans overflow-hidden">
      <Sidebar activeTab={activePath} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Header />
        {children}
      </div>
    </div>
  );
}

function AppContent({ initialUser, handleLogout }) {
  const liveUser = useSupabaseQuery('users', { eq: { id: initialUser.id } }, [initialUser.id], true) || initialUser;
  
  // If user is guest, hijack the ID so all components fetch the target farm's data
  const contextUser = liveUser.role === 'guest' 
    ? { ...liveUser, id: liveUser.guestViewId || 1, originalId: liveUser.id } 
    : liveUser;

  return (
    <ErrorBoundary>
      <UserContext.Provider value={{ user: contextUser, actualUser: liveUser, logout: handleLogout }}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/plants" element={<MyPlants />} />
              <Route path="/plants/:id" element={<PlantDetail />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/calendar" element={<Schedule />} />
              <Route path="/pests" element={<PestDatabase />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-emerald-500 mb-2">Halaman Segera Hadir</h2>
                    <p className="text-gray-400">Fitur ini sedang dalam tahap pengembangan.</p>
                  </div>
                </div>
              } />
            </Routes>
          </Layout>
        </Router>
      </UserContext.Provider>
    </ErrorBoundary>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('florasync_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch(e) {
        localStorage.removeItem('florasync_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('florasync_user');
    setUser(null);
  };

  if (loading) return <div className="min-h-screen bg-forest-bg flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <AppContent initialUser={user} handleLogout={handleLogout} />;
}

export default App;
