import React, { useState, useContext } from 'react'
import { useWindowSize } from './UseWindowSize'
import { DataContext } from '../Context/AppContext'
import Axios from 'axios'
import Input from './Input'

const ForgotPassword = (props) => {
  const [Email, ChangeEmail] = useState('')
  const width = useWindowSize()
  const ctx = useContext(DataContext)
  return (
    <div className="abs">
      <p style={{ color: ctx.cache.Mode === 'Dark' ? 'white' : 'black' }} className="t3">
        Forgat Password
      </p>
      <p className="t2" style={{ color: ctx.cache.Mode === 'Dark' ? 'white' : 'black' }}>
        enter your email address to reset your password
      </p>
      <Input
        DefaultValue={Email}
        Onchange={(password) => {
          ChangeEmail(password)
        }}
        Disabled="false"
        Type="email"
      />
      <button
        onClick={() => {
          try {
            Axios.post('/Users/ForgatPassword', {
              Email: Email,
            })
              .then((result) => {
                if (result.data === 'Email not Active') {
                  props.dataHome.ChangeErrorMessages({
                    error: 'Oops! Email not Active',
                    warning: '',
                    success: '',
                  })
                } else if (result.data === 'Email not Found') {
                  props.dataHome.ChangeErrorMessages({
                    error: 'Oops! Email not found',
                    warning: '',
                    success: '',
                  })
                } else if (result.data === 'Bad Request') {
                  props.dataHome.ChangeErrorMessages({
                    error: 'Oops! something is wrong with your email',
                    warning: '',
                    success: '',
                  })
                } else {
                  props.dataHome.ChangeErrorMessages({
                    error: '',
                    warning: '',
                    success: 'Send email success please go to email to reset password',
                  })
                  props.dataHome.ChangeHome(1)
                }
              })
              .catch(() => {
                props.dataHome.ChangeErrorMessages({
                  error: '',
                  warning: 'Error: Network Error',
                  success: '',
                })
              })
          } catch (error) {}
        }}
        className="ft_btn"
        style={{
          paddingLeft: '25px',
          paddingRight: '25px',
          marginTop: width <= 885 ? '35px' : '20px',
          backgroundColor: '#03a9f1',
        }}
      >
        Send
      </button>
    </div>
  )
}

export default ForgotPassword
