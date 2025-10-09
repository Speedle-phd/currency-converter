import axios from "axios";


export const ccApi = axios.create({
   baseURL: 'https://api.currencyapi.com',
   headers: {
      apikey: import.meta.env.VITE_CC_APIKEY,
   },
})