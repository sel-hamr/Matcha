import React from 'react'
import FinishSingUp from './FinishSingUp'
import ForgotPassword from './ForgotPassword'
import SingIn from './SingIn'
import SingUp from './SingUp'
import Titre from './Titre'

const Home = (props) => {
  if (props.dataHome.StateHome === 1) return <Titre dataHome={props.dataHome} />
  else if (props.dataHome.StateHome === 2) return <SingUp dataHome={props.dataHome} />
  else if (props.dataHome.StateHome === 3) return <SingIn dataHome={props.dataHome} />
  else if (props.dataHome.StateHome === 4) return <ForgotPassword dataHome={props.dataHome} />
  else if (props.dataHome.StateHome === 5) return <FinishSingUp dataHome={props.dataHome} />
}
export default Home
