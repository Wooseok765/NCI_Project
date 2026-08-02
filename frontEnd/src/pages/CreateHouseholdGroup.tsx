import {
  Button,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

function CreateHouseholdGroup() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  function getCsrfToken() {
    /* 브라우저에 저장된 쿠키들 중 특정 쿠키에서 특정 이름의 토큰을 받아오는것 */
    const csrfCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("csrftoken="));
    /* 브라우저가 가지고있는 쿠키들 중 document.cookie로 접근가능한 값을 반환 */
    /* ; 를 기준으로 잘라서만든 배열 형태로 반환한다 */
    /* find()기능으로 csrftoken= 로 시작되는 값을 가져온다 */

    return csrfCookie
      ? decodeURIComponent(csrfCookie.trim().split("=")[1])
      : "";
    /* 만약 csrftoken= 로 시작되는 값이 있다면, 그 값을 decodeURIComponent로 디코딩하고, = 기준으로 잘라서 두번째 값(토큰값)을 반환 */
    /* 만약 csrftoken= 로 시작되는 값이 없다면, 공백 를 반환 */
    /* 이 공백이 백엔드에서 오류를 유발(정상적으로 쿠키를 읽을 수 있는 홈페이지에서 시도된 접근이 아니라는 뜻) */
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        setMessage("");

        const groupData = {
          title: title,
          description: description,
        };

        try {
          const response = await fetch(
            "https://nci-project-backend.onrender.com/api/v1/householdgroups/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-csrftoken": getCsrfToken(),
              },
              credentials: "include",
              body: JSON.stringify(groupData),
            },
          );

          const responseData = await response.json();

          if (response.ok) {
            setMessage(`${responseData.title} has been created successfully.`);

            setTitle("");
            setDescription("");
          } else {
            setMessage(JSON.stringify(responseData));
          }
        } catch (error) {
          setMessage("Can not connect to the server.");
        }
      }}
    >
      {/* form */}
      <VStack>
        <Heading>Create Household Group</Heading>
        <Input
          placeholder="Household Group Title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
        <Textarea
          placeholder="Household Group description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
        />
        <Button type="submit">Create Household Group</Button>
        <Text>{message}</Text>
      </VStack>
    </form>
  ); /* return */
} /* function */

export default CreateHouseholdGroup;
