import { Button, Heading, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";

function HouseholdGroupMembers() {
  const [groupId, setGroupId] = useState("");
  const [members, setMembers] = useState([
    {
      id: 0,
      username: "",
      householdgroup: 0,
      role: "",
      contribution: 0,
      penalty: 0,
    },
  ]);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        setErrorMessage("");
        setMembers([]);

        try {
          const response = await fetch(
            `https://nci-project-backend.onrender.com/api/v1/members/${groupId}/`,
            {
              method: "GET",
              credentials: "include",
            },
          );

          const responseData = await response.json();

          if (response.ok) {
            setMembers(responseData);
          } else {
            setErrorMessage(JSON.stringify(responseData));
          }
        } catch (error) {
          setErrorMessage("Can not connect to the server.");
        }
      }}
    >
      <VStack>
        <Heading>Household Group Members</Heading>
        <Input
          type="number"
          placeholder="Enter Group ID"
          value={groupId}
          onChange={(event) => {
            const enteredGroupId = event.target.value;
            setGroupId(enteredGroupId);
          }}
        />
        <Button type="submit">Show Members</Button>
        <Text>{errorMessage}</Text>
        {members.map(
          (member) =>
            member.id !== 0 && (
              <VStack
                key={member.id}
                alignItems={"flex-start"}
                borderWidth={"1px"}
                padding={4}
              >
                <Text>Household Group ID: {member.householdgroup}</Text>
                <Text>Member ID: {member.id}</Text>
                <Text>Username: {member.username}</Text>
                <Text>Role: {member.role}</Text>
                <Text>Contribution: {member.contribution}</Text>
                <Text>Penalty: {member.penalty}</Text>
              </VStack>
            ),
        )}
      </VStack>
    </form>
  );
}

export default HouseholdGroupMembers;
