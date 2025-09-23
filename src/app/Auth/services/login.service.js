export const POST_LOGIN = `
  mutation Login($email: String!, $password: String!) {
    signIn(data: {
      email: $email,
      password: $password,
    }) {
      success
      message
      token
      user { id email firstName lastName }
    }
  }
`;

export const GOOGLE_OAUTH_LOGIN = `
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken) {
      success
      message
      token
      user { id email firstName lastName }
    }
  }
`;