import React from 'react'
import '../Css/body.css'
import ChatLogo from '../Images/online-world.svg'
import Home from './Home'
import { useWindowSize } from './UseWindowSize'
import Steps from './Steps'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'
import { Route, Switch, useHistory } from 'react-router-dom'
import ResetPassword from './ResetPassword'
import SingUp from './SingUp'
import SingIn from './SingIn'
const Body = (props) => {
  const history = useHistory()
  const width = useWindowSize()
  const [showMessage, changeShowMessage] = React.useState(false)
  const [ErrorMessages, ChangeErrorMessages] = React.useState({
    error: '',
    warning: '',
    success: '',
  })
  const handleClose = () => {
    ChangeErrorMessages({
      error: '',
      warning: '',
      success: '',
    })
  }
  React.useEffect(() => {
    let unmount = false
    if (!unmount) {
      if (ErrorMessages.error !== '' || ErrorMessages.warning !== '' || ErrorMessages.success !== '') changeShowMessage(true)
      else changeShowMessage(false)
    }
    return () => (unmount = true)
  }, [ErrorMessages.error, ErrorMessages.warning, ErrorMessages.success])

  function Error404() {
    React.useEffect(() => {
      history.push('/')
    }, [])
    return <div></div>
  }
  return (
    <div className="body">
      <Switch>
        <Route exact path="/">
          <div
            className="body-titre"
            style={{
              height: props.dataHome.StateHome === 1 || props.dataHome.StateHome === 4 ? '360px' : props.dataHome.StateHome === 5 ? '230px' : props.dataHome.StateHome === 2 ? '562px' : '487px',
              marginTop: width <= 885 ? (props.dataHome.StateHome === 1 ? '120px' : '45px') : '0px',
            }}
          >
            <Home dataHome={{ ...props.dataHome, ChangeErrorMessages }} />
          </div>
          <div className="body-img">
            <img src={ChatLogo} alt="..." />
          </div>
        </Route>
        <Route exact path="/">
          <div
            className="body-titre"
            style={{
              height: props.dataHome.StateHome === 1 || props.dataHome.StateHome === 4 ? '360px' : props.dataHome.StateHome === 5 ? '230px' : props.dataHome.StateHome === 2 ? '562px' : '487px',
              marginTop: width <= 885 ? (props.dataHome.StateHome === 1 ? '120px' : '45px') : '0px',
            }}
          >
            <Home dataHome={{ ...props.dataHome, ChangeErrorMessages }} />
          </div>
          <div className="body-img">
            <img src={ChatLogo} alt="..." />
          </div>
        </Route>
        <Route exact path="/Step">
          <Steps dataHome={{ ...props.dataHome, ChangeErrorMessages }} />
        </Route>
        <Route exact path="/ForgatPassword/:token">
          <ResetPassword dataHome={{ ...props.dataHome, ChangeErrorMessages }} />
        </Route>
        <Route exact path="/singUp">
          <div
            className="body-titre"
            style={{
              height: '562px',
              marginTop: width <= 885 ? (props.dataHome.StateHome === 1 ? '120px' : '45px') : '0px',
            }}
          >
            <SingUp dataHome={{ ...props.dataHome, ChangeErrorMessages }} />
          </div>
          <div className="body-img">
            <img src={ChatLogo} alt="..." />
          </div>
        </Route>
        <Route exact path="/singIn">
          <div
            className="body-titre"
            style={{
              height: '562px',
              marginTop: width <= 885 ? (props.dataHome.StateHome === 1 ? '120px' : '45px') : '0px',
            }}
          >
            <SingIn dataHome={{ ...props.dataHome, ChangeErrorMessages }} />
          </div>
          <div className="body-img">
            <img src={ChatLogo} alt="..." />
          </div>
        </Route>
        <Route path="*">
          <Error404 />
        </Route>
      </Switch>

      <Snackbar open={showMessage} autoHideDuration={4000} onClose={handleClose}>
        {ErrorMessages.error !== '' ? <Alert severity="error">{ErrorMessages.error}</Alert> : ErrorMessages.warning !== '' ? <Alert severity="warning">{ErrorMessages.warning}</Alert> : ErrorMessages.success !== '' ? <Alert severity="success">{ErrorMessages.success}</Alert> : <p></p>}
      </Snackbar>
    </div>
  )
}

export default Body
