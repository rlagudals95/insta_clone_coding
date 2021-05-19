import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { storage } from "../../shared/firebase";
import axios from "axios";
import { actionCreators as imageActions } from "./image";
import { history } from "../configureStore";
import "moment";
import moment from "moment";

const SET_POST = "SET_POST";
const ADD_POST = "ADD_POST";
const EDIT_POST = "EDIT_POST";
const DELETE_POST = "DELETE_POST";
const LOADING = "LOADING";
const EDIT_LIKE = "EDIT_LIKE";

const setPost = createAction(SET_POST, (post_list) => ({ post_list })); //paging은 나중에 넣기
const addPost = createAction(ADD_POST, (post) => ({ post }));
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}));
const deletePost = createAction(DELETE_POST, (id) => ({ id }));
const loading = createAction(LOADING, (post) => ({ post }));
const editLike = createAction(EDIT_LIKE, (post, post_id) => ({
  post,
  post_id,
}));

const initialState = {
  list: [],
  paging: { start: null, next: null, size: 3 },
  is_loading: false,
};

const initialPost = {
  contents: "",
  user_name: "",
  insert_dt: "",
  post_image_url: "",
  profile_image_url: "",
  user_id: "",
  like_cnt: 0,
  like_id: [],
};

// 작성한 게시글을 서버에 보내는 작업을 합니다.
// 첨부한 사진은 firebase Storage에다가 저장을 하고 url만 받아와서 서버에 보냈습니다.
// 게시글 작성자 데이터와 게시글 내용을 서버에 보냈습니다.
// 그 후에 response로 게시물 id를 받아서 리덕스 스토어에 게시물 데이터와 같이 저장했습니다.

const addPostAX = (post) => {
  return function (dispatch, getState) {
    const _user = getState().user.user;

    const user_info = {
      user_name: _user.user_name,
      user_id: _user.user_id,
      profile_url: _user.profile_url,
    };

    let _post = {
      contents: post.contents,
      insertDt: moment().format("YYYY-MM-DD HH:mm:ss"),
      likeCnt: 0,
      likeId: [],
    };
    const _image = getState().image.preview;

    //이런식으로 파이어베이스 스토리지를 이용해 전송해주는 방식도 있구나!
    const _upload = storage
      .ref(`images/${user_info.user_id}_${new Date().getTime()}`) //id 없어도
      .putString(_image, "data_url");

    _upload.then((snapshot) => {
      snapshot.ref
        .getDownloadURL()
        .then((url) => {
          axios
            .post("http://15.164.217.16/api/contents", {
              ..._post,
              img: url,
              userName: user_info.user_name,
              userId: user_info.user_id,
              myImg: user_info.profile_url,
            })
            .then((response) => {
              // console.log(response);
              let post_list = {
                id: response.data.id,
                post_image_url: url,
                ...user_info,
                contents: post.contents,
                insert_dt: moment().format("YYYY-MM-DD HH:mm:ss"),
                like_cnt: 0,
                like_id: [],
              };
              dispatch(addPost(post_list));
              dispatch(
                imageActions.setPreview("http://via.placeholder.com/400x300")
              );
              history.replace("/");
            });
        })
        .catch((error) => {
          console.log(error);
          window.alert("게시물 저장이 정상적으로 되지 않았습니다.");
        });
    });
  };
};

// DB에 저장되어있는 게시물들을 다 가져옵니다.
// reponse로 받은 게시물 데이터를 하나씩 .foEach를 써서 분류하고
// 리덕스 store에 저장했습니다.

const getPostAX = () => {
  return function (dispatch, getState) {
    axios
      .get("http://15.164.217.16/api/contents")
      .then((res) => {
        console.log(res);

        let post_list = [];

        res.data.forEach((_post) => {
          let post = {
            id: _post.id,
            content: _post.contents,
            insert_dt: _post.insertDt, //작성날짜
            user_name: _post.userName, //로그인 구현되야함
            post_image_url: _post.img,
            profile_image_url: _post.myImg,
            user_id: _post.userId,
            like_cnt: _post.likeCnt, //
            like_id: _post.likeId, // likeId: [id1, id2, id3, id4, id5]
          };
          post_list.unshift(post);
        });
        // console.log(post_list);

        dispatch(setPost(post_list));
      })
      .catch((err) => {
        window.alert("게시물을 가져오는데 문제가 있어요!");
      });
  };
};

// 게시물 데이터를 수정할 때 게시물 이미지도 수정이 되었을 때와 되지 않을 때를 나눴습니다.
// 이미지가 수정되지 않았으면 기존 이미지 url과 수정된 게시글을 업로드합니다.
// 이미지가 수정되었으면 수정된 이미지를 firebase Storage에 저장을하고 url을 받아와서 서버에 보내줍니다.
// 수정된 게시글 data는 리덕스 store에도 저장을 합니다.
const editPostAX = (id, post) => {
  return function (dispatch, getState) {
    if (!id) {
      console.log("게시물이 없어요!");
      return;
    }
    const _image = getState().image.preview; // 이미지는 프리뷰에서 가져온다
    const _post_idx = getState().post.list.findIndex((p) => p.id == id); //게시물 찾아야죠?
    const _post = getState().post.list[_post_idx];
    console.log(post);
    console.log(id); // 이것도 199처럼 숫자
    console.log(_post_idx); //이건 0이겠지 내가쓴 글이 맨위니까??
    console.log(_post); // 결국 포스트 리스트랑 지금 포스트를 비교한다

    let _edit = {
      contents: post.contents,
    };

    if (_image == _post.post_image_url) {
      // 이미지가 수정 안되고 콘텐츠만 수정 되었을때
      axios
        .put(`http://15.164.217.16/api/contents/${id}`, {
          ..._edit,
          img: _image,
        })
        .then((response) => {
          // console.log(response);
          dispatch(editPost(id, { ..._edit }));
          history.replace("/");
        });

      return;
    } else {
      //이미지와 콘텐츠 둘 다 수정할 때
      const user_id = getState().user.user.user_id;
      const _upload = storage
        .ref(`images/${user_id}_${new Date().getTime()}`)
        .putString(_image, "data_url");

      _upload.then((snapshot) => {
        snapshot.ref
          .getDownloadURL()
          .then((url) => {
            return url;
          })
          .then((url) => {
            axios
              .put(`http://15.164.217.16/api/contents/${id}`, {
                ..._edit,
                img: url,
              })
              .then((response) => {
                // console.log(response);
                let edit_list = { ..._edit, post_image_url: url };
                dispatch(editPost(id, edit_list));
                history.replace("/");
              });
          })
          .catch((err) => {
            window.alert("게시물 수정에 문제가 있어요!");
          });
      });
    }
  };
};

const editLikeAX = (post, post_id) => {
  return function (dispatch) {
    // console.log(post_id); // 얘는 nDzr6XwBXhgAw6HEvi2NoleaZx42이 아니라 번호다
    axios
      .put(`http://15.164.217.16/api/contents/${post_id}`, {
        ...post,
      })
      .then((response) => {
        // console.log(post); //여기선이제 like_id에 내 아이디를 넣어줘서 반환해줌
        let _post = {
          like_id: post.likeId, //like = [jhsafgjhagsdf, sandfiuhsdafuisa, asiufdgiasdgfiu, asdfuiiasfgiasdgf, sahdfuihusifd]
          like_cnt: post.likeCnt,
        };
        // console.log(_post); // 39번째줄 like_id랑 user_id 랑같네?
        // console.log(post_id);
        dispatch(editLike(_post, post_id));
      });
  };
};

// 게시글 id값을 보내면 서버에서 db에 저장된 해당 id를 가진 게시물을 삭제합니다.
// 그리고 리덕스 store에서도 저장된 게시물을 삭제해서 바로 삭제된것이 적용되게 합니다.

const deletePostAX = (id) => {
  return function (dispatch, getState) {
    axios
      .delete(`http://15.164.217.16/api/contents/${id}`)
      .then((res) => {
        dispatch(deletePost(id));
        history.replace("/");
      })
      .catch((err) => {
        window.alert("게시물 삭제에 문제가 있어요!");
      });
  };
};

export default handleActions(
  {
    [ADD_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.post);
      }),
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.push(...action.payload.post_list);
        // console.log(draft.list);
        draft.list = draft.list.reduce((acc, cur) => {
          if (acc.findIndex((a) => a.id === cur.id) === -1) {
            return [...acc, cur];
          } else {
            acc[acc.findIndex((a) => a.id === cur.id)] = null;
            return acc;
          }
        }, []);
      }),
    [EDIT_POST]: (state, action) =>
      produce(state, (draft) => {
        let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);
        draft.list[idx] = { ...draft.list[idx], ...action.payload.post };
      }),
    [DELETE_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list = draft.list.filter((r, idx) => {
          if (r.id !== action.payload.id) {
            // console.log(r.id);
            return [...draft.list, r];
          }
        });
      }),
    [EDIT_LIKE]: (state, action) =>
      produce(state, (draft) => {
        // dispatch(editLike(_post, post_id));

        let idx = draft.list.findIndex((p) => {
          // console.log("p.id", p.id);
          // console.log("페이로드", action.payload.post_id); //
          return p.id === action.payload.post_id; // list [a,b,c] // post_id = c >>
        }); //
        // console.log(idx); // post 순번을 찾는다
        draft.list[idx] = { ...draft.list[idx], ...action.payload.post };
        //원래 리스트에 페이로드로 들어온 리스트(새로 라이크 누른 아이디)가 들어오는 건가?
      }),
  },
  initialState
);

const actionCreators = {
  addPost,
  addPostAX,
  getPostAX,
  editPost,
  editPostAX,
  editLikeAX,
  deletePost,
  deletePostAX,
};

export { actionCreators };
