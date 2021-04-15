import React, { useState, useEffect } from 'react';
import { Row, Col, Avatar, List } from 'antd';
import Axios from 'axios';
import SideVideo from './Sections/SideVideo';
import Subscribe from './Sections/Subscribe';
import Comment from './Sections/Comment';
import LikeDislikes from './Sections/LikeDislikes';

function VideoDetailPage(props) {
  const videoId = props.match.params.videoId;
  //랜딩페이지에서 주소창뒤에 videoId를 보내주고있기때문에가능
  const variable = { videoId: videoId };
  const [VideoDetail, setVideoDetail] = useState([]);
  const [Comments, setComments] = useState([]);


  useEffect(() => {
    Axios.post('/api/video/getVideoDetail', variable).then((response) => {
      if (response.data.success) {
        console.log(response.data);
        setVideoDetail(response.data.videoDetail);
      } else {
        alert('비디오 정보를 가져오길 실패했습니다.');
      }
    });

    Axios.post('/api/comment/getComments', variable).then((response) => {
      if (response.data.success) {
        console.log(response.data.comments);
        setComments(response.data.comments);
      } else {
        alert('코멘트 정보를 가져오는 것을 실패 하였습니다.');
      }
    });
  }, []);

  const refreshFunction = (newComment) => {
    //부모의 Comments state값을 업데이트하기위한 함수
    setComments(Comments.concat(newComment)); //자식들한테 값을 전달받아 Comments값 업데이트
  };

  if (VideoDetail.writer) {
    //witer를 서버에서 가져오기전에 페이지를 렌더링 할려고해서
    //VideoDetail.writer.image 부분에서 type error가 발생한다.

    console.log(VideoDetail);
    const subscribeButton = VideoDetail.writer._id !== localStorage.getItem('userId') && 
    <Subscribe userTo = {VideoDetail.writer._id} userFrom = { localStorage.getItem('userId') } />
    // 

    return (
      <Row gutter={(16, 16)}>
        <Col lg={18} xs={24}>
          <div style={{ width: '100%', padding: '3rem 4rem' }}>
            <video
              style={{ width: '100%' }}
              src={`http://localhost:5000/${VideoDetail.filePath}`}
              controls
            />
            <List.Item actions = { [ <LikeDislikes video userId= { localStorage.getItem('userId') } 
              videoId ={ videoId } />, subscribeButton ] }>
              <List.Item.Meta
                avatar={<Avatar src={VideoDetail.writer.image} />}
                title={VideoDetail.writer.name}
                description={VideoDetail.description}
              />
            </List.Item>
            {/* comment*/}
            <Comment postId={videoId} commentList={Comments} refreshFunction={refreshFunction} />
          </div>
        </Col>

        <Col lg={6} xs={24}>
          <SideVideo />
        </Col>
      </Row>
    );
  } else {
    return <div>...loding</div>;
  }
}

export default VideoDetailPage;