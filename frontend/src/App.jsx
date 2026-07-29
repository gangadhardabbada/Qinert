import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import BB84Explorer from './pages/BB84Explorer';
import Documentation from './pages/Documentation';
import About from './pages/About';
import Authenticate from './pages/Authenticate';
import Research from './pages/Research';
import NotFound from './pages/NotFound';
import SecurityDemo from './pages/SecurityDemo';
import ExperimentalLab from './pages/ExperimentalLab';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bb84-explorer" element={<BB84Explorer />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/about" element={<About />} />
          <Route path="/authenticate" element={<Authenticate />} />
          <Route path="/research" element={<Research />} />
          <Route path="/security-demo" element={<SecurityDemo />} />
          <Route path="/experimental-lab" element={<ExperimentalLab />} />
          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
