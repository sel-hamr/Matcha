import React from 'react'
import { ReactComponent as SearchSVG } from '../Images/search.svg'
import { ReactComponent as HistorySVG } from '../Images/clock.svg'
import { ReactComponent as ProfileSVG } from '../Images/avatar.svg'
import { ReactComponent as HomeSVG } from '../Images/home.svg'
import { ReactComponent as CloseSVG } from '../Images/close.svg'
import { ReactComponent as CircleSVG } from '../Images/circle.svg'
import { ReactComponent as ArrowDownChatSVG } from '../Images/arrowDownChat.svg'
import { ReactComponent as SendMessageSVG } from '../Images/sendMessage.svg'
import { ReactComponent as BackSVG } from '../Images/back.svg'
import { ReactComponent as UnlikeSVG } from '../Images/unlike.svg'
import { ReactComponent as HeartSVG } from '../Images/heart.svg'
import { ReactComponent as ViewSVG } from '../Images/view.svg'
import { ReactComponent as FriendsSVG } from '../Images/friends.svg'
import { ReactComponent as StarSVG } from '../Images/star.svg'
import { ReactComponent as InfoSVG } from '../Images/info.svg'
import { ReactComponent as BanSVG } from '../Images/ban.svg'
import { ReactComponent as CheckSVG } from '../Images/check.svg'
import { ReactComponent as PinSVG } from '../Images/pin.svg'
import '../Css/Icons.css'

const IconSearch = (props) => <SearchSVG className="Icons" {...props} />
const IconHistory = (props) => <HistorySVG className="Icons" {...props} />
const IconProfile = (props) => <ProfileSVG className="Icons" {...props} />
const IconHome = (props) => <HomeSVG className="Icons" {...props} />
const IconClose = (props) => <CloseSVG className="Icons" {...props} />
const IconCircle = (props) => <CircleSVG className="Icons" {...props} />
const IconArrowDownChat = (props) => <ArrowDownChatSVG className="Icons" {...props} />
const IconBack = (props) => <BackSVG className="Icons" {...props} />
const IconUnlike = (props) => <UnlikeSVG className="Icons" {...props} />
const IconHeart = (props) => <HeartSVG className="Icons" {...props} />
const IconView = (props) => <ViewSVG className="Icons" {...props} />
const IconFriends = (props) => <FriendsSVG className="Icons" {...props} />
const IconStar = (props) => <StarSVG className="Icons" {...props} />
const IconInfo = (props) => <InfoSVG className="Icons" {...props} />
const IconBan = (props) => <BanSVG className="Icons" {...props} />
const IconCheck = (props) => <CheckSVG className="Icons" {...props} />
const IconPin = (props) => <PinSVG className="Icons" {...props} />
const IconSendMessage = (props) => <SendMessageSVG className="Icons" {...props} />

export { IconHome, IconProfile, IconHistory, IconFriends, IconSearch, IconCircle, IconArrowDownChat, IconSendMessage, IconBack, IconClose, IconPin, IconCheck, IconBan, IconInfo, IconStar, IconView, IconHeart, IconUnlike }
