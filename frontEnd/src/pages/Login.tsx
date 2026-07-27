import { Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  /* username == ID that the user enters */
  /* password == Password that the user enters */

  const [message, setMessage] = useState("");

  return (
    <form
      onSubmit={
        async (event) => {
          event.preventDefault();
          /* Prevent refreshing page when this form submiting*/

          setMessage("");
          /* Reset the previous message */

          const loginData = {
            username: username,
            password: password,
          };
          /* Create JavaScript object to send to the backend */

          const jsonLoginData = JSON.stringify(loginData);
          /* Convert the JavaScript object to a JSON string for sending the data to the backend */

          try {
            const response = await fetch(
              "http://localhost:8000/api/v1/users/login/",
              {
                method: "POST",
                /* Select the HTTP method type */
                headers: {
                  "Content-Type": "application/json",
                  /* Let Django know that we are sending JSON data */
                },
                credentials: "include",
                /* To get cookies from the backend and send them back when making subsequent requests */
                /* 지금 접근을 시도하는 url에 해당하는 쿠키가 있다면 포함해서 보내라는 뜻, 시도하는 주체를 판단하지 않기 때문에 해킹당해도 검증없이 쿠키를 포함시켜서 백엔드로 보냄 현재는 로그인시도기 때문에 추가 검증에 필요한 기존토큰(쿠키에서 꺼내온)이 없어서 그냥 진행함 */

                body: jsonLoginData,
                /* Send the JSON string as the request body */
              },
            );
            /* This will send HTTP request to the backend and await the response(HTTP response) */

            const responseData = await response.json();
            /* Convert the response(JSON) to JavaScript object to read the fields inside */

            if (responseData.system) {
              setMessage(responseData.system);
              /* 현재 백엔드에서 로그인 성공,실패시 system이라는 필드에 메세지를 저장한다. 그 결과를 보여주는것(백엔드 서버에 접속은 성공했다는 의미)   */
            } else {
              setMessage(
                "The server returned an unexpected response. Please try again later.",
              ); /* 백엔드와 응답을 주고받는데 성공했지만 system이라는 필드가 없는상태라는 의미 */
            }
          } catch (error) {
            setMessage("Can not connect to the server.");
          }
        } /* arrow function */
      } /* onSubmit */
    >
      <VStack gap={4} padding={10} alignItems={"stretch"}>
        <Heading>Login</Heading>
        <Input
          placeholder={"Username"}
          value={username}
          onChange={(event) => {
            const enteredUsername = event.target.value;
            setUsername(enteredUsername);
          }}
        />
        {/* Get the username from the input field */}
        {/* If any change detective on the input field that will be reflected in the state(username will be updated) */}

        <Input
          type="password"
          placeholder={"Password"}
          value={password}
          onChange={(event) => {
            const enteredPassword = event.target.value;
            setPassword(enteredPassword);
          }}
        />

        <Button type="submit">Login</Button>
        <Text>{message}</Text>
      </VStack>
    </form>
  );
}

export default Login;
