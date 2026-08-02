import {
  Button,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

function getCsrfToken() {
  const cookies = document.cookie.split(";");

  const csrfCookie = cookies.find((cookie) => {
    return cookie.trim().startsWith("csrftoken=");
  });

  if (!csrfCookie) {
    return "";
  }

  return decodeURIComponent(csrfCookie.split("=")[1]);
}

function ChoreCards() {
  const [title, setTitle] = useState("");
  const [householdGroupId, setHouseholdGroupId] = useState("");
  const [checklist, setChecklist] = useState("");
  const [difficultyWeight, setDifficultyWeight] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeIds, setAssigneeIds] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [commentPayload, setCommentPayload] = useState("");

  const [selectedChoreCardId, setSelectedChoreCardId] = useState(0);

  const [comments, setComments] = useState([
    {
      id: 0,
      writer: 0,
      chore: 0,
      payload: "",
      created_at: "",
      updated_at: "",
    },
  ]);

  const [choreCards, setChoreCards] = useState([
    {
      id: 0,
      title: "",
      householdgroup: 0,
      checklist: "",
      difficulty_weight: 0,
      status: "",
      due_date: "",
      completed_at: "",
      assignee: [0],
    },
  ]);

  const [errorMessage, setErrorMessage] = useState("");

  async function showChoreCards() {
    setChoreCards([]);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/v1/chorecards/", {
        method: "GET",
        credentials: "include",
      });

      const responseData = await response.json();

      if (response.ok) {
        setChoreCards(responseData);
      } else {
        setErrorMessage(JSON.stringify(responseData));
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Can not connect to the server.");
    }
  }

  async function completeChoreCard(choreCardId: number) {
    setErrorMessage("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/chorecards/${choreCardId}/complete/`,
        {
          method: "PATCH",
          headers: {
            "X-CSRFToken": getCsrfToken(),
          },
          credentials: "include",
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        const updatedChoreCards = choreCards.map((choreCard) => {
          if (choreCard.id === responseData.id) {
            return responseData;
          }

          return choreCard;
        });

        setChoreCards(updatedChoreCards);
      } else {
        setErrorMessage(JSON.stringify(responseData));
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Can not connect to the server.");
    }
  }

  async function showComments(choreCardId: number) {
    setComments([]);
    setSelectedChoreCardId(choreCardId);
    setErrorMessage("");
    setCommentPayload("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/comments/${choreCardId}/`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        setComments(responseData);
      } else {
        setErrorMessage(JSON.stringify(responseData));
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Can not connect to the server.");
    }
  }

  async function createComment(choreCardId: number) {
    setErrorMessage("");

    if (commentPayload.trim() === "") {
      setErrorMessage("Please write a comment.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/comments/${choreCardId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify({
            payload: commentPayload,
          }),
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        setComments([...comments, responseData]);
        setCommentPayload("");
      } else {
        setErrorMessage(JSON.stringify(responseData));
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Can not connect to the server.");
    }
  }

  async function createChoreCard() {
    setErrorMessage("");
    setCreateMessage("");

    if (
      title.trim() === "" ||
      householdGroupId.trim() === "" ||
      checklist.trim() === "" ||
      difficultyWeight.trim() === "" ||
      assigneeIds.trim() === ""
    ) {
      setErrorMessage(
        "Please enter the title, group ID, checklist, difficulty, and assignee IDs.",
      );
      return;
    }

    const householdGroupIdNumber = Number(householdGroupId);
    const difficultyWeightNumber = Number(difficultyWeight);

    if (
      !Number.isInteger(householdGroupIdNumber) ||
      householdGroupIdNumber <= 0
    ) {
      setErrorMessage("The group ID must be a positive integer.");
      return;
    }

    if (
      !Number.isInteger(difficultyWeightNumber) ||
      difficultyWeightNumber < 1 ||
      difficultyWeightNumber > 10
    ) {
      setErrorMessage("The difficulty must be an integer from 1 to 10.");
      return;
    }

    const assigneeIdArray = assigneeIds.split(",").map((assigneeId) => {
      return Number(assigneeId.trim());
    });

    const hasInvalidAssigneeId = assigneeIdArray.some((assigneeId) => {
      return !Number.isInteger(assigneeId) || assigneeId <= 0;
    });

    if (hasInvalidAssigneeId) {
      setErrorMessage(
        "Enter Member IDs as positive integers separated by commas.",
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/v1/chorecards/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          householdgroup: householdGroupIdNumber,
          checklist: checklist.trim(),
          difficulty_weight: difficultyWeightNumber,
          due_date: dueDate === "" ? null : dueDate,
          assignee: assigneeIdArray,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setChoreCards([...choreCards, responseData]);

        setCreateMessage(
          `${responseData.title} has been created successfully.`,
        );

        setTitle("");
        setHouseholdGroupId("");
        setChecklist("");
        setDifficultyWeight("");
        setDueDate("");
        setAssigneeIds("");
      } else {
        setErrorMessage(JSON.stringify(responseData));
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Can not connect to the server.");
    }
  }

  return (
    <VStack>
      <Heading>Chore Cards</Heading>

      <VStack alignItems={"stretch"} borderWidth={2} padding={4} width={"100%"}>
        <Heading size={"md"}>Create Chore Card</Heading>

        <Input
          placeholder="Chore title"
          maxLength={40}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />

        <Input
          type="number"
          min={1}
          step={1}
          placeholder="Household group ID"
          value={householdGroupId}
          onChange={(event) => {
            setHouseholdGroupId(event.target.value);
          }}
        />

        <Textarea
          placeholder="Checklist"
          value={checklist}
          onChange={(event) => {
            setChecklist(event.target.value);
          }}
        />

        <Input
          type="number"
          min={1}
          max={10}
          step={1}
          placeholder="Difficulty: 1 to 10"
          value={difficultyWeight}
          onChange={(event) => {
            setDifficultyWeight(event.target.value);
          }}
        />

        <Input
          type="date"
          value={dueDate}
          onChange={(event) => {
            setDueDate(event.target.value);
          }}
        />

        <Input
          placeholder="Assignee Member IDs: 2, 3"
          value={assigneeIds}
          onChange={(event) => {
            setAssigneeIds(event.target.value);
          }}
        />

        <Button onClick={createChoreCard}>Create Chore Card</Button>

        <Text color={"green.500"}>{createMessage}</Text>
      </VStack>

      <Button onClick={showChoreCards}>Show Chore Cards</Button>

      <Text>{errorMessage}</Text>

      {choreCards.map(
        (choreCard) =>
          choreCard.id !== 0 && (
            <VStack
              key={choreCard.id}
              alignItems={"flex-start"}
              borderWidth={2}
              padding={4}
            >
              <Text>Chore card ID: {choreCard.id}</Text>
              <Text>Title: {choreCard.title}</Text>
              <Text>Group ID: {choreCard.householdgroup}</Text>
              <Text>Checklist: {choreCard.checklist}</Text>
              <Text>Difficulty: {choreCard.difficulty_weight}</Text>
              <Text>Status: {choreCard.status}</Text>
              <Text>Due date: {choreCard.due_date || "No due date"}</Text>
              <Text>
                Completed at: {choreCard.completed_at || "Not completed"}
              </Text>
              <Text>Assignee Member IDs: {choreCard.assignee.join(", ")}</Text>

              <Button
                disabled={choreCard.status === "completed"}
                onClick={() => {
                  completeChoreCard(choreCard.id);
                }}
              >
                {choreCard.status === "completed"
                  ? "Completed"
                  : "Complete Chore"}
              </Button>

              <Button
                onClick={() => {
                  showComments(choreCard.id);
                }}
              >
                Show Comments
              </Button>

              {selectedChoreCardId === choreCard.id && (
                <VStack alignItems={"stretch"} borderWidth={"1px"} padding={4}>
                  <Text fontWeight={"bold"}>Comments</Text>

                  {comments.length === 0 && <Text>No comments yet.</Text>}

                  {comments.map(
                    (comment) =>
                      comment.id !== 0 && (
                        <VStack
                          key={comment.id}
                          alignItems={"stretch"}
                          borderWidth={"1px"}
                          padding={3}
                        >
                          <Text>Writer Member ID: {comment.writer}</Text>
                          <Text>{comment.payload}</Text>
                          <Text>Created at: {comment.created_at}</Text>
                        </VStack>
                      ),
                  )}
                  <Textarea
                    placeholder="Write a comment"
                    value={commentPayload}
                    onChange={(event) => {
                      setCommentPayload(event.target.value);
                    }}
                  />

                  <Button
                    onClick={() => {
                      createComment(choreCard.id);
                    }}
                  >
                    Add Comment
                  </Button>
                </VStack>
              )}
            </VStack>
          ),
      )}
    </VStack>
  );
}

export default ChoreCards;
