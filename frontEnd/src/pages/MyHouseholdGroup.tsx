import {
  Button,
  Dialog,
  Grid,
  Heading,
  HStack,
  Input,
  Portal,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState, type SubmitEvent } from "react";
import { Link } from "react-router";

type HouseholdGroup = {
  id: number;
  title: string;
  description: string | null;
  invite_code: string;
  owner_username: string | null;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
};

type ChoreCardSummary = {
  id: number;
  title: string;
  assignee_usernames: string[];
  due_date: string | null;
  difficulty_weight: number;
};

type ChoreCardDetail = {
  id: number;
  title: string;
  householdgroup: number;
  checklist: string;
  difficulty_weight: number;
  status: string;
  assignee: number[];
  assignee_usernames: string[];
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type CommentData = {
  id: number;
  writer: number;
  writer_username: string;
  chore: number;
  payload: string;
  created_at: string;
  updated_at: string;
};

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

function MyHouseholdGroups() {
  const [householdGroups, setHouseholdGroups] = useState<HouseholdGroup[]>([]);

  const [selectedHouseholdGroup, setSelectedHouseholdGroup] =
    useState<HouseholdGroup | null>(null);

  const [choreCards, setChoreCards] = useState<ChoreCardSummary[]>([]);

  const [selectedChoreCard, setSelectedChoreCard] =
    useState<ChoreCardDetail | null>(null);

  const [comments, setComments] = useState<CommentData[]>([]);

  const [commentPayload, setCommentPayload] = useState("");

  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  const [isLoadingChoreCards, setIsLoadingChoreCards] = useState(false);

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [isPostingComment, setIsPostingComment] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [detailErrorMessage, setDetailErrorMessage] = useState("");

  const [isSavingChoreCard, setIsSavingChoreCard] = useState(false);

  const [isDeletingChoreCard, setIsDeletingChoreCard] = useState(false);

  const [isEditingChoreCard, setIsEditingChoreCard] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editChecklist, setEditChecklist] = useState("");

  const [editDifficultyWeight, setEditDifficultyWeight] = useState("");

  const [editDueDate, setEditDueDate] = useState("");
  const [editAssigneeIds, setEditAssigneeIds] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadHouseholdGroups() {
      setErrorMessage("");

      try {
        const response = await fetch("/api/v1/householdgroups/", {
          method: "GET",
          credentials: "include",
        });

        const responseData = await response.json();

        if (response.ok) {
          setHouseholdGroups(responseData);
        } else {
          setHouseholdGroups([]);
          setErrorMessage(JSON.stringify(responseData));
        }
      } catch (error) {
        console.log(error);

        setHouseholdGroups([]);

        setErrorMessage("Can not connect to the server.");
      } finally {
        setIsLoadingGroups(false);
      }
    }

    loadHouseholdGroups();
  }, []);

  async function loadChoreCards(householdGroup: HouseholdGroup) {
    setSelectedHouseholdGroup(householdGroup);
    setChoreCards([]);
    setErrorMessage("");
    setIsLoadingChoreCards(true);
    setSuccessMessage("");
    closeChoreCardDetail();

    try {
      const response = await fetch(
        `/api/v1/chorecards/?householdgroup=${householdGroup.id}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        setChoreCards(responseData);
      } else {
        setErrorMessage(JSON.stringify(responseData));
      }
    } catch (error) {
      console.log(error);

      setErrorMessage("Can not connect to the server.");
    } finally {
      setIsLoadingChoreCards(false);
    }
  }

  async function openChoreCardDetail(choreCardId: number) {
    setIsDetailOpen(true);
    setIsLoadingDetail(true);
    setSelectedChoreCard(null);
    setComments([]);
    setCommentPayload("");
    setDetailErrorMessage("");
    setIsEditingChoreCard(false);

    try {
      const choreCardResponse = await fetch(
        `/api/v1/chorecards/${choreCardId}/`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const choreCardData = await choreCardResponse.json();

      if (!choreCardResponse.ok) {
        setDetailErrorMessage(JSON.stringify(choreCardData));

        return;
      }

      setSelectedChoreCard(choreCardData);

      const commentsResponse = await fetch(`/api/v1/comments/${choreCardId}/`, {
        method: "GET",
        credentials: "include",
      });

      const commentsData = await commentsResponse.json();

      if (commentsResponse.ok) {
        setComments(commentsData);
      } else {
        setDetailErrorMessage(JSON.stringify(commentsData));
      }
    } catch (error) {
      console.log(error);

      setDetailErrorMessage("Can not connect to the server.");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  function closeChoreCardDetail() {
    setIsDetailOpen(false);
    setSelectedChoreCard(null);
    setComments([]);
    setCommentPayload("");
    setDetailErrorMessage("");
    setIsEditingChoreCard(false);
    setEditTitle("");
    setEditChecklist("");
    setEditDifficultyWeight("");
    setEditDueDate("");
    setEditAssigneeIds("");
  }

  function startEditingChoreCard() {
    if (selectedChoreCard === null) {
      return;
    }

    setEditTitle(selectedChoreCard.title);
    setEditChecklist(selectedChoreCard.checklist);

    setEditDifficultyWeight(String(selectedChoreCard.difficulty_weight));

    setEditDueDate(selectedChoreCard.due_date || "");

    setEditAssigneeIds(selectedChoreCard.assignee.join(", "));

    setDetailErrorMessage("");
    setIsEditingChoreCard(true);
  }

  function cancelEditingChoreCard() {
    setIsEditingChoreCard(false);
    setDetailErrorMessage("");
  }

  async function updateChoreCard() {
    if (selectedChoreCard === null) {
      return;
    }

    if (
      editTitle.trim() === "" ||
      editChecklist.trim() === "" ||
      editDifficultyWeight.trim() === "" ||
      editAssigneeIds.trim() === ""
    ) {
      setDetailErrorMessage(
        "Please enter the title, checklist, difficulty, and assignee IDs.",
      );

      return;
    }

    const difficultyWeightNumber = Number(editDifficultyWeight);

    if (
      !Number.isInteger(difficultyWeightNumber) ||
      difficultyWeightNumber < 1 ||
      difficultyWeightNumber > 10
    ) {
      setDetailErrorMessage("The difficulty must be an integer from 1 to 10.");

      return;
    }

    const assigneeIdArray = editAssigneeIds.split(",").map((assigneeId) => {
      return Number(assigneeId.trim());
    });

    const hasInvalidAssigneeId = assigneeIdArray.some((assigneeId) => {
      return !Number.isInteger(assigneeId) || assigneeId <= 0;
    });

    if (hasInvalidAssigneeId) {
      setDetailErrorMessage(
        "Enter assignee Member IDs as positive integers separated by commas.",
      );

      return;
    }

    setIsSavingChoreCard(true);
    setDetailErrorMessage("");

    try {
      const response = await fetch(
        `/api/v1/chorecards/${selectedChoreCard.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify({
            title: editTitle.trim(),
            checklist: editChecklist.trim(),
            difficulty_weight: difficultyWeightNumber,
            due_date: editDueDate || null,
            assignee: assigneeIdArray,
          }),
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        setSelectedChoreCard(responseData);

        setChoreCards((currentChoreCards) => {
          return currentChoreCards.map((choreCard) => {
            if (choreCard.id === responseData.id) {
              return {
                ...choreCard,
                title: responseData.title,
                assignee_usernames: responseData.assignee_usernames,
                due_date: responseData.due_date,
                difficulty_weight: responseData.difficulty_weight,
              };
            }

            return choreCard;
          });
        });

        setIsEditingChoreCard(false);
      } else {
        setDetailErrorMessage(JSON.stringify(responseData));
      }
    } catch (error) {
      console.log(error);

      setDetailErrorMessage("Can not connect to the server.");
    } finally {
      setIsSavingChoreCard(false);
    }
  }

  async function deleteChoreCard() {
    if (selectedChoreCard === null) {
      return;
    }

    const shouldDelete = window.confirm(`Delete "${selectedChoreCard.title}"?`);

    if (!shouldDelete) {
      return;
    }

    setIsDeletingChoreCard(true);
    setDetailErrorMessage("");

    try {
      const response = await fetch(
        `/api/v1/chorecards/${selectedChoreCard.id}/`,
        {
          method: "DELETE",
          headers: {
            "X-CSRFToken": getCsrfToken(),
          },
          credentials: "include",
        },
      );

      if (response.ok) {
        const deletedChoreCardTitle = selectedChoreCard.title;

        setChoreCards((currentChoreCards) => {
          return currentChoreCards.filter((choreCard) => {
            return choreCard.id !== selectedChoreCard.id;
          });
        });

        closeChoreCardDetail();

        setSuccessMessage(
          `${deletedChoreCardTitle} has been deleted successfully.`,
        );
      } else {
        const responseData = await response.json();

        setDetailErrorMessage(JSON.stringify(responseData));
      }
    } catch (error) {
      console.log(error);

      setDetailErrorMessage("Can not connect to the server.");
    } finally {
      setIsDeletingChoreCard(false);
    }
  }

  async function createComment(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedChoreCard === null) {
      return;
    }

    if (commentPayload.trim() === "") {
      setDetailErrorMessage("Please enter a comment.");

      return;
    }

    setIsPostingComment(true);
    setDetailErrorMessage("");

    try {
      const response = await fetch(
        `/api/v1/comments/${selectedChoreCard.id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify({
            payload: commentPayload.trim(),
          }),
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        setComments([...comments, responseData]);

        setCommentPayload("");
      } else {
        setDetailErrorMessage(JSON.stringify(responseData));
      }
    } catch (error) {
      console.log(error);

      setDetailErrorMessage("Can not connect to the server.");
    } finally {
      setIsPostingComment(false);
    }
  }

  return (
    <VStack alignItems={"stretch"} gap={8} padding={8}>
      <Heading textAlign={"center"}>My Household Groups</Heading>

      {/* 그룹 목록을 백엔드에서 가져오는 중일 때 표시 */}
      {isLoadingGroups && (
        <Text textAlign={"center"}>Loading household groups...</Text>
      )}

      {/*
       * 그룹 목록 요청이 끝났고,
       * 사용자가 가입한 그룹이 0개일 때만 표시
       */}
      {!isLoadingGroups && householdGroups.length === 0 && (
        <VStack
          alignItems={"stretch"}
          gap={4}
          padding={5}
          borderWidth={"1px"}
          borderRadius={"md"}
        >
          <Text>You have not joined any household group yet.</Text>

          <Button asChild>
            <Link to={"/householdgroup/create"}>Create Household Group</Link>
          </Button>
        </VStack>
      )}

      <Grid
        templateColumns={"repeat(auto-fill, 240px)"}
        justifyContent={"center"}
        gap={5}
      >
        {householdGroups.map((householdGroup) => (
          <Button
            type={"button"}
            key={householdGroup.id}
            width={"240px"}
            height={"215px"}
            padding={5}
            borderWidth={"2px"}
            borderRadius={"lg"}
            borderColor={
              selectedHouseholdGroup?.id === householdGroup.id
                ? "blue.500"
                : "gray.200"
            }
            backgroundColor={
              selectedHouseholdGroup?.id === householdGroup.id
                ? "blue.50"
                : "white"
            }
            color={"black"}
            whiteSpace={"normal"}
            textAlign={"left"}
            cursor={"pointer"}
            overflow={"hidden"}
            _hover={{
              borderColor: "blue.400",
              transform: "translateY(-2px)",
              boxShadow: "md",
            }}
            onClick={() => {
              loadChoreCards(householdGroup);
            }}
          >
            <VStack
              width={"100%"}
              height={"200px"}
              alignItems={"stretch"}
              gap={1}
            >
              <Text fontWeight={"bold"} fontSize={"lg"}>
                {householdGroup.title}
              </Text>

              <Text fontSize={"sm"}>Group ID: {householdGroup.id}</Text>

              <Text fontSize={"sm"}>
                Owner: {householdGroup.owner_username || "No owner"}
              </Text>

              <Text fontSize={"sm"} flex={1} overflow={"hidden"}>
                {householdGroup.description || "No description"}
              </Text>
            </VStack>
          </Button>
        ))}
      </Grid>

      {selectedHouseholdGroup !== null && (
        <VStack alignItems={"stretch"} gap={5}>
          <VStack
            alignItems={"start"}
            gap={2}
            padding={5}
            borderWidth={"1px"}
            borderRadius={"1g"}
            backgroundColor={"gray.50"}
          >
            <Heading size={"md"}>Group Details</Heading>

            <Text fontSize={"sm"}>Group ID: {selectedHouseholdGroup.id}</Text>

            <Text fontSize={"sm"}>
              Group Title: {selectedHouseholdGroup.title}
            </Text>

            <Text fontSize={"sm"}>
              Group Owner: {selectedHouseholdGroup.owner_username}
            </Text>

            <Text fontSize={"sm"}>
              Description:{" "}
              {selectedHouseholdGroup.description || "No description"}
            </Text>

            <Text fontSize={"sm"} wordBreak={"break-all"}>
              Invitation code: {selectedHouseholdGroup.invite_code}
            </Text>

            <Text fontSize={"sm"}>
              Created at: {selectedHouseholdGroup.created_at}
            </Text>

            <Text fontSize={"sm"}>
              Updated at: {selectedHouseholdGroup.updated_at}
            </Text>
          </VStack>

          <Heading size={"lg"} textAlign={"center"}>
            {selectedHouseholdGroup.title} Chore Cards
          </Heading>

          {selectedHouseholdGroup.is_owner && (
            <Button asChild alignSelf={"center"}>
              <Link
                to={`/chorecards/create?householdgroup=${selectedHouseholdGroup.id}`}
              >
                Create Chore Card
              </Link>
            </Button>
          )}

          {isLoadingChoreCards && (
            <Text textAlign={"center"}>Loading chore cards...</Text>
          )}

          {!isLoadingChoreCards && choreCards.length === 0 && (
            <Text textAlign={"center"}>
              This household group has no chore cards yet.
            </Text>
          )}

          <Grid
            templateColumns={"repeat(auto-fill, 260px)"}
            justifyContent={"center"}
            gap={5}
          >
            {choreCards.map((choreCard) => (
              <Button
                type={"button"}
                key={choreCard.id}
                width={"260px"}
                height={"190px"}
                padding={5}
                variant={"outline"}
                backgroundColor={"white"}
                color={"black"}
                whiteSpace={"normal"}
                textAlign={"left"}
                _hover={{
                  borderColor: "blue.400",
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
                onClick={() => {
                  openChoreCardDetail(choreCard.id);
                }}
              >
                <VStack
                  width={"100%"}
                  height={"100%"}
                  alignItems={"stretch"}
                  gap={2}
                >
                  <Text fontWeight={"bold"} fontSize={"lg"}>
                    {choreCard.title}
                  </Text>

                  <Text fontSize={"sm"}>
                    Assignee:{" "}
                    {choreCard.assignee_usernames.join(", ") || "No assignee"}
                  </Text>

                  <Text fontSize={"sm"}>
                    Deadline: {choreCard.due_date || "No due date"}
                  </Text>

                  <Text fontSize={"sm"}>
                    Difficulty: {choreCard.difficulty_weight}
                  </Text>
                </VStack>
              </Button>
            ))}
          </Grid>
        </VStack>
      )}

      <Text color={"red.500"} textAlign={"center"}>
        {errorMessage}
      </Text>

      <Text color={"green.500"} textAlign={"center"}>
        {successMessage}
      </Text>

      <Dialog.Root /* Daialog 전체 관리, 이 내부에서 작성되어야 하나의 Dialog로 작동함 */
        open={isDetailOpen}
        size={"lg"}
        onOpenChange={(details) => {
          if (!details.open) {
            closeChoreCardDetail();
          }
        }}
      >
        <Portal>
          {/* 화면에 출력할 때 html상 위치를 body 바로 아래 자식 element로 배치된다 */}
          <Dialog.Backdrop />{" "}
          {/* Daialog 열릴때 뒷배경(반투명 검정으로) 바꾸는 기능 */}
          <Dialog.Positioner padding={4}>
            {" "}
            {/* 팝업 위치 지정 */}
            <Dialog.Content maxHeight={"85vh"} overflowY={"auto"}>
              {" "}
              {/* 실제 네모 팝업상자 설정 */}
              <Dialog.Header>
                <Dialog.Title>Chore Card Detail</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {isLoadingDetail && <Text>Loading detail...</Text>}

                {isEditingChoreCard && (
                  <VStack
                    alignItems={"stretch"}
                    gap={3}
                    padding={4}
                    borderWidth={"1px"}
                    borderRadius={"md"}
                  >
                    <Heading size={"sm"}>Edit Chore Card</Heading>

                    <Input
                      value={editTitle}
                      maxLength={40}
                      placeholder={"Chore title"}
                      onChange={(event) => {
                        setEditTitle(event.target.value);
                      }}
                    />

                    <Textarea
                      value={editChecklist}
                      placeholder={"Checklist"}
                      onChange={(event) => {
                        setEditChecklist(event.target.value);
                      }}
                    />

                    <Input
                      type={"number"}
                      min={1}
                      max={10}
                      step={1}
                      value={editDifficultyWeight}
                      placeholder={"Difficulty: 1 to 10"}
                      onChange={(event) => {
                        setEditDifficultyWeight(event.target.value);
                      }}
                    />

                    <Input
                      type={"date"}
                      value={editDueDate}
                      onChange={(event) => {
                        setEditDueDate(event.target.value);
                      }}
                    />

                    <Input
                      value={editAssigneeIds}
                      placeholder={"Assignee Member IDs, for example: 2, 3"}
                      onChange={(event) => {
                        setEditAssigneeIds(event.target.value);
                      }}
                    />
                  </VStack>
                )}

                {!isLoadingDetail && selectedChoreCard !== null && (
                  <VStack alignItems={"stretch"} gap={3}>
                    <Heading size={"md"}>{selectedChoreCard.title}</Heading>

                    <Text>Chore card ID: {selectedChoreCard.id}</Text>

                    <Text>
                      Household group ID: {selectedChoreCard.householdgroup}
                    </Text>

                    <Text whiteSpace={"pre-wrap"}>
                      Checklist: {selectedChoreCard.checklist}
                    </Text>

                    <Text>
                      Assignee:{" "}
                      {selectedChoreCard.assignee_usernames.join(", ") ||
                        "No assignee"}
                    </Text>

                    <Text>
                      Deadline: {selectedChoreCard.due_date || "No due date"}
                    </Text>

                    <Text>
                      Difficulty: {selectedChoreCard.difficulty_weight}
                    </Text>

                    <Text>Status: {selectedChoreCard.status}</Text>

                    <Text>
                      Completed at:{" "}
                      {selectedChoreCard.completed_at || "Not completed"}
                    </Text>

                    <Text>
                      Created at:{" "}
                      {new Date(selectedChoreCard.created_at).toLocaleString()}
                    </Text>

                    <Text>
                      Updated at:{" "}
                      {new Date(selectedChoreCard.updated_at).toLocaleString()}
                    </Text>

                    <Heading size={"sm"} marginTop={4}>
                      Comments
                    </Heading>

                    {comments.length === 0 && (
                      <Text color={"gray.500"}>No comments yet.</Text>
                    )}

                    {comments.map((comment) => (
                      <VStack
                        key={comment.id}
                        alignItems={"stretch"}
                        gap={1}
                        padding={3}
                        borderWidth={"1px"}
                        borderRadius={"md"}
                      >
                        <Text fontWeight={"bold"}>
                          {comment.writer_username}
                        </Text>

                        <Text whiteSpace={"pre-wrap"}>{comment.payload}</Text>

                        <Text fontSize={"xs"} color={"gray.500"}>
                          {new Date(comment.created_at).toLocaleString()}
                        </Text>
                      </VStack>
                    ))}

                    <form onSubmit={createComment}>
                      <VStack alignItems={"stretch"} gap={2}>
                        <Textarea
                          value={commentPayload}
                          placeholder={"Write a comment"}
                          onChange={(event) => {
                            setCommentPayload(event.target.value);
                          }}
                        />

                        <Button
                          type={"submit"}
                          alignSelf={"flex-end"}
                          disabled={isPostingComment}
                        >
                          {isPostingComment ? "Posting..." : "Post Comment"}
                        </Button>
                      </VStack>
                    </form>
                  </VStack>
                )}

                <Text color={"red.500"} marginTop={3}>
                  {detailErrorMessage}
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                {selectedHouseholdGroup?.is_owner &&
                  selectedChoreCard !== null && (
                    <HStack>
                      {isEditingChoreCard ? (
                        <>
                          <Button
                            type={"button"}
                            disabled={isSavingChoreCard}
                            onClick={updateChoreCard}
                          >
                            {isSavingChoreCard ? "Saving..." : "Save Changes"}
                          </Button>

                          <Button
                            type={"button"}
                            variant={"outline"}
                            disabled={isSavingChoreCard}
                            onClick={cancelEditingChoreCard}
                          >
                            Cancel Edit
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type={"button"}
                            onClick={startEditingChoreCard}
                          >
                            Edit
                          </Button>

                          <Button
                            type={"button"}
                            colorPalette={"red"}
                            disabled={isDeletingChoreCard}
                            onClick={deleteChoreCard}
                          >
                            {isDeletingChoreCard ? "Deleting..." : "Delete"}
                          </Button>
                        </>
                      )}
                    </HStack>
                  )}

                <Button
                  type={"button"}
                  variant={"outline"}
                  onClick={closeChoreCardDetail}
                >
                  Close
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}

export default MyHouseholdGroups;
