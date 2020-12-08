import { combineReducers } from 'redux'
import {
  SELECT_QUOTETYPE,
  GET_QUOTE,
  RECEIVE_QUOTE
} from './MainAction'

// isFetching -> 是否在抓取数据
// didInvalidate -> 数据是否过时
// lastUpdate -> 上一次更新时间
// 操作开始时，送出一个action，触发state更新为“正在操作”的状态，View重新渲染；结束后，再送出一个action，触发state更新为“操作结束”的状态，Viwe再一次更新
const initialState = {
  selectedQuoteType: 'Indexes',
  postByQuoteType: {
    Indexes: {
      isFetching: false,  
      items: []
    },
    CFD: {
      isFetching: false,
      items: []
    }
  }
}

// 选择显示哪一类报价列表
function selecteQuoteType (state, action) {
  const { type, payload } = action
  const { qType }  = payload
  switch(type) {
    case SELECT_QUOTETYPE: {
      return qType
    }
    default: return state
  }
}

// 获取所有报价列表（需自行整理成所需格式）
function postQuote (
  state = {
    isFetching: false,
    items: []
  },
  action
) {
  const { type, payload } = action
  const { data } = action.payload
  switch(type) {
    case GET_QUOTE:
      return Object.assign({}, state, {
        isFetching: true
      })
    case RECEIVE_QUOTE: 
      return Object.assign({}, state, {
        isFetching: false,
        items: data
      })
    default: return state
  }
}

function postByQuoteType (state = {}, action) {
  const { type, payload } = action
  const { qType }  = payload
  switch(type) {
    case GET_QUOTE:
    case RECEIVE_QUOTE: 
      return Object.assign({}, state, {
        [qType]: postQuote
      })
  }
}

const MainReducer = combineReducers({
  // selecteQuoteType
})

export default MainReducer