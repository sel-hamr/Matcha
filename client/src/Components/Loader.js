import React from 'react'
import '../Css/Loader.css'

function Loader(props) {
  return (
    <div className="Loader" style={props.style ? props.style : {}}>
      <div className="LoaderSpinner"></div>
    </div>
  )
}

export { Loader }
