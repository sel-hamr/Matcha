import React, { useContext, useState, useEffect } from 'react'
import '../Css/App.css'
import AppContext, { DataContext } from '../Context/AppContext'
import Header from './Header'
import Body from './Body'
import '../Css/Btn.css'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Dashboard } from './Dashboard'
import { ModeStyle } from '../Data/ModeStyle'

function App() {
  const ctx = useContext(DataContext)
  const [Mode, changeMode] = useState('Light')
  const [StateHome, ChangeHome] = useState(1) // eslint-disable-next-line
  useEffect(() => {
    ctx.ref.changeMode = changeMode
    return () => (ctx.ref.changeMode = null)
  })
  if (ctx.isLogin === 'Step' || ctx.isLogin === 'Not login') {
    return (
      <div className="App" style={ModeStyle[Mode].Dashboard}>
        <Header dataHome={{ StateHome, ChangeHome }} />
        <Body dataHome={{ StateHome, ChangeHome, ChangeIsLogin: ctx.changeIsLogin }} />
      </div>
    )
  }
  if (ctx.isLogin === 'Login') return <Dashboard ChangeIsLogin={ctx.changeIsLogin} />
  else return ''
}

function AppContainer() {
  return (
    <Router>
      <AppContext>
        <Switch>
          <Route>
            <App />
          </Route>
        </Switch>
      </AppContext>
    </Router>
  )
}

export default AppContainer
