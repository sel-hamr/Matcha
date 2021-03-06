import React, { useContext } from 'react'
import { DataContext } from '../Context/AppContext'
import '../Css/titre.css'

const Titre = (props) => {
  const ctx = useContext(DataContext)
  return (
    <div className="titre">
      <p style={{ color: ctx.cache.Mode === 'Dark' ? 'white' : 'black' }}>You just found a better way to connect with your friends</p>
      <button
        className="ft_btn"
        onClick={() => {
          props.dataHome.ChangeHome(2)
        }}
      >
        Join now
      </button>
    </div>
  )
}

export default Titre
