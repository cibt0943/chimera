import { createCookie, json } from '@remix-run/node' // or "@remix-run/cloudflare"

function addYear(date: Date, year: number) {
  date.setFullYear(date.getFullYear() + year)
  return date
}

const themeCookie = createCookie('theme', {
  expires: addYear(new Date(), 1),
})

// クッキーからカラーモードを取得
export const getTheme = async (request: Request) => {
  const cookieHeader = request.headers.get('Cookie')
  const cookie = (await themeCookie.parse(cookieHeader)) || {}
  return json({ theme: cookie.theme })
}

// クッキーへカラーモードを設定
export const setTheme = async (request: Request) => {
  const cookieHeader = request.headers.get('Cookie')
  const cookie = (await themeCookie.parse(cookieHeader)) || {}
  const { theme } = await request.json()
  cookie.theme = theme

  return json(theme, {
    headers: {
      'Set-Cookie': await themeCookie.serialize(cookie),
    },
  })
}
