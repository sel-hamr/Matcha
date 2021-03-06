import React, { useContext, useState, useEffect } from 'react'
import { useWindowSize } from './UseWindowSize'
import { DataContext } from '../Context/AppContext'
import Input from './Input'
import { useHistory, useParams } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import ImageForgetPassword from '../Images/forgot-password-animate.svg'
import CircularProgress from '@material-ui/core/CircularProgress'
import Axios from 'axios'
import { Validate } from './Validate'
const ResetPassword = (props) => {
  const width = useWindowSize()
  const ctx = useContext(DataContext)
  const [password, changePassword] = React.useState({
    NewPassword: '',
    ConfirmPassword: '',
  })
  const [PageLoader, changePageLoader] = useState('')
  let history = useHistory()
  let { token } = useParams()
  useEffect(() => {
    let unmount = false
    try {
      Axios.post(`/Users/verifierToken`, { Token: token })
        .then((result) => {
          if (!unmount) {
            if (result.data === false) {
              props.dataHome.ChangeErrorMessages({
                error: 'Token not found',
                warning: '',
                success: '',
              })
              history.push(`/`)
            } else changePageLoader(true)
          }
        })
        .catch((error) => {})
    } catch (error) {}
    return () => (unmount = true) //eslint-disable-next-line
  }, [])
  let UpdatePassword = () => {
    if (password.ConfirmPassword !== password.NewPassword) {
      props.dataHome.ChangeErrorMessages({
        error: 'password not match',
        warning: '',
        success: '',
      })
    } else if (Validate('Password', password.ConfirmPassword))
      try {
        Axios.post('/Users/ResetPassword', {
          Password: password.NewPassword,
          Confirm: password.ConfirmPassword,
          Token: token,
        })
          .then(() => {
            props.dataHome.ChangeErrorMessages({
              error: '',
              warning: '',
              success: 'Your password has been reset successfully!',
            })
            history.push(`/`)
          })
          .catch((error) => {})
      } catch (error) {}
    else
      props.dataHome.ChangeErrorMessages({
        error: 'password not valid',
        warning: '',
        success: '',
      })
  }
  if (PageLoader)
    return (
      <div className="Step">
        <div
          style={{
            width: '580px',
            height: '550px',
            transform: 'translateY(-30px)',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <p
            className="t3"
            style={{
              marginBottom: '37px',
              marginTop: '0px',
              color: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
              fontSize: width <= 885 ? '18px' : '28px',
            }}
          >
            Reset Password
          </p>
          <div className="form-group" style={{ width: '100%' }}>
            <p
              style={{
                color: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
              }}
            >
              New password
            </p>
            <Input
              DefaultValue={password.NewPassword}
              Onchange={(newPassword) => {
                changePassword((oldValue) => ({ ...oldValue, NewPassword: newPassword }))
              }}
              Disabled="false"
              Type="password"
              PlaceHolder="New Password"
              Style={{ marginBottom: '10px' }}
            />
          </div>
          <div className="form-group" style={{ width: '100%' }}>
            <p
              style={{
                color: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
              }}
            >
              Confirm password
            </p>
            <Input
              DefaultValue={password.ConfirmPassword}
              Onchange={(confirmPassword) => {
                changePassword((oldValue) => ({ ...oldValue, ConfirmPassword: confirmPassword }))
              }}
              Disabled="false"
              Type="password"
              PlaceHolder="Confirm password"
              Style={{ marginBottom: '10px' }}
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={UpdatePassword}
            style={{
              fontWeight: '900',
              borderRadius: '8px',
              backgroundColor: '#03a9f1',
              marginTop: '20px',
            }}
          >
            Create New Password
          </Button>
        </div>
        <div className="Image-step">
          <img src={ImageForgetPassword} alt="..." style={{ width: '550px', height: '100%' }} />
        </div>
      </div>
    )
  else return <CircularProgress />
}

export default ResetPassword
