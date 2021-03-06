import React from 'react'
import data from '../Data/interests.json'
import { Select } from './Select'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Input from './Input'
import { DataContext } from '../Context/AppContext'
import { Validate } from './Validate'
import { getAge, isValidDate } from './ValidateDate'
import Axios from 'axios'
import Chip from '@material-ui/core/Chip'

export default function PersonalInfo(props) {
  const ctx = React.useContext(DataContext)
  const Sexual = [
    {
      value: 'Female',
      label: 'Female',
    },
    {
      value: 'Male',
      label: 'Male',
    },
    {
      value: 'Male Female',
      label: 'Male And Female',
    },
  ]
  const Gender = [
    {
      value: 'Female',
      label: 'Female',
    },
    {
      value: 'Male',
      label: 'Male',
    },
    {
      value: 'Other',
      label: 'Other',
    },
  ]
  const UpdateInfoUser = () => {
    try {
      Axios.post('/Profile/EditInfoUser', props.InfoUser).then((result) => {
        if (result.data !== 'NoUpdate') {
          ctx.cache.users = []
          props.changeShowSuccess(true)
          props.changeUserNameAndEmail((oldValue) => ({ ...oldValue, email: props.InfoUser.Email, userName: props.InfoUser.UserName }))
          props.changeUser((oldValue) => ({ ...oldValue, FirstName: props.InfoUser.FirstName, LastName: props.InfoUser.LastName, UserName: props.InfoUser.UserName }))
        }
      })
    } catch (error) {}
  }

  let validationEdit = () => {
    let inputsInfo = Array.from(document.querySelectorAll('.profile input'))
    let inputsError = []
    let Await = []
    inputsInfo.forEach(async (inputInfo, key) => {
      if (key === 1) {
        const checkUserName = await Axios.post(`/Profile/UserReadyTake`, { UserName: inputInfo.value })
        if (!Validate('Username', inputInfo.value) || checkUserName.data === false) {
          Await.push('ok')
          inputsError.push('User Name is already taken or something else')
        } else Await.push('ok')
      }
      if (key === 2) {
        const checkEmail = await Axios.post(`/Profile/EmailReadyTake`, { Email: inputInfo.value })
        if (!Validate('Email', inputInfo.value) || checkEmail.data === false) {
          Await.push('ok')
          inputsError.push('Email is already taken or something else')
        } else Await.push('ok')
      }
      if (key === 3) {
        if (!Validate('Name', inputInfo.value)) {
          inputsError.push('first Name is not Valid, must be greater than 5 characters')
        }
      }
      if (key === 4) {
        if (!Validate('Name', inputInfo.value)) {
          inputsError.push('lastName Name is not Valid, must be greater than 5 characters')
        }
      }
      if (key === 5) {
        if (!isValidDate(inputInfo.value) || getAge(inputInfo.value) < 18 || getAge(inputInfo.value) > 80) {
          inputsError.push('Error age must be greater than 18 And less than 80')
        }
      }
      if (key === 6) {
        if (inputInfo.value !== 'Male' && inputInfo.value !== 'Female' && inputInfo.value !== 'Male Female') {
          inputsError.push('Sexual is not valid')
        }
      }
      if (key === 7) {
        if (inputInfo.value !== 'Male' && inputInfo.value !== 'Female' && inputInfo.value !== 'Other') {
          inputsError.push('Gender is not valid')
        }
      }
      if (Await.length === 2) {
        if (props.InfoUser.ListInterest.length === 0 || props.InfoUser.ListInterest.length > 5 || !props.InfoUser.ListInterest.every((Interest) => Interest.length > 1 && Interest.length <= 25)) inputsError.push('ListInterest is not valid or greater than 5')
        if (props.InfoUser.Biography.trim().length === 0 || props.InfoUser.Biography.trim().length > 100) inputsError.push('Biography is not Valid, must not be empty or less than 100 letters')
        if (inputsError.every((items) => items === '')) {
          UpdateInfoUser()
        } else {
          props.ChangeError(inputsError)
          props.ChangeShowError(true)
        }
      }
    })
  }
  const ChangeSexual = (e) => {
    const val = e.target.value
    props.ChangeInfoUser((oldValue) => {
      return { ...oldValue, Sexual: val }
    })
  }
  const ChangeGender = (e) => {
    const val = e.target.value
    props.ChangeInfoUser((oldValue) => {
      return { ...oldValue, Gender: val }
    })
  }
  const ChangeDateBirthday = (e) => {
    const val = e.target.value
    if (getAge(val) >= 18)
      props.ChangeInfoUser((oldValue) => {
        return { ...oldValue, DataBirthday: val }
      })
  }
  return (
    <div className="slide-in-right">
      <p>Personal Information </p>
      <div></div>
      <div className="infoUser">
        <p className="labelInfo">UserName:</p>
        <Input
          DefaultValue={props.InfoUser.UserName}
          Onchange={(userName) => {
            props.ChangeInfoUser((oldValue) => ({ ...oldValue, UserName: userName }))
          }}
          Disabled={props.UserNameAndEmail.isProfileOfYou}
          Type="text"
        />
      </div>
      {props.UserNameAndEmail.isProfileOfYou ? (
        <div className="infoUser">
          <p className="labelInfo">Email:</p>
          <Input
            DefaultValue={props.InfoUser.Email}
            Onchange={(email) => {
              props.ChangeInfoUser((oldValue) => ({ ...oldValue, Email: email }))
            }}
            Disabled={props.UserNameAndEmail.isProfileOfYou}
            Type="email"
          />
        </div>
      ) : (
        ''
      )}

      <div className="infoUser">
        <p className="labelInfo">First Name:</p>
        <Input
          DefaultValue={props.InfoUser.FirstName}
          Onchange={(firstName) => {
            props.ChangeInfoUser((oldValue) => ({ ...oldValue, FirstName: firstName }))
          }}
          Disabled={props.UserNameAndEmail.isProfileOfYou}
          Type="text"
        />
      </div>
      <div className="infoUser">
        <p className="labelInfo">Last Name:</p>
        <Input
          DefaultValue={props.InfoUser.LastName}
          Onchange={(lastName) => {
            props.ChangeInfoUser((oldValue) => ({ ...oldValue, LastName: lastName }))
          }}
          Disabled={props.UserNameAndEmail.isProfileOfYou}
          Type="text"
        />
      </div>
      <div className="infoUser">
        <p className="labelInfo">DateBirthday</p>
        <input type="date" className="inputDateBirthday" style={{ color: ctx.cache.Mode === 'Dark' ? 'white' : 'black' }} value={props.InfoUser.DataBirthday} onChange={ChangeDateBirthday} disabled={!props.UserNameAndEmail.isProfileOfYou} />
      </div>
      <div className="infoUser">
        <p className="labelInfo">Biography :</p>
        <Input
          DefaultValue={props.InfoUser.Biography}
          Onchange={(biography) => {
            props.ChangeInfoUser((oldValue) => ({ ...oldValue, Biography: biography }))
          }}
          OnBlur={(biography) => {
            props.ChangeInfoUser((oldValue) => ({ ...oldValue, Biography: biography }))
          }}
          Type="text"
          Disabled={props.UserNameAndEmail.isProfileOfYou}
          Textarea={true}
        />
      </div>
      <div className="infoUser">
        <p className="labelInfo">gender you are looking for :</p>
        <TextField select variant="outlined" value={props.InfoUser.Sexual} onChange={ChangeSexual} style={{ width: '100%', backgroundColor: 'var(--background-Input)', borderRadius: '8px' }} disabled={!props.UserNameAndEmail.isProfileOfYou}>
          {Sexual.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <div className="infoUser">
        <p className="labelInfo">Gender</p>
        <TextField select variant="outlined" value={props.InfoUser.Gender} onChange={ChangeGender} style={{ width: '100%', backgroundColor: 'var(--background-Input)', borderRadius: '8px', fontWeight: '600', color: 'white' }} disabled={!props.UserNameAndEmail.isProfileOfYou}>
          {Gender.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <div className="infoUser" style={{ alignItems: 'baseline' }}>
        <p className="labelInfo">List interests</p>
        {props.UserNameAndEmail.isProfileOfYou === true ? (
          <Select
            list={data.data}
            active={props.InfoUser.ListInterest}
            change={(listInterest) => {
              props.ChangeInfoUser((oldValue) => ({ ...oldValue, ListInterest: listInterest }))
            }}
            max={5}
          />
        ) : (
          <div style={{ width: '100%' }}>
            {props.InfoUser.ListInterest.map((chip, key) => (
              <Chip key={key} label={chip} style={{ backgroundColor: 'var(--background-Nav)', color: 'white', marginLeft: '5px', marginBottom: '10px' }} />
            ))}
          </div>
        )}
      </div>
      {props.UserNameAndEmail.isProfileOfYou ? (
        <div className="infoUser" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <button className="ft_btn" style={{ marginTop: '20px', backgroundColor: 'var(--background-Nav)' }} onClick={validationEdit}>
            Edit profile
          </button>
        </div>
      ) : (
        ''
      )}
    </div>
  )
}
