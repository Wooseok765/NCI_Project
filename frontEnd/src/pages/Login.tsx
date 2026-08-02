import { Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";

function Login({
  loadLoggedInUser,
}: {
  /*
   * App.tsx에서 전달받은 함수입니다.
   *
   * 로그인 성공 후 이 함수를 실행하면
   * App.tsx가 /users/me/를 요청하여
   * Header에 표시할 사용자 정보를 저장합니다.
   */
  loadLoggedInUser: () => Promise<boolean>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  /* username == ID that the user enters */
  /* password == Password that the user enters */

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function getCsrfToken() {
    const csrfCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("csrftoken="));

    return csrfCookie
      ? decodeURIComponent(csrfCookie.trim().split("=")[1])
      : "";
  }

  async function loginUser(event: SubmitEvent) {
    /* event: SubmitEvent<HtmlFormElement>: 매개변수로 들어오는 event라는 변수는 Submit 이벤트 객체가 들어온다는 선언 */
    /* 함수가 어떤 곳에서 실행될 지 알 수 없어서 매개변수의 타입을 사전에 선언하는것(Typescript의 특징으로 변수의 타입을 지정 할 수 있음)*/
    /* Submit 타입이면서 html의 form element가 들어온다는 선언(Submit 전용기능 사용 안할꺼면 생략가능) */
    event.preventDefault();

    setMessage("");

    try {
      /*
       * 브라우저에서 Django 로그인 API로
       * username과 password를 전송합니다.
       */
      const response = await fetch("/api/v1/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrftoken": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      /*
       * 백엔드 응답 JSON을 JavaScript 객체로 변환합니다.
       */
      const responseData = await response.json();

      if (!response.ok) {
        /*
         * 로그인 실패 메시지를 화면에 표시합니다.
         */
        setMessage(
          responseData.system ||
            responseData.error ||
            JSON.stringify(responseData),
        );

        return;
      }

      /*
       * 로그인 성공 시 Django가 sessionid 쿠키를 발급합니다.
       *
       * 이제 App.tsx의 loadLoggedInUser()를 실행하여
       * 그 sessionid로 /users/me/를 요청합니다.
       */
      const userInformationLoaded = await loadLoggedInUser();

      if (!userInformationLoaded) {
        setMessage(
          "Login succeeded, but the user information could not be loaded.",
        );

        return;
      }

      /*
       * 로그인과 사용자 정보 가져오기가 모두 성공하면
       * 입력창을 비웁니다.
       */
      setUsername("");
      setPassword("");

      /*
       * Home 화면으로 이동합니다.
       *
       * App.tsx의 loggedInUser State가 이미 변경되었으므로
       * Header는 새로고침 없이 Logout 버튼과 사용자 정보를 표시합니다.
       */
      navigate("/");
    } catch (error) {
      console.log(error);
      setMessage("Can not connect to the server.");
    }
  }

  return (
    <form onSubmit={loginUser}>
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
