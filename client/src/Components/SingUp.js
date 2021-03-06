import React, { useContext, useState } from 'react'
import '../Css/sing_up.css'
import Input from './Input'
import { DataContext } from '../Context/AppContext'
import { useWindowSize } from './UseWindowSize'
import Axios from 'axios'
import { Validate } from './Validate'
import Divider from '@material-ui/core/Divider'

const SingUp = (props) => {
  const width = useWindowSize()
  const ctx = useContext(DataContext)
  const [DataInput, saveDataInput] = useState({ Email: '', Password: '', FirstName: '', LastName: '', UserName: '' })

  let insertUser = () => {
    try {
      Axios.post('/Authentication/Insert', {
        UserName: DataInput.UserName,
        LastName: DataInput.LastName,
        FirstName: DataInput.FirstName,
        Password: DataInput.Password,
        Email: DataInput.Email,
      })
        .then((result) => {
          if (result.data === 'successful') props.dataHome.ChangeHome(5)
        })
        .catch((error) => {})
    } catch (error) {}
  }
  return (
    <div className="sing">
      <p className="t1" style={{ color: ctx.cache.Mode === 'Dark' ? 'white' : 'black' }}>
        Sign up to Matcha
      </p>
      <Divider />
      <div className="form-sing">
        <div className="inline-group">
          <div className="form-group">
            <p className="t1" style={{ color: ctx.cache.Mode === 'Dark' ? 'white' : 'black' }}>
              First Name
            </p>
            <Input
              DefaultValue={DataInput.FirstName}
              Onchange={(firstName) => {
                saveDataInput((oldValue) => ({ ...oldValue, FirstName: firstName }))
              }}
              Disabled="false"
              Type="text"
            />
          </div>
          <div className="form-group">
            <p
              style={{
                color: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
              }}
            >
              Last Name
            </p>
            <Input
              DefaultValue={DataInput.LastName}
              Onchange={(lastName) => {
                saveDataInput((oldValue) => ({ ...oldValue, LastName: lastName }))
              }}
              Disabled="false"
              Type="text"
            />
          </div>
        </div>
        <div className="inline-group">
          <div className="form-group">
            <p
              style={{
                color: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
              }}
            >
              Use Name
            </p>
            <Input
              DefaultValue={DataInput.UserName}
              Onchange={(useName) => {
                saveDataInput((oldValue) => ({ ...oldValue, UserName: useName }))
              }}
              Disabled="false"
              Type="text"
            />
          </div>
          <div className="form-group">
            <p
              style={{
                color: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
              }}
            >
              Password
            </p>
            <Input
              DefaultValue={DataInput.Password}
              Onchange={(password) => {
                saveDataInput((oldValue) => ({ ...oldValue, Password: password }))
              }}
              Disabled="false"
              Type="password"
            />
          </div>
        </div>
        <div className="form-group" style={{ width: '100%' }}>
          <p
            style={{
              color: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
            }}
          >
            Email
          </p>
          <Input
            DefaultValue={DataInput.Email}
            Onchange={(email) => {
              saveDataInput((oldValue) => ({ ...oldValue, Email: email }))
            }}
            Disabled="false"
            Type="Email"
          />
        </div>
        <button
          onClick={async () => {
            let errorInput = []
            if (Validate('Email', DataInput.Email)) {
              let emailIsReadyTake = await Axios.get(`Users/EmailIsReadyTake/${DataInput.Email}`)
              if (!emailIsReadyTake.data) errorInput.push('Email is Ready take')
            } else errorInput.push('Email is not valid or empty')
            if (Validate('Username', DataInput.UserName)) {
              let userNameIsReadyTake = await Axios.get(`Users/UserNameIsReadyTake/${DataInput.UserName}`)
              if (!userNameIsReadyTake.data) errorInput.push('UserName is Ready take')
            } else errorInput.push('Username is not valid or empty')
            if (!Validate('Password', DataInput.Password)) errorInput.push('Password is not valid')
            if (!Validate('Name', DataInput.FirstName)) errorInput.push('FirstName is not valid')
            if (!Validate('Name', DataInput.LastName)) errorInput.push('LastName is not valid')
            if (errorInput.length === 0) insertUser()
            else {
              props.dataHome.ChangeErrorMessages({
                warning: '',
                error: await errorInput.map((element) => `- ${element}\n`),
                success: '',
              })
            }
          }}
          className="ft_btn"
          style={{
            paddingLeft: '25px',
            paddingRight: '25px',
            marginTop: width <= 885 ? '35px' : '20px',
            backgroundColor: '#03a9f1',
          }}
        >
          Create Account
        </button>
      </div>
    </div>
  )
}

export default SingUp
