import { Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";

function JoinHouseholdGroup() {
  const [inviteCode, setInviteCode] = useState("");
  const [joinedGroup, setJoinedGroup] = useState({
    id: 0,
    title: "",
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  function getCsrfToken() {
    const csrfCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("csrftoken="));

    return csrfCookie
      ? decodeURIComponent(csrfCookie.trim().split("=")[1])
      : "";
  }

  return (
    <form
      onSubmit={
        async (event) => {
          event.preventDefault();

          setErrorMessage("");

          const joinData = {
            invite_code: inviteCode,
          };

          const jsonJoinData = JSON.stringify(joinData);

          try {
            const response = await fetch(
              "https://nci-project-backend.onrender.com/api/v1/householdgroups/join/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-csrftoken": getCsrfToken(),
                },
                credentials: "include",
                body: jsonJoinData,
              },
            );

            const responseData = await response.json();

            if (response.ok) {
              setJoinedGroup({
                id: responseData.id,
                title: responseData.title,
                description: responseData.description ?? "",
              });
              setInviteCode("");
            } else {
              setErrorMessage(JSON.stringify(responseData));
            }
          } catch (error) {
            setErrorMessage("Can not connect to the server.");
          }
        } /* arrow function */
      } /* onSubmit */
    >
      {" "}
      {/* form */}
      <VStack>
        <Heading>Join Household Group</Heading>
        <Input
          placeholder="Invitation code"
          value={inviteCode}
          onChange={(event) => {
            const enteredCode = event.target.value;
            setInviteCode(enteredCode);
          }}
        />
        <Button type="submit">Join Group</Button>
        <Text>{errorMessage}</Text>
        {joinedGroup.id !== 0 && (
          <VStack>
            <Text> You have succesfully joined the group</Text>
            <Text> Group Id : {joinedGroup.id}</Text>
            <Text> Group Title : {joinedGroup.title}</Text>
            <Text>
              {" "}
              Group Description : {joinedGroup.description || "No description"}
            </Text>
          </VStack>
        )}
      </VStack>
    </form>
  );
}

export default JoinHouseholdGroup;
