import React, { useEffect } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  // Define any props you might need for the Login component
}

interface DecodedToken {
  name?: string;
  email?: string;
  picture?: string;
}

const Login: React.FC<LoginProps> = () => {
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    console.log(credentialResponse);

    if (credentialResponse.credential) {
      const decoded: DecodedToken = jwtDecode(credentialResponse.credential);
      console.log(decoded);

      if (decoded.email) {
        localStorage.setItem("email", decoded.email);
        navigate("/chat");
      }
    } else {
      console.error("No credential found in the response");
    }
  };

  const handleError = () => {
    console.log("Login Failed");
  };

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      navigate("/chat");
    }
  }, [navigate]);

  return (
    <div style={styles.container}>
      <img src="/logo.jpg" alt="Logo" style={{ width: "300px" }} />
      <h3>Login With Google</h3>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    flexDirection: "column",
  } as React.CSSProperties,
};

export default Login;
