import React from 'react'
import Input from './Input'
import data from '../Data/interests.json'
import { Select } from './Select'
const Step2 = (props) => {
  return (
    <>
      <Input
        DefaultValue={props.InfoStep.step4.DescribeYourself}
        Onchange={(describeYourself) => {
          props.ChangeInfoStep((oldValue) => ({ ...oldValue, step4: { ...oldValue.step4, DescribeYourself: describeYourself } }))
        }}
        OnBlur={(describeYourself) => {
          props.ChangeInfoStep((oldValue) => ({ ...oldValue, step4: { ...oldValue.step4, DescribeYourself: describeYourself } }))
        }}
        Type="text"
        PlaceHolder="Describe yourself ? ..."
        Disabled="false"
        Textarea={true}
        Style={{ width: '80%', marginLeft: 'auto', marginRight: 'auto' }}
      />
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Select
          list={data.data}
          active={props.InfoStep.step4.yourInterest}
          change={(arr) =>
            props.ChangeInfoStep((oldValue) => ({
              ...oldValue,
              step4: { ...oldValue.step4, yourInterest: arr },
            }))
          }
          max={5}
        />
      </div>
    </>
  )
}
export default Step2
