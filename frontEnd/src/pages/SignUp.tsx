import { Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState, type SubmitEvent } from "react";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function signUpUser(event: SubmitEvent) {
    event.preventDefault();
    /* form 제출 시 브라우저 새로고침 방지 */

    setSuccessMessage("");
    setErrorMessage("");
    /* 이전 회원가입 결과 메시지 제거 */

    const signUpData = {
      username: username,
      email: email,
      password: password,
    };
    /* Django가 요구하는 세 가지 값을 객체로 묶음 */

    const jsonSignUpData = JSON.stringify(signUpData);
    /* JavaScript 객체를 JSON 문자열로 변환(fetch 할 때 body에 포함시키기 위해서) */

    try {
      const response = await fetch("/api/v1/users/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonSignUpData,
      });

      const responseData = await response.json();
      /* Django가 보낸 JSON 응답을 JavaScript 객체로 변환(JavaScript 문법으로 풀어서 사용하기 위해) */

      if (response.ok) {
        setSuccessMessage(
          `${responseData.username} account has been created successfully.`,
        );

        setUsername("");
        setEmail("");
        setPassword("");
        /* 회원가입 성공 후 입력창 초기화 */

        return;
      }

      setErrorMessage(JSON.stringify(responseData));
      /* Django가 반환한 회원가입 오류 표시 */
    } catch (error) {
      console.log(error);
      setErrorMessage("Can not connect to the server.");
    }
  }

  return (
    <form onSubmit={signUpUser}>
      <VStack gap={4} padding={10} alignItems={"stretch"}>
        <Heading>Sign Up</Heading>

        <Input
          placeholder={"Username"}
          value={username}
          onChange={(event) => {
            const enteredUsername = event.target.value;

            setUsername(enteredUsername);
          }}
        />

        <Input
          type="email"
          placeholder={"Email"}
          value={email}
          onChange={(event) => {
            const enteredEmail = event.target.value;

            setEmail(enteredEmail);
          }}
        />

        <Input
          type="password"
          placeholder={"Password"}
          value={password}
          onChange={(event) => {
            const enteredPassword = event.target.value;

            setPassword(enteredPassword);
          }}
        />

        <Button type="submit">Create Account</Button>

        <Text color={"green.500"}>{successMessage}</Text>

        <Text color={"red.500"}>{errorMessage}</Text>
      </VStack>
    </form>
  );
}

export default SignUp;
