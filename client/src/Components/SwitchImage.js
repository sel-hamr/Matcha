import React from 'react'
import Step1 from '../Images/Step1.svg'
import Step2 from '../Images/Step2.svg'
import Step3 from '../Images/Step3.svg'
import Step4 from '../Images/Step4.svg'

const SwitchImage = (props) => {
  let GetImage = () => {
    if (props.NrStep === 1) return Step1
    else if (props.NrStep === 2) return Step2
    else if (props.NrStep === 3) return Step3
    else if (props.NrStep === 4) return Step4
  }
  return <img src={GetImage()} alt="..." className="image-step" />
}

export default SwitchImage
