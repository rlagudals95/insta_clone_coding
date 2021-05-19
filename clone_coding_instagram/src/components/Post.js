import React, { useEffect, useState } from "react";

import ModalDetail from "./ModalDetail";
import ModalForChange from "./ModalForChange";

import styled from "styled-components";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";

import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import CloudQueueIcon from "@material-ui/icons/CloudQueue";
import SendIcon from "@material-ui/icons/Send";
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";

import { actionCreators as postActions } from "../redux/modules/post";

import { history } from "../redux/configureStore";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators as commentActions } from "../redux/modules/comment";

const Post = (props) => {
  console.log(props);
  const dispatch = useDispatch();
  const is_login = useSelector((state) => state.user.is_login);
  const [comments, setComments] = useState();
  const [is_modal, setDetailModal] = useState();
  const [is_changemodal, setChangeModal] = useState();
  const ok_submit = comments ? true : false;

  // console.log(props); // props는 PostList에서 받겠지 바보야 ㅠㅠ
  // console.log(props);
  // console.log(props.like_id); // 요기안에서 찾아라! 라이크 아이디는 라이크 누른 유저들의 배열로 이뤄진거 알죠?
  const is_me = useSelector((state) => state.user.user.user_id); // 로그인한 사용자.
  const user_info = useSelector((state) => state.user.user);
  const comment_list = useSelector((state) => state.comment.list);
  // console.log(comment_list);// 이거 콘솔하면 엄청 많이 나오는 구먼~ 포스트마다 댓글 쫘악!
  const is_comment = comment_list ? true : false;
  const idx = props.like_id.findIndex((l) => l === user_info.user_id);
  // like_id 값이랑 유저인포의 유저라이디랑 같은??
  const is_like = idx !== -1 ? true : false;

  // console.log(idx);
  // console.log(props.like_id); //이거랑  nDzr6XwBXhgAw6HEvi2NoleaZx42  console.log(_post);랑 같네?
  // console.log(user_info.user_id); //이거랑  nDzr6XwBXhgAw6HEvi2NoleaZx42 ?? 두개 같네?

  const likeSubmit = () => {
    if (!is_login) {
      window.alert("😀로그인 해야 할 수 있어요!");
      return;
    }
    let like_id; //서버로 보내줄 라이크 아이디 배열 만들거야
    if (props.like_id.length === 0) {
      // 근데 만약 지금 포스트에 라이크 한사람이 없어
      like_id = [user_info.user_id]; // 그럼 라이크 id에 현재 접속유저 id를 넣어 준다
    } else {
      like_id = [...props.like_id, user_info.user_id];
    } // 좋아요 누른 사람이 있네? 그럼 그뒤에 현재 접속 유저 아이디 넣어주면되지?
    let cnt = props.like_cnt + 1;

    let post = {
      // 포스트 하나의 모든정보를 like ㄱㄱ
      userId: props.user_id,
      userName: props.user_name,
      contents: props.content,
      img: props.post_image_url,
      myImg: props.profile_image_url,
      insertDt: props.insert_dt,
      likeCnt: cnt,
      likeId: like_id,
    };
    let post_id = props.id;
    // console.log(post);
    dispatch(postActions.editLikeAX(post, post_id));
  };

  const dislikeSubmit = () => {
    let like_id = [];
    like_id = props.like_id.filter((l, idx) => {
      if (l !== user_info.user_id) {
        // console.log(like_id);
        //라이크를 누른 유저들 배열이 올건데 // 거기서 현재 유저 아이디랑 다른것들을 리턴해

        return [...like_id, l];
      }
    });
    let cnt = props.like_cnt - 1;
    let post = {
      userId: props.user_id,
      userName: props.user_name,
      contents: props.content,
      img: props.post_image_url,
      myImg: props.profile_image_url,
      insertDt: props.insert_dt,
      likeCnt: cnt,
      likeId: like_id, // 현재 아이디가 빠진 라이크 아이디
    };
    let post_id = props.id;
    dispatch(postActions.editLikeAX(post, post_id));
  };

  React.useEffect(() => {
    console.log(props.id);
    dispatch(commentActions.getCommentAX(props.id));
  }, []);

  // 댓글, 모달창을 제어하는 함수들
  const selectComment = (e) => {
    console.log(e.target.value);
    setComments(e.target.value);
  };

  const openDetailModal = () => {
    setDetailModal(true);
  };

  const closeDetailModal = () => {
    setDetailModal(false);
  };

  const openChangeModal = () => {
    setChangeModal(true);
  };

  const closeChangeModal = () => {
    setChangeModal(false);
  };

  const addComment = () => {
    console.log(comments);
    let comment_info = {
      comment: comments,
      user_name: user_info.user_name,
      profile_url: user_info.profile_url,
    };

    dispatch(commentActions.addCommentAX(comment_info, props.id));
    setComments("");
  };

  const deleteComment = (id) => {
    console.log(id);
    // console.log("하이");
    dispatch(commentActions.deleteCommentAX(id, props.id));
  };

  const timeForToday = (value) => {
    const today = new Date();
    const timeValue = new Date(value);

    const betweenTime = Math.floor(
      (today.getTime() - timeValue.getTime()) / 1000 / 60
    );
    if (betweenTime < 1) return "방금전";
    if (betweenTime < 60) {
      return `${betweenTime}분전`;
    }

    const betweenTimeHour = Math.floor(betweenTime / 60);
    if (betweenTimeHour < 24) {
      return `${betweenTimeHour}시간전`;
    }

    const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
    if (betweenTimeDay < 365) {
      return `${betweenTimeDay}일전`;
    }

    return `${Math.floor(betweenTimeDay / 365)}년전`;
  };

  return (
    <React.Fragment>
      <PostInner>
        <PostBox>
          <PostHeader>
            <PostHeaderLeft>
              <ProfileCircle src={props.profile_image_url} />
              <PostAuthor>{props.user_name}</PostAuthor>
            </PostHeaderLeft>
            {/* 로그인한 사용자와 작성자가 같다면 수정/삭제 모달이 뜨게 하는 버튼이 보이게 한다  */}
            {props.user_id === is_me ? (
              <MoreHorizIcon
                height="14px"
                width="14px"
                cursor="pointer"
                onClick={openChangeModal}
              />
            ) : null}
          </PostHeader>
          <PostBody>
            <PostImage src={props.post_image_url} onClick={openDetailModal} />
            {/* 오픈디테일 모달로 > 이미지 클릭시 모달창 띄움 */}
          </PostBody>
          <BottomIcons>
            <ThreeIcons>
              {/* 좋아요를 누른다면 빨간색, 좋아요를 안 눌렀거나 취소하면 빈 하트
                  좋아요를 누르면 좋아요 + 1, 좋아요 취소하면 좋아요 -1 */}
              {is_like ? (
                <FavoriteIcon
                  padding-right="16px"
                  cursor="pointer"
                  color="secondary"
                  onClick={dislikeSubmit}
                />
              ) : (
                <FavoriteBorderIcon
                  padding-right="16px"
                  cursor="pointer"
                  onClick={likeSubmit}
                />
              )}
              <CloudQueueIcon padding-left="16px" padding-right="16px" />
              <SendIcon padding-left="16px" />
            </ThreeIcons>
            <BookmarkBorderIcon cursor="pointer" />
          </BottomIcons>
          <BottomLike>좋아요 {props.like_cnt}개</BottomLike>
          <BottomAuthorCommentBox>
            <AuthorCommentBox>
              <Author>{props.user_name}</Author>
              <Comment>{props.content}</Comment>
            </AuthorCommentBox>
          </BottomAuthorCommentBox>
          {/* 메인 페이지의 게시글의 댓글란 
            댓글은 최대 2개만 보이게 해서 창이 넘치지 않게 한다 */}
          {is_comment
            ? comment_list.map((c, idx) => {
                //여기서 댓글을 입력하고 map으로 props 값을 돌려서 화면을 띄우게 해줌
                if (idx < 2) {
                  //댓글이 2개보다 작다면? 1개라면?
                  return (
                    <ReplyBox>
                      <Replys>
                        <ReplyWriter>{c.user_name}</ReplyWriter>
                        <Reply>{c.comment}</Reply>
                      </Replys>
                      {c.user_name === user_info.user_name ? (
                        <DeleteBtn
                          onClick={() => {
                            deleteComment(c.id);
                          }}
                        >
                          <DeleteForeverIcon />
                        </DeleteBtn>
                      ) : null}
                    </ReplyBox>
                  );
                }
              })
            : null}

          <InsertTime>{timeForToday(props.insert_dt)}</InsertTime>
          <CommentInputBox>
            <CommentInput
              type="text"
              placeholder="댓글달기..."
              onChange={selectComment}
              value={comments}
            ></CommentInput>
            {ok_submit ? (
              <UploadBtn onClick={addComment}>게시</UploadBtn>
            ) : (
              <UploadBtn style={{ opacity: "0.3" }}>게시</UploadBtn>
            )}
          </CommentInputBox>
        </PostBox>
      </PostInner>
      {/* 모든 요소들의 밖에서 상세페이지 모달, 수정/삭제 모달을 제어 */}
      {is_modal ? (
        <ModalDetail
          close={closeDetailModal}
          {...props} //여기서 모달에 모든 정보를 넘겨주는 구나!
          is_comment={is_comment}
          comment_list={comment_list}
          user_info={user_info}
          deleteComment={deleteComment}
          is_me={is_me}
          openChangeModal={openChangeModal}
        />
      ) : null}
      {is_changemodal ? (
        <ModalForChange close={closeChangeModal} {...props} />
      ) : null}
    </React.Fragment>
  );
};

{
  /* <span style={{fontSize: "24px"}}>♡</span> */
}
export default Post;

Post.defaultProps = {
  id: null,
  user_info: {
    user_id: "mkmkh",
    user_name: "",
    user_profile: "",
  },
  profile_image_url: "https://pbs.twimg.com/media/DYdKfivVwAAe_td.jpg",
  post_image_url:
    "https://static.hubzum.zumst.com/2017/10/11/13/9b4064dd95be428a964e95af18cc0a0b.jpg",

  reply_info: {
    user_id: "hh99",
    username: "",
    reply_input: "멋있네요",
    reply_cancel: "",
    reply_dt: "2021-04-01 12:02:02",
    is_me: false,
  },
  content: "클론코딩 9조 대박!",
  like_cnt: 10,
  insert_dt: "2021-04-02 14:02:02",
};

const PostInner = styled.div`
  width: 935px;
  margin: auto;
  @media (max-width: 935px) {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const PostBox = styled.div`
  width: 614px;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  box-sizing: border-box;
  margin-bottom: 60px;
  background: white;
  // max-width: 614px;
  @media (max-width: 614px) {
    width: 100vw;
  }
`;

const PostHeader = styled.div`
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 16px;
  box-sizing: border-box;

  @media (max-width: 614) {
    width: 100%;
    heigth: 100%;
  }
`;

const PostHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  /* padding-left: 16px; */
`;

const ProfileCircle = styled.div`
  height: 32px;
  width: 32px;
  margin: 0px 14px 0px 0px;
  border-radius: 50%;
  background-image: url("${(props) => props.src}");
  background-size: cover;
  cursor: pointer;

  /* @media (max-width: 614px){
    width: 100%;
    heigth: 100%;
  } */
`;

const HeaderInfo = styled.div`
  height: 40px;
  margin: 0 0 0 0;
  width: 536px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PostAuthor = styled.div`
  height: auto;
  width: auto;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
`;

const PostBody = styled.div`
  overflow: hidden;
`;

const PostImage = styled.img`
  /* overflow: hidden; */
  width: 100%;
  height: auto;
  background-size: cover;
  cursor: pointer;
`;

const BottomIcons = styled.div`
  height: 40px;
  margin: 4px 0px 0px 0px;
  padding: 0px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ThreeIcons = styled.div`
  height: 24px;
  width: 104px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BottomLike = styled.div`
  height: 20px;
  padding: 0px 0px 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
`;

const BottomAuthorCommentBox = styled.div`
  padding: 0px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AuthorCommentBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Author = styled.div`
  font-size: 14px;
  font-weight: bold;
  padding-right: 10px;
`;

const Comment = styled.div`
  font-size: 14px;
`;

const ReplyBox = styled.div`
  padding: 5px 20px 0px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Replys = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReplyWriter = styled.div`
  font-size: 14px;
  font-weight: bold;
  padding-right: 10px;
`;

const Reply = styled.div`
  font-size: 14px;
`;

const DeleteBtn = styled.button`
  height: 12px;
  width: 12px;
  cursor: pointer;
  background-color: transparent;
  border: none;
  outline: none;
  margin-right: 15px;
  opacity: 0.3;
  &:hover {
    opacity: 1;
  }
`;

const InsertTime = styled.div`
  font-size: 10px;
  color: #999;
  border-bottom: 1px solid #efefef;
  padding: 16px;
`;

const CommentInputBox = styled.div`
  width: 100%;
  height: 56px;
  margin-top: 4px;
  padding: 0px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  /* background-size: cover;
  position: relative; */
`;

const CommentInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  width: 90%;
`;

const UploadBtn = styled.div`
  font-size: 14px;
  color: #3897f0;
  cursor: pointer;
  opacity: 1;
  font-weight: 600;
  /* position: absolute; */
  /* right: 16px; */
  /* top: 50%; */
  /* transform: translateY(-50%); */

  /* pointer-events: none; */
`;
