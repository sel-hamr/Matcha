import React, { useState, useEffect } from 'react'
import '../Css/Select.css'
import Chip from '@material-ui/core/Chip'
import TextField from '@material-ui/core/TextField'
function Select(props) {
  function init(propsList, listActive) {
    const newArray = []
    if (propsList && propsList.length > 0 && listActive && listActive.length >= 0) {
      propsList.map((item, index) =>
        newArray.push({
          id: index,
          value: item,
          selected: listActive && listActive.indexOf(item) > -1 ? true : false,
        })
      )
      listActive.map((item) => (propsList.indexOf(item) === -1 ? newArray.push({ id: newArray.length, value: item, selected: true }) : null))
    }
    return newArray
  }
  const [list, changeList] = useState(init(props.list, props.active))
  const [search, changeSearch] = useState('') // eslint-disable-next-line
  useEffect(() => changeList(init(props.list, props.active)), [props.active, props.list])
  function getListActive(list) {
    const newArray = []
    list.map((item) => {
      if (item.selected) newArray.push(item.value)
      return null
    })
    return newArray
  }
  function changeItem(index, active) {
    const newArray = [...list]
    if (newArray[index]) newArray[index].selected = active && getListActive(list).length < props.max ? true : false
    changeList(newArray)
    if (props.change) props.change(getListActive(newArray))
  }
  function keyUp(event) {
    if (event.keyCode === 13 && event.target.value.trim() && getListActive(list).length < props.max) {
      const newIndex = list.length
      const newArray = [...list, { id: newIndex, value: event.target.value, selected: true }]
      event.target.value = ''
      changeSearch('')
      changeList(newArray)
      if (props.change) props.change(getListActive(newArray))
    }
  }
  return (
    <div className="Select">
      <div className="SelectInput">
        <TextField id="list" label="List Interset" variant="outlined" size="small" onChange={(event) => changeSearch(event.target.value)} onKeyUp={keyUp} />
      </div>
      <div className="SelectItems">{list.map((item, index) => (item.selected ? <Chip label={item.value} key={item.id} color="primary" onDelete={() => changeItem(index, 0)} /> : null))}</div>
      <div className="SelectList">
        {list.map((item, index) =>
          !item.selected && item.value.toLowerCase().indexOf(search.toLowerCase()) > -1 ? (
            <div key={item.id} className="SelectListItem" onClick={() => changeItem(index, 1)}>
              {item.value}
            </div>
          ) : null
        )}
      </div>
    </div>
  )
}
export { Select }
