import React from 'react';
import { Route } from 'react-router';

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
        <Route path= "/repoertDetails" element = {<reportDetails/>}/>
        <Route path= "/reportForm" element = {<reportForm/>}/>

        <Route path= "/notifications" element = {<myNotifications/>}/>

      </Routes>
    </div>
  );
}

export default App;
