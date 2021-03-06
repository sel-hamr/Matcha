import React, { useContext } from 'react'
import { useWindowSize } from './UseWindowSize'
import { DataContext } from '../Context/AppContext'

const FinishSingUp = (props) => {
  const width = useWindowSize()
  const ctx = useContext(DataContext)
  return (
    <div>
      <p style={{ color: ctx.cache.Mode === 'Dark' ? 'white' : 'black' }} className="t1">
        thank your for sing up in Matcha
      </p>
      <p className="t2-min " style={{ color: ctx.cache.Mode === 'Dark' ? 'white' : 'black' }}>
        please verify your email address to continue sign up
      </p>
      <button
        onClick={() => {
          props.dataHome.ChangeHome(1)
        }}
        className="ft_btn"
        style={{
          paddingLeft: '25px',
          paddingRight: '25px',
          marginTop: width <= 885 ? '35px' : '20px',
          backgroundColor: '#03a9f1',
        }}
      >
        Back to home
      </button>
    </div>
  )
}

export default FinishSingUp
