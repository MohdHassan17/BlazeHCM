import { Route, Routes } from 'react-router-dom'
import './index.css'

//Pages Import
import Dashboard from './pages/Dashboard'


function App() {


  return (
    <>
 <Routes>
    <Route path='/home' element={<Dashboard/>}/>
  </Routes>       
        
        </>
  )
}

export default App
