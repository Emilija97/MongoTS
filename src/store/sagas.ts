import { all, takeEvery, put } from "redux-saga/effects";
import {
  getAllQuestions,
  getNumberOfQuestions,
  postNewQuestion,
  deleteQuestionFromApi
} from "../services/question.service";
import {
  postNewResult,
  getAllResults,
  deleteResultById
} from "../services/result.service";
import {
  logInUser,
  getUserById,
  registerUser,
  getUserByToken
} from "../services/auth.service";
import { addQuestions, addNumQuestions, FetchNewQuestion, addQuestion, DeleteQuestionSaga, deleteQuestion, FETCH_QUESTIONS, FETCH_NUMQUESTIONS, FETCH_NEW_QUESTION, DELETE_QUESTION_SAGA } from "./actions/questions";
import { SaveResult, saveResultSuccess, FetchResults, addResults, DeleteResult, deleteResultSuccess, SAVE_RESULT, FETCH_RESULTS, DELETE_RESULT } from "./actions/results";
import { LogIn, logInSuccess, logInFailure, CheckUser, checkUserSuccess, checkUserFailure, Register, registerSuccess, registerFailure, MeFromToken, meFromTokenSuccess, meFromTokenFailure, LOGIN, CHECK_USER, REGISTER, ME_FROM_TOKEN } from "./actions/users";
let offset = 1;

function* fetchQuestions() {
  const questions = yield getAllQuestions();
  yield put(addQuestions(questions));
}

function* fetchNumberOfQuestions() {
  const questionList = yield getNumberOfQuestions(offset);
  console.log(questionList);
  yield put(addNumQuestions(questionList));
  offset++;
}

function* fetchNewQuestion(action: FetchNewQuestion) {
  console.log("New question " + action.question);
  const question = action.question;
  yield postNewQuestion(question);
  yield put(addQuestion(question));
}

function* deleteQuestionSaga(action: DeleteQuestionSaga) {
  const questionId = action.questionId;
  yield deleteQuestionFromApi(questionId);
  yield put(deleteQuestion(questionId));
}

function* saveResult(action: SaveResult) {
  console.log("Post result saga");
  const result = action.result;
  yield postNewResult(result);
  yield put(saveResultSuccess(result));
}

function* fetchResults(action: FetchResults) {
  const results = yield getAllResults();
  yield put(addResults(results));
}

function* deleteResult(action: DeleteResult) {
  const resultId = action.resultId;
  yield deleteResultById(resultId);
  yield put(deleteResultSuccess(resultId));
}

function* logIn(action: LogIn) {
  const username = action.username;
  const password = action.password;
  let tmp = false;
  const res = yield logInUser(username, password);
  yield logInUser(username, password).then(res => {
    console.log(res);
    if (res.msg !== "User Does not exist") {
      tmp = true;
    }
  });

  if (tmp) {
    yield put(logInSuccess(res));
  } else {
    yield put(logInFailure(res));
  }
}

function* checkUser(action: CheckUser) {
  const id = action.id;
  if (id) {
    const res = yield getUserById(id);
    if (res) {
      yield put(checkUserSuccess(res));
    } else yield put(checkUserFailure("User is not logged"));
  }
}

function* register(action: Register) {
  const user = action.user;
  let tmp = false;
  yield registerUser(user).then(res => {
    if (res.msg !== "User already exists") tmp = true;
  });
  if (tmp) {
    yield put(registerSuccess(user));
  } else {
    yield put(registerFailure("Username is already taken."));
  }
}

function* meFromToken(action: MeFromToken) {
  console.log("Usao sam u me from token");
  const token = action.tokenFromStorage;
  let response = yield getUserByToken(token);
  console.log(response.user);
  if (!response.error) {
    console.log("U accept sam");
    //reset token (possibly new token that was regenerated by the server)
    localStorage.setItem("token", response.token);
    yield put(meFromTokenSuccess(response));
  } else {
    localStorage.removeItem("token"); //remove token from storage
    yield put(meFromTokenFailure("Token doesn't exist"));
  }
}

export function* rootSaga() {
  yield all([
    takeEvery(FETCH_QUESTIONS, fetchQuestions),
    takeEvery(FETCH_NUMQUESTIONS, fetchNumberOfQuestions),
    takeEvery(FETCH_NEW_QUESTION, fetchNewQuestion),
    takeEvery(DELETE_QUESTION_SAGA, deleteQuestionSaga),
    takeEvery(SAVE_RESULT, saveResult),
    takeEvery(FETCH_RESULTS, fetchResults),
    takeEvery(DELETE_RESULT, deleteResult),
    takeEvery(LOGIN, logIn),
    takeEvery(CHECK_USER, checkUser),
    takeEvery(REGISTER, register),
    takeEvery(ME_FROM_TOKEN, meFromToken)
  ]);
}
