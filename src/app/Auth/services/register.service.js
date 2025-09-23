
export const POST_REGISTER = `
  mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
    signUp(data: {
      email: $email,
      password: $password,
      firstName: $firstName,
      lastName: $lastName
    }) {
      success
      message
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;