import React from 'react'
import '../Css/Toggle.css'
function Toggle(props) {
  const style = {
    transition: 'all 0.5s',
    transform: props.list.indexOf(props.active) ? 'translateX(29px)' : 'translateX(5px)',
  }
  return (
    <div className="Toggle" style={props.style ? props.style : {}} onClick={() => props.switch()}>
      <div
        className="ToggleSwitcher"
        style={{
          backgroundColor: props.colors[props.list.indexOf(props.active)],
          ...style,
        }}
      ></div>
    </div>
  )
}
export { Toggle }
