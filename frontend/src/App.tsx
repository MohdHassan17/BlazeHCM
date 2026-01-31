import { Route, Routes } from 'react-router-dom'
import './index.css'

//Pages Import
import Dashboard from './pages/Dashboard'
import  Login from './pages/auth/Login'


function App() {


  return (
    <>
 <Routes>
    <Route path='/home' element={<Dashboard/>}/>
    <Route path='/login' element={<Login/>}/>
  </Routes>       
        
        </>
  )
}

export default App
