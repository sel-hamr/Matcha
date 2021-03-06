import React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Input from './Input'
import Axios from 'axios'
import { ModeStyle } from '../Data/ModeStyle'
import { DataContext } from '../Context/AppContext'
import { Validate } from './Validate'

export default function UpdatePassword(props) {
  const ctx = React.useContext(DataContext)
  let changePasswordProfile = () => {
    if (Validate('Password', password.NewPassword) && Validate('Password', password.CurrentPassword) && password.ConfirmPassword === password.NewPassword) {
      try {
        Axios.post('/Profile/ChangePasswordProfile', password).then((result) => {
          if (result.data === 'succuss Update Password') {
            changePassword({
              CurrentPassword: '',
              NewPassword: '',
              ConfirmPassword: '',
            })
            props.changeShowSuccess(true)
            props.formUpdatePasswordClose()
          } else {
            props.ChangeError(['Password not valid'])
            props.ChangeShowError(true)
          }
        })
      } catch (error) {}
    } else {
      props.ChangeError(['Password not valid'])
      props.ChangeShowError(true)
    }
  }
  const [password, changePassword] = React.useState({
    CurrentPassword: '',
    NewPassword: '',
    ConfirmPassword: '',
  })
  return (
    <Dialog
      open={props.showUpdatePassword}
      onClose={() => {
        changePassword({
          CurrentPassword: '',
          NewPassword: '',
          ConfirmPassword: '',
        })
        props.formUpdatePasswordClose()
      }}
      style={ModeStyle[ctx.cache.Mode].Dashboard}
    >
      <DialogTitle id="form-dialog-title">Change password</DialogTitle>
      <DialogContent>
        <DialogContentText>create a password at least 8 characters with uppercase letters and numbers and numbers.</DialogContentText>
        <Input
          DefaultValue={password.CurrentPassword}
          Onchange={(currentPassword) => {
            changePassword((oldValue) => ({ ...oldValue, CurrentPassword: currentPassword }))
          }}
          Type="password"
          PlaceHolder="Current Password"
          Style={{ marginBottom: '10px' }}
          Disabled="false"
        />
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
      </DialogContent>
      <DialogActions>
        <button className="ft_btn" style={{ backgroundColor: 'rgb(49, 143, 181)', marginBottom: '10px', marginRight: '15px' }} onClick={changePasswordProfile}>
          change Password
        </button>
      </DialogActions>
    </Dialog>
  )
}
