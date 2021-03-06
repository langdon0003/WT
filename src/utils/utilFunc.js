import {
  notification, message
} from 'antd'

// 浏览器相关
/**
 * @param {string} name 需要获取的qs的键名
 */
export const getQueryString = (name) => { 
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i"),
        r = window.location.search.substr(1).match(reg); 
  if (r!=null) return (r[2]); return null;
}

// 全局提示
export const openNotificationWithIcon = params => {
  const {
    type,
    msg,
    desc
  } = params
  notification[type]({
    className: `wt-noti-${type}`,
    message: msg,
    description: desc
  })
}
export const popMessage = params => {
  const { type, msg } = params
  message[type]({
    content: msg,
    className: `wt-msg-${type}`
  })
}
// 工具类
export const toDecimal = (num, digits = 2) => {
  num = num + ""
  digits = Number(digits)
  // console.log("====toD", num, digits)
  // 取整数
  if (digits === 0) {
    return num.split(".")[0]
  }
  // 截取小数点后digits位
  if (num.indexOf(".") !== -1) {
    num = num.substring(0, num.indexOf(".") + digits + 1)
  } else {
    num += "."
  }
  while (digits - num.split(".")[1].length > 0) {
    num += "0"
  }
  return num
}
export const isJSON = (str) => {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log('error：' + str + '!!!' + e);
      return false;
    }
  }
}

export const getCurrDate = () => {
  const _date = new Date(),
    year = _date.getFullYear(),
    month = ('0' + (_date.getMonth() + 1)).slice(-2),
    date = ('0' + _date.getDate()).slice(-2),
    hour = ('00' + _date.getHours()).slice(-2),
    minute = ('00' + _date.getMinutes()).slice(-2),
    second = ('00' + _date.getSeconds()).slice(-2)

  return _date
  // return `${year}年${month}月${date}日 ${hour}:${minute}:${second}`
}

// 交易相关
// --- 判断下单方向
export const isBuy = (type, filter = ["buy", "buylimit", "buystop"]) => {
  for (var _type of filter) {
    if (type.toLowerCase() === _type.toLowerCase()) return true
  }
  return false
}
export const getCmdArr = () => (
  ['Buy', 'Sell', 'Buy Limit', 'Sell Limit', 'Buy Stop', 'Sell Stop', 'Balance']
)

// 日期相关
export const currDateInfo = () => {
  let d = new Date()
  return ({
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minutes: d.getMinutes()
  })
}
// 获取两位数的时分秒值
export const getForTwoDigits = (num) => {
  return ("00" + num).slice(-2)
}