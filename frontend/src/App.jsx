import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar      from './components/Navbar/Navbar'
import Footer      from './components/Footer/Footer'
import Home        from './pages/Home/Home'
import Generator   from './pages/Generator/Generator'
import Compare     from './pages/Compare/Compare'
import Metrics     from './pages/Metrics/Metrics'
import TextToImage from './pages/TextToImage/TextToImage'

export default function App() {
  return (
    <Router>
      <div className="flex-col" style={{ minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/"             element={<Home />}        />
            <Route path="/generator"    element={<Generator />}   />
            <Route path="/compare"      element={<Compare />}     />
            <Route path="/metrics"      element={<Metrics />}     />
            <Route path="/text-to-image" element={<TextToImage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}
