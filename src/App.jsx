import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from "./Pages/Dashboard"
import Signup from './Pages/Signup'
import Login from './Pages/Login'
import PrivateRoute from './components/PrivateRoute'
import MainLayout from './layout/MainLayout'
import ManageHabits from './Pages/ManageHabits'
import TodayJournal from './Pages/Dashboard'
import CheckProgress from './Pages/CheckProgress'
import Challenges from './Pages/Challenges'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path='/manage-habits' element={<ManageHabits/>}/>
          <Route path='/check-progress' element={<CheckProgress/>}/>
          <Route path='/challenges' element={<Challenges/>}/>
        </Route>

      </Routes>
    </div>
  )
}

export default App