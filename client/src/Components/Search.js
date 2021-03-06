import React from 'react'
import { IconSearch } from './Icons'
import '../Css/Search.css'

function Search(props) {
  function onChange(event) {
    props.changeSearch(event.target.value)
  }
  return (
    <div className="Search">
      <span>
        <IconSearch width={13} height={13} />
      </span>
      <input value={props.search} placeholder="Search..." onChange={onChange} />
    </div>
  )
}
export { Search }
