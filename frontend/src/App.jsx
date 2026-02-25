import React from 'react';
import { Route } from 'react-router';
import { Routes } from 'react-router-dom';

import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/auth/ProfilePage';

import feedbackDetails from './pages/feedback/feedbackDetails';
import feedbackList from './pages/feedback/feedbackList';
import feedbackForm from './pages/feedback/feedbackForm';

import myReports from './pages/reports/myReports';
import reportDetails from './pages/reports/reportDetails';
import reportForm from './pages/reports/reportForm';

import myNotifications from './pages/notifications/myNotifications';

function App() {
  return (
    <div>
      

      <Routes>
        <Route path= "/" element = {<RegisterPage/>}/>
        <Route path= "/login" element = {<LoginPage/>}/> 
        <Route path= "/profile" element = {<ProfilePage/>}/> 



        <Route path= "/feedbackDetails" element = {<feedbackDetails/>}/>
        <Route path= "/feedbackList" element = {<feedbackList/>}/>
        <Route path= "/feedbackForm" element = {<feedbackForm/>}/>

        <Route path= "/myReports" element = {<myReports/>}/>
        <Route path= "/reportDetails" element = {<reportDetails/>}/>
        <Route path= "/reportForm" element = {<reportForm/>}/>

        <Route path= "/myNotifications" element = {<myNotifications/>}/>

      </Routes>
    </div>
  );
}

export default App;
