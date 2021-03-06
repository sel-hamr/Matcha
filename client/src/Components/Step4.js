import React from 'react'
import ImageFile from '../Images/sst.svg'
import DeleteIcon from '@material-ui/icons/Delete'
import CheckIcon from '@material-ui/icons/Check'
import Button from '@material-ui/core/Button'
import { useWindowSize } from './UseWindowSize'
import { checkImages } from './Validate'

const Step4 = (props) => {
  const width = useWindowSize()
  let getImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader()
      reader.onload = async function () {
        if (await checkImages([reader.result])) {
          let DataStep = props.InfoStep
          if (DataStep.step5.length < 5) {
            DataStep.step5.push({ src: reader.result, default: 0 })
            props.ChangeInfoStep({ ...DataStep })
          }
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }
  let deleteImage = (e) => {
    let arrayPicture = Array.from(document.querySelectorAll('.picture'))
    if (arrayPicture.length !== 0) {
      let DataStep = props.InfoStep
      DataStep.step5.splice(arrayPicture.indexOf(e.target.closest('.picture')), 1)
      props.ChangeInfoStep({ ...DataStep })
    }
  }
  let makeImageDefault = (e) => {
    let arrayPicture = Array.from(document.querySelectorAll('.picture'))
    let DataStep = props.InfoStep
    DataStep.step5.forEach((element) => {
      element.default = 0
    })
    DataStep.step5[arrayPicture.indexOf(e.target.closest('.picture'))].default = 1
    props.ChangeInfoStep({ ...DataStep })
  }
  return (
    <>
      <div className="choosePicture">
        <input
          className="file-input"
          type="file"
          onChange={getImage}
          onClick={(e) => {
            e.target.value = ''
          }}
        />
        <img src={ImageFile} alt="..." />
        <p className="t2-min">Drop Image here or click to upload</p>
      </div>
      <div className="pictures">
        {props.InfoStep.step5.map((imageSrc, key) => (
          <div className="picture" key={key}>
            <img src={imageSrc.src} alt="..."></img>
            <Button
              style={{
                position: 'absolute',
                transition: 'all 0.5s',
                fontWeight: '600',
                height: width <= 885 ? '30px' : 'auto',
                fontSize: '10px',
                padding: '8px',
              }}
              variant="contained"
              className="btnRemove"
              color="secondary"
              onClick={deleteImage}
              startIcon={<DeleteIcon />}
            >
              {width <= 885 ? '' : 'Delete'}
            </Button>
            {imageSrc.default === 0 ? (
              <Button
                style={{
                  position: 'absolute',
                  transition: 'all 0.5s',
                  fontWeight: '600',
                  backgroundColor: '#03a9f1',
                  fontSize: '10px',
                  height: width <= 885 ? '30px' : 'auto',
                  padding: '8px',
                }}
                variant="contained"
                className="btnDefault"
                color="secondary"
                onClick={makeImageDefault}
                startIcon={<CheckIcon />}
              >
                {width <= 885 ? '' : 'make default'}
              </Button>
            ) : (
              ''
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default Step4
