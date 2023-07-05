const axios = require('axios')

class AuthService {
  static getToken() {
    const username = 'notgr_server'
    const password = 'P@ssword123'
    const strategy = 'login'
    return axios
      .post('https://api.muri-o.com/authentication', {
        strategy,
        username,
        password
      })
      .then((res) => {
        const payload = res.data.authentication.payload
        const token = res.data.accessToken
        return {
          payload: payload,
          token: token
        }
      })
  }

}

module.exports = { AuthService }
