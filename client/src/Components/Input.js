import React from 'react'
import '../Css/ft-input.css'

export default function Input(props) {
  let blue = (e) => {
    e.target.className = 'Input'
    if (props.OnBlur) props.OnBlur(e.target.value.trim())
  }
  let focus = (e) => {
    e.target.className = 'Input input-active'
  }
  if (!props.Textarea)
    return (
      <input
        onBlur={blue}
        onFocus={focus}
        type={props.Type}
        className="Input"
        onChange={(e) => {
          props.Onchange(e.target.value)
        }}
        value={props.DefaultValue || ''}
        placeholder={props.PlaceHolder || ''}
        style={props.Style || {}}
        disabled={!props.Disabled}
        onKeyUp={(e) => {
          if (e.keyCode === 13 && props.OnEnter) props.OnEnter()
        }}
      />
    )
  else
    return (
      <textarea
        className="Input"
        rows="4"
        onBlur={blue}
        onFocus={focus}
        disabled={!props.Disabled}
        type={props.Type}
        style={{ height: '100px', resize: 'none', overflowY: 'auto', lineHeight: '22px', paddingTop: '8px', paddingRight: '12px', paddingBottom: '8px', ...props.Style }}
        placeholder={props.PlaceHolder || ''}
        value={props.DefaultValue || ''}
        onChange={(e) => {
          props.Onchange(e.target.value)
        }}
      ></textarea>
    )
}
