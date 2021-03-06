import React from 'react'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import CheckIcon from '@material-ui/icons/Check'
import Axios from 'axios'
import Button from '@material-ui/core/Button'
import DeleteIcon from '@material-ui/icons/Delete'

export default function ImageUser(props) {
  let makeImageDefault = (e) => {
    let arrayPicture = Array.from(document.querySelectorAll('.Image'))
    let index = arrayPicture.indexOf(e.target.closest('.Image')) + 1
    try {
      Axios.post('/Profile/MakeImageDefault', { index: index }).then(() => {
        const arrayImage = props.InfoUser.Images
        ;[arrayImage[0], arrayImage[index]] = [arrayImage[index], arrayImage[0]]
        props.changeUser((oldValue) => ({ ...oldValue, Image: arrayImage[0] }))
        props.ChangeInfoUser({ ...props.InfoUser, Images: [...arrayImage] })
      })
    } catch (error) {}
  }
  let deleteImage = (e) => {
    let arrayPicture = Array.from(document.querySelectorAll('.Image'))
    try {
      Axios.post('/Profile/DeleteImage', { index: arrayPicture.indexOf(e.target.closest('.Image')) + 1 }).then((result) => {
        let arrayImage = props.InfoUser.Images
        arrayImage.splice(result.data.index, 1)
        props.ChangeInfoUser({ ...props.InfoUser, Images: [...arrayImage] })
      })
    } catch (error) {}
  }
  const fullscreenImage = (e) => {
    props.ChangeImage({
      state: true,
      src: e.target.closest('.Image').children[0].src,
    })
  }
  return (
    <div className="Image">
      <img src={props.image} alt="..." />
      {props.isProfileOfYou ? (
        <Button
          style={{
            fontWeight: '600',
            fontSize: '10px',
            position: 'absolute',
            transition: 'all 0.5s',
            height: props.width <= 885 ? '30px' : 'auto',
            padding: '8px',
          }}
          variant="contained"
          onClick={deleteImage}
          className="imageRemove"
          color="secondary"
          startIcon={<DeleteIcon />}
        >
          remove
        </Button>
      ) : (
        ''
      )}
      <Button
        style={{
          fontWeight: '600',
          backgroundColor: '#292f3f',
          fontSize: '10px',
          position: 'absolute',
          transition: 'all 0.5s',
          height: props.width <= 885 ? '30px' : 'auto',
          padding: '8px',
        }}
        variant="contained"
        onClick={fullscreenImage}
        className="imageFullScreen"
        color="secondary"
        startIcon={<FullscreenIcon />}
      >
        Full screen
      </Button>
      {props.isProfileOfYou ? (
        <Button
          style={{
            fontWeight: '600',
            backgroundColor: '#03a9f1',
            fontSize: '10px',
            position: 'absolute',
            transition: 'all 0.5s',
            height: props.width <= 885 ? '30px' : 'auto',
            padding: '8px',
          }}
          variant="contained"
          onClick={makeImageDefault}
          className="imageDefault"
          color="secondary"
          startIcon={<CheckIcon />}
        >
          make default
        </Button>
      ) : (
        ''
      )}
    </div>
  )
}
