import jwtDecode from "jwt-decode";

const login = () => {
    // App landing page redirects to Auth0.
    const client_id = Cypress.env("auth0_client_id");
    const client_secret = Cypress.env("auth0_client_secret");
    const audience = Cypress.env("auth0_audience");
    const scope = Cypress.env("auth0_scope");
    const username = Cypress.env("auth0_username");
    const password = Cypress.env("auth0_password");
  
    cy.request({
      method: "POST",
      url: `https://${Cypress.env("auth0_domain")}/oauth/token`,
      body: {
        grant_type: "password",
        username,
        password,
        audience,
        scope,
        client_id,
        client_secret,
      },
    }).then(({ body }) => {
      const claims: any = jwtDecode(body.id_token);
      const {
        nickname,
        name,
        picture,
        updated_at,
        email,
        email_verified,
        sub,
        exp,
      } = claims;
  
      const item = {
        body: {
          ...body,
          decodedToken: {
            claims,
            user: {
              nickname,
              name,
              picture,
              updated_at,
              email,
              email_verified,
              sub,
            },
            audience,
            client_id,
          },
        },
        expiresAt: exp,
      };
  
      window.localStorage.setItem("auth0Cypress", JSON.stringify(item));
  
      cy.visit("/");
    });
  }

  export default login;