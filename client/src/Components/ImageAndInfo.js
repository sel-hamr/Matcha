import React, { useContext } from 'react'
import { useWindowSize } from './UseWindowSize'
import Axios from 'axios'
import DeleteIcon from '@material-ui/icons/Delete'
import Button from '@material-ui/core/Button'
import Empty from '../Images/empty.svg'
import { checkImages } from './Validate'
import ReportIcon from '@material-ui/icons/Report'
import BlockIcon from '@material-ui/icons/Block'
import FavoriteIcon from '@material-ui/icons/Favorite'
import { useHistory } from 'react-router-dom'
import IconButton from '@material-ui/core/IconButton'
import ImageUser from './ImageUser'
import Skeleton from '@material-ui/lab/Skeleton'
import ProfileImage from './ProfileImage'
import Rating from '@material-ui/lab/Rating'
import ExploreIcon from '@material-ui/icons/Explore'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import { DataContext } from '../Context/AppContext'
import RoomIcon from '@material-ui/icons/Room'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'

export default function ImageAndInfo(props) {
  const ctx = useContext(DataContext)
  let history = useHistory()
  const width = useWindowSize()
  const [ifUpload, changeIfUpload] = React.useState(0)
  const [ratingValue, changeRatingValue] = React.useState({ userValue: parseFloat(props.InfoUser.MyRating) })
  function clickRating(value, usernameReceiver) {
    Axios.post('Rating', {
      usernameReceiver,
      RatingValue: parseFloat(parseFloat(value).toFixed(1)),
    }).then((data) => {
      if (typeof data.data === 'object') {
        props.ChangeInfoUser({ ...props.InfoUser, YourRating: data.data.AVG, CountRating: data.data.CountReview })
        changeRatingValue(() => ({
          userValue: value,
        }))
      }
    })
  }
  const getImage = (e) => {
    if (ifUpload === 0) {
      if (props.InfoUser.Images.length < 5) {
        changeIfUpload(1)
        props.ChangeInfoUser({
          ...props.InfoUser,
          Images: [...props.InfoUser.Images, 'XXX'],
        })
        let Images = props.InfoUser.Images
        try {
          let reader = new FileReader()
          reader.onload = async function () {
            let image = reader.result
            if (await checkImages([image])) {
              try {
                Axios.post('/Profile/AddImage', { image: image }).then((result) => {
                  changeIfUpload(0)
                  Images.push(result.data)
                  props.ChangeInfoUser({
                    ...props.InfoUser,
                    Images: [...Images],
                  })
                  if (Images.length === 1) {
                    props.changeUser((oldValue) => ({
                      ...oldValue,
                      Image: result.data,
                    }))
                  }
                })
              } catch (error) {}
            } else {
              changeIfUpload(0)
              props.ChangeInfoUser({ ...props.InfoUser, Images: [...Images] })
              props.ChangeError(['Image is not valid or too log'])
              props.ChangeShowError(true)
            }
          }
          reader.readAsDataURL(e.target.files[0])
        } catch (error) {}
      } else {
        changeIfUpload(0)
        props.ChangeError(['you uploaded more than 5 images'])
        props.ChangeShowError(true)
      }
    }
  }
  let BlockUser = () => {
    try {
      Axios.get(`/Profile/BlockUser/${props.userName}`).then((result) => {
        ctx.ref.removeFriend(props.userName)
        ctx.ref.removeNotification(props.userName)
        history.push('/')
      })
    } catch (error) {}
  }
  let ReportUser = (e) => {
    try {
      Axios.get(`/Profile/ReportUser/${props.userName}`).then((result) => {
        if (result.data === 'successful')
          props.changeUserNameAndEmail({
            ...props.UserNameAndEmail,
            isNotReport: false,
          })
      })
    } catch (error) {}
  }
  let like = () => {
    try {
      Axios.post(`/Friends/Invite/`, { UserName: props.userName }).then((result) => {
        props.ChangeInfoUser(() => ({
          ...props.InfoUser,
          CheckFriends: props.InfoUser.CheckFriends === 0 ? 1 : 0,
        }))
        ctx.ref.removeFriend(props.userName)
      })
    } catch (error) {}
  }
  let updatePosition = (e) => {
    e.target.closest('button').style.display = 'none'
    props.changeShowSuccess(true)
    function success(pos) {
      try {
        Axios.post(`/Profile/UpdatePosition`, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }).then(() => {})
      } catch (error) {}
    }
    async function error() {
      const response = await Axios.get('https://ipinfo.io/json', {
        headers: {
          Authorization: 'Bearer 98b6dabb89ced1',
        },
      })
      try {
        Axios.post(`/Profile/UpdatePosition`, {
          ip: response.data.ip,
        }).then((result) => {})
      } catch (error) {}
    }
    navigator.permissions.query({
      name: 'geolocation'
    }).then(function(result) {
        permissionGeolocation(result.state)
        result.onchange = function() {
            permissionGeolocation(result.state);
        }
    });
    function permissionGeolocation(state)
    {
      if (state === 'granted' || state === "promp")
        navigator.geolocation.getCurrentPosition(success, error)
      else
        error()
    }
  }

  let deleteImageProfile = (e) => {
    try {
      Axios.post('/Profile/DeleteImage', { index: 0 }).then((result) => {
        let arrayImage = props.InfoUser.Images
        arrayImage.splice(0, 1)
        props.changeUser((oldValue) => ({ ...oldValue, Image: arrayImage[0] }))
        props.ChangeInfoUser({ ...props.InfoUser, Images: [...arrayImage] })
      })
    } catch (error) {}
  }
  let DeleteMyAccount = (e) => {
    try {
      Axios.post('/Profile/DeleteMyAccount').then((result) => {
        localStorage.clear()
        window.location.reload()
      })
    } catch (error) {}
  }
  const formUpdatePasswordShow = () => {
    props.ChangeShowUpdatePassword(true)
  }
  return (
    <div>
      <div className="slide-in-left">
        <div className="ImageProfile">
          {props.InfoUser.Images[0] !== 'XXX' ? (
            <>
              <ProfileImage Image={props.InfoUser.Images[0]} UserName={props.UserNameAndEmail.userName} Style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', fontSize: '65px' }} />
              {props.UserNameAndEmail.isProfileOfYou && props.InfoUser.Images[0] ? (
                <div className="deleteProfile">
                  <IconButton color="primary" component="span" onClick={deleteImageProfile}>
                    <DeleteIcon style={{ color: 'var(--color-QuickActionsMenu)' }} />
                  </IconButton>
                </div>
              ) : (
                ''
              )}
            </>
          ) : (
            <Skeleton variant="circle" style={{ borderRadius: '50%', width: '100%', height: '100%' }}></Skeleton>
          )}
        </div>
        <div>
          <p className="UseName">{props.UserNameAndEmail.userName}</p>
          <p className="Email">{props.UserNameAndEmail.isProfileOfYou ? props.UserNameAndEmail.email : props.InfoUser.Active === 1 ? 'Online' : ' login ' + ctx.ref.ConvertDate(props.InfoUser.LastLogin) + '   ago'}</p>
          {props.UserNameAndEmail.isProfileOfYou ? (
            ''
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RoomIcon style={{ marginRight: '8px' }} />
              <p className="Email" style={{ marginBottom: '0px' }}>
                {(props.InfoUser.Distance / 1000).toFixed(1)}Km
              </p>
            </div>
          )}

          <div className="CountReviewFriend">
            <div>
              <p>{parseFloat(props.InfoUser.YourRating).toFixed(1)}</p>
              <p>{`${props.InfoUser.CountRating} reviews`}</p>
            </div>
            <div></div>
            <div>
              <p>{props.InfoUser.CountFriends}</p>
              <p>Friends</p>
            </div>
          </div>
          {props.UserNameAndEmail.isProfileOfYou ? (
            <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', alignItems: 'center', height: '95px' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<VpnKeyIcon />}
                onClick={formUpdatePasswordShow}
                style={{
                  marginTop: '15px',
                  fontWeight: '600',
                  fontSize: '11px',
                  paddingBottom: '5px',
                  paddingTop: '5px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  backgroundColor: 'var(--background-Nav)',
                }}
              >
                Update Password
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ExploreIcon />}
                onClick={updatePosition}
                style={{
                  marginTop: '15px',
                  fontWeight: '600',
                  fontSize: '11px',
                  paddingBottom: '5px',
                  paddingTop: '5px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  backgroundColor: 'var(--background-Nav)',
                }}
              >
                refresh GPS
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={DeleteMyAccount}
                style={{
                  marginTop: '15px',
                  fontWeight: '600',
                  fontSize: '11px',
                  paddingBottom: '5px',
                  paddingTop: '5px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  backgroundColor: 'var(--background-Nav)',
                }}
              >
                Delete my account
              </Button>
            </div>
          ) : (
            <>
              {props.InfoUser.IfHaveImage ? <Rating name="simple-controlled" value={ratingValue.userValue} max={5} precision={0.5} onChange={(event, value) => clickRating(value, props.UserNameAndEmail.userName)} style={{ marginTop: '10px' }} /> : ''}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-around',
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<BlockIcon />}
                  onClick={BlockUser}
                  style={{
                    marginTop: '15px',
                    fontWeight: '600',
                    fontSize: '13px',
                    paddingBottom: '5px',
                    paddingTop: '5px',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    backgroundColor: 'var(--background-Nav)',
                  }}
                >
                  Block
                </Button>
                {props.UserNameAndEmail.isNotReport ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={ReportUser}
                    startIcon={<ReportIcon />}
                    style={{
                      marginTop: '15px',
                      fontWeight: '600',
                      fontSize: '13px',
                      paddingBottom: '5px',
                      paddingTop: '5px',
                      paddingLeft: '12px',
                      paddingRight: '12px',
                      backgroundColor: 'var(--background-Nav)',
                    }}
                  >
                    report
                  </Button>
                ) : null}
                {props.InfoUser.IfHaveImage ? (
                  props.InfoUser.CheckFriends === 1 ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<FavoriteBorderIcon />}
                      style={{
                        marginTop: '15px',
                        fontWeight: '600',
                        fontSize: '13px',
                        paddingBottom: '5px',
                        paddingTop: '5px',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        backgroundColor: 'var(--background-Nav)',
                      }}
                      onClick={like}
                    >
                      UnLike
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<FavoriteIcon />}
                      style={{
                        marginTop: '15px',
                        fontWeight: '600',
                        fontSize: '13px',
                        paddingBottom: '5px',
                        paddingTop: '5px',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        backgroundColor: 'var(--background-Nav)',
                      }}
                      onClick={like}
                    >
                      Like
                    </Button>
                  )
                ) : (
                  ''
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="slide-in-left">
        {width > 630 && props.UserNameAndEmail.isProfileOfYou === true ? (
          <div className="addImage">
            <p>Add Image</p>
            <input
              type="file"
              accept="image/*"
              onChange={getImage}
              onClick={(e) => {
                e.target.value = ''
              }}
            />
          </div>
        ) : (
          <>
            <hr style={{ border: 'none', height: '0.1px', width: '97%' }} />
            <p>Photos</p>
          </>
        )}
        <div className="Images">
          {props.InfoUser.Images.length <= 1 ? (
            <div
              style={{
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img src={Empty} alt="..." style={{ width: '250px', marginBottom: '40px' }} />
              <p className="labelInfo" style={{ width: '137px' }}>
                Image Not Found
              </p>
            </div>
          ) : (
            props.InfoUser.Images.map((value, key) =>
              key !== 0 ? (
                value !== 'XXX' ? (
                  <ImageUser
                    isProfileOfYou={props.UserNameAndEmail.isProfileOfYou}
                    InfoUser={props.InfoUser}
                    width={width}
                    image={value.includes('http://') || value.includes('https://') ? value : `http://${window.location.hostname}:5000${value}`}
                    ChangeImage={props.ChangeImage}
                    changeUser={props.changeUser}
                    ChangeInfoUser={props.ChangeInfoUser}
                    key={key}
                  />
                ) : (
                  <div className="Image" key={key}>
                    <Skeleton variant="rect" width={220} height={320} style={{ borderRadius: '8px' }}></Skeleton>
                  </div>
                )
              ) : (
                ''
              )
            )
          )}
          {width <= 630 && props.UserNameAndEmail.isProfileOfYou === true ? (
            <div
              className="addImage Image"
              style={{
                height: '320px',
                paddingLeft: '0px',
                marginLeft: '10px',
              }}
            >
              <p>Add Image</p>
              <input
                type="file"
                accept="image/*"
                onChange={getImage}
                onClick={(e) => {
                  e.target.value = ''
                }}
              />
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  )
}
