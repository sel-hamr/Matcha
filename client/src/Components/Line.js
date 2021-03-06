import React from 'react'

const Line = (props) => {
  return (
    <div className="line">
      <hr />
      <p style={{ color: props.color === 'Dark' ? 'white' : 'black' }}>{props.str}</p>
      <hr />
    </div>
  )
}

export default Line
