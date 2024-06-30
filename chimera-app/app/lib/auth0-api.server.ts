const apiDomain = `https://${process.env.AUTH0_DOMAIN}`
const apiBaseUrl = `${apiDomain}/api/v2`

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface UpdateAuth0User {
  sub: string
  email?: string
  name?: string
}

// Auth0へのアクセストークンを取得
export async function getAuth0Token(): Promise<TokenResponse> {
  try {
    const response = await fetch(`${apiDomain}/oauth/token`, {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_CLIENT_ID!,
        client_secret: process.env.AUTH0_CLIENT_SECRET!,
        audience: process.env.AUTH0_MANAGEMENT_API_IDENTIFIER,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch access token')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching access token:', error)
    throw error
  }
}

// Auth0ユーザーを更新
export async function updateAuth0User(auth0User: UpdateAuth0User) {
  try {
    // アクセストークンを取得
    const tokenData = await getAuth0Token()

    // ユーザーのPATCHリクエストを送信
    const { sub, ...userWithoutSub } = auth0User // subを取り除いたuserWithoutSubを作成
    const response = await fetch(`${apiBaseUrl}/users/${sub}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify(userWithoutSub),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error response from Auth0:', errorData)
      throw new Error(errorData.message || 'Failed to update Auth0User')
    }

    console.log('Auth0User updated successfully')
  } catch (error) {
    console.error('Error updating Auth0User:', error)
    throw error
  }
}

// Auth0ユーザーを削除
export async function deleteAuth0User(userId: string) {
  try {
    // アクセストークンを取得
    const tokenData = await getAuth0Token()

    // ユーザーのDELETEリクエストを送信
    const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete Auth0User')
    }

    console.log('Auth0User deleted successfully')
  } catch (error) {
    console.error('Error deleting Auth0User:', error)
    throw error
  }
}
