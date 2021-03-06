import React, { useContext } from 'react'
import { DataContext } from '../Context/AppContext'
import '../Css/iconsMenu.css'

const IconMenu = (props) => {
  const ctx = useContext(DataContext)
  return (
    <div
      className={`${props.dataHome.showMenu ? 'icon-menu-active' : 'icon-menu-show'}`}
      onClick={() => {
        props.dataHome.ChangeStateMenu((oldValue) => !oldValue)
      }}
    >
      <div
        style={{
          backgroundColor: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
        }}
      ></div>
      <div
        style={{
          backgroundColor: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
        }}
      ></div>
      <div
        style={{
          backgroundColor: ctx.cache.Mode === 'Dark' ? 'white' : 'black',
        }}
      ></div>
    </div>
  )
}

export default IconMenu
