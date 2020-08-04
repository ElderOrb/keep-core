import { takeEvery, put } from "redux-saga/effects"
import {
  SHOW_MESSAGE,
  CLOSE_MEESSAGE,
  REMOVE_MESSAGE,
  ADD_MESSAGE,
  Message,
} from "../actions/messages"

function* addMessage(action) {
  const message = Message.create(action.payload)
  yield put({ type: ADD_MESSAGE, payload: message })
}

function* removeMessage(action) {
  yield put({ type: REMOVE_MESSAGE, payload: action.payload })
}

export function* showMessageSaga() {
  yield takeEvery(SHOW_MESSAGE, addMessage)
}

export function* removeMessageSaga() {
  yield takeEvery(CLOSE_MEESSAGE, removeMessage)
}
