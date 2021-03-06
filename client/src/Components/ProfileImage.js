import React from 'react'

export default function ProfileImage(props) {
  return (
    <>
      {props.Image ? (
        <img src={props.Image.includes('http://') || props.Image.includes('https://') ? props.Image : `http://${window.location.hostname}:5000${props.Image}`} alt="profileImage" className="DashboardBodyHeaderProfileImage" style={{ ...props.Style }} />
      ) : (
        <div className="no-image-profile" style={{ fontSize: '15px', ...props.Style }}>
          {props.UserName.substring(0, 2).toUpperCase()}
        </div>
      )}
    </>
  )
}
