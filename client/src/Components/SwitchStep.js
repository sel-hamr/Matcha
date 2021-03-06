import React, { useContext } from 'react'
import { DataContext } from '../Context/AppContext'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
const SwitchStep = (props) => {
  const ctx = useContext(DataContext)
  if (props.NrStep === 1) return <Step1 Mode={ctx.cache.Mode} InfoStep={props.InfoStep} ChangeInfoStep={props.ChangeInfoStep} />
  else if (props.NrStep === 2) return <Step2 Mode={ctx.cache.Mode} InfoStep={props.InfoStep} ChangeInfoStep={props.ChangeInfoStep} />
  else if (props.NrStep === 3) return <Step3 Mode={ctx.cache.Mode} InfoStep={props.InfoStep} ChangeInfoStep={props.ChangeInfoStep} />
  else if (props.NrStep === 4) return <Step4 Mode={ctx.cache.Mode} InfoStep={props.InfoStep} ChangeInfoStep={props.ChangeInfoStep} />
}

export default SwitchStep
