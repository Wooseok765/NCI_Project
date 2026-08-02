import {
  Button,
  Checkbox,
  Heading,
  Input,
  NativeSelect,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

type Member = {
  id: number;
  username: string;
  householdgroup: number;
  role: string;
  contribution: number;
  penalty: number;
};

function CreateChoreCard() {
  const [searchParams] = useSearchParams();

  const selectedHouseholdGroupId = searchParams.get("householdgroup") || "";

  const [title, setTitle] = useState("");

  const [householdGroupId, setHouseholdGroupId] = useState(
    selectedHouseholdGroupId,
  );

  const [checklist, setChecklist] = useState("");
  const [difficultyWeight, setDifficultyWeight] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberMessage, setMemberMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMembers() {
      if (householdGroupId === "") {
        setMembers([]);
        setAssigneeIds([]);
        return;
      }

      setIsLoadingMembers(true);
      setMemberMessage("");
      setMembers([]);
      setAssigneeIds([]);

      try {
        const response = await fetch(`/api/v1/members/${householdGroupId}/`, {
          method: "GET",
          credentials: "include",
        });

        const responseData = await response.json();

        if (response.ok) {
          setMembers(responseData);
        } else {
          setMemberMessage(JSON.stringify(responseData));
        }
      } catch (error) {
        console.log(error);
        setMemberMessage("Can not load the household group members.");
      } finally {
        setIsLoadingMembers(false);
      }
    }

    loadMembers();
  }, [householdGroupId]);

  function getCsrfToken() {
    const csrfCookie = document.cookie.split(";").find((cookie) => {
      return cookie.trim().startsWith("csrftoken=");
    });

    if (csrfCookie) {
      return decodeURIComponent(csrfCookie.trim().split("=")[1]);
    }

    return "";
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setMessage("");

        if (difficultyWeight === "") {
          setMessage("Please select a difficulty.");
          return;
        }

        if (assigneeIds.length === 0) {
          setMessage("Please select at least one assignee.");
          return;
        }

        const choreCardData = {
          title: title,
          householdgroup: Number(householdGroupId),
          checklist: checklist,
          difficulty_weight: Number(difficultyWeight),
          due_date: dueDate || null,
          assignee: assigneeIds,
        };

        try {
          const response = await fetch("/api/v1/chorecards/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCsrfToken(),
            },
            credentials: "include",
            body: JSON.stringify(choreCardData),
          });

          const responseData = await response.json();

          if (response.ok) {
            setMessage(`${responseData.title} has been created successfully.`);

            setTitle("");
            setChecklist("");
            setDifficultyWeight("");
            setDueDate("");
            setAssigneeIds([]);
          } else {
            setMessage(JSON.stringify(responseData));
          }
        } catch (error) {
          console.log(error);
          setMessage("Can not connect to the server.");
        }
      }}
    >
      <VStack>
        <Heading>Create Chore Card</Heading>

        <Input
          type={"number"}
          placeholder={"Household group ID"}
          value={householdGroupId}
          readOnly={selectedHouseholdGroupId !== ""}
          onChange={(event) => {
            setHouseholdGroupId(event.target.value);
          }}
        />

        <Input
          placeholder={"Chore title"}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />

        <Textarea
          placeholder={"Checklist"}
          value={checklist}
          onChange={(event) => {
            setChecklist(event.target.value);
          }}
        />

        <NativeSelect.Root>
          <NativeSelect.Field
            value={difficultyWeight}
            onChange={(event) => {
              setDifficultyWeight(event.target.value);
            }}
          >
            <option value={""}>Select difficulty</option>
            <option value={"1"}>1</option>
            <option value={"2"}>2</option>
            <option value={"3"}>3</option>
            <option value={"4"}>4</option>
            <option value={"5"}>5</option>
            <option value={"6"}>6</option>
            <option value={"7"}>7</option>
            <option value={"8"}>8</option>
            <option value={"9"}>9</option>
            <option value={"10"}>10</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        <Input
          type={"date"}
          value={dueDate}
          onChange={(event) => {
            setDueDate(event.target.value);
          }}
        />

        <VStack alignItems={"stretch"} gap={2}>
          <Text fontWeight={"bold"}>Select assignees</Text>

          {isLoadingMembers && <Text>Loading members...</Text>}

          {!isLoadingMembers && members.length === 0 && (
            <Text>No members are available.</Text>
          )}

          {members.map((member) => (
            <Checkbox.Root
              key={member.id}
              checked={assigneeIds.includes(member.id)}
              onCheckedChange={(details) => {
                if (details.checked === true) {
                  setAssigneeIds((currentAssigneeIds) => {
                    return [...currentAssigneeIds, member.id];
                  });
                } else {
                  setAssigneeIds((currentAssigneeIds) => {
                    return currentAssigneeIds.filter((assigneeId) => {
                      return assigneeId !== member.id;
                    });
                  });
                }
              }}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>
                User ID: {member.username} ({member.role})
              </Checkbox.Label>
            </Checkbox.Root>
          ))}

          <Text color={"red.500"}>{memberMessage}</Text>
        </VStack>

        <Button type={"submit"}>Create Chore Card</Button>

        <Text>{message}</Text>
      </VStack>
    </form>
  );
}

export default CreateChoreCard;
