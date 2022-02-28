/**
 * Created by jiachenpan on 16/11/18.
 */

export function isvalidUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

/* 合法uri*/
export function validateURL(textval) {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return urlregex.test(textval)
}

/* 小写字母*/
export function validateLowerCase(str) {
  const reg = /^[a-z]+$/
  return reg.test(str)
}

/* 大写字母*/
export function validateUpperCase(str) {
  const reg = /^[A-Z]+$/
  return reg.test(str)
}

/* 大小写字母*/
export function validateAlphabets(str) {
  const reg = /^[A-Za-z]+$/
  return reg.test(str)
}

/**
 * validate email
 * @param email
 * @returns {boolean}
 */
export function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

export function notIntOrDecimal(rule, value, callback) {
  if (!value) {
    return callback(new Error('输入不可以为空'))
  }
  // 校驗(小數/數字)正則表達式
  const pattern = /^[0-9]+([.]{1}[0-9]+){0,1}$/
  if (pattern.test(value)) {
    callback()
  } else {
    callback(new Error('请输入正整数或者小数'))
  }
}

// 验证是否整数
export function isInteger(rule, value, callback) {
  if (!value) {
    return callback(new Error('输入不可以为空'))
  }
  setTimeout(() => {
    if (!Number(value)) {
      callback(new Error('请输入正整数'))
    } else {
      const re = /^[0-9]*[1-9][0-9]*$/
      const rsCheck = re.test(value)
      if (!rsCheck) {
        callback(new Error('请输入正整数'))
      } else {
        callback()
      }
    }
  }, 0)
}
