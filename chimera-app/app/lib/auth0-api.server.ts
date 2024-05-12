const apiDomain = `https://${process.env.AUTH0_DOMAIN}`
const apiBaseUrl = `${apiDomain}/api/v2`

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

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

// ユーザーを削除する関数
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
      throw new Error(errorData.message || 'Failed to delete user')
    }

    console.log('User deleted successfully')
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
