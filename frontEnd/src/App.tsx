import { Link, Route, Routes } from "react-router";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Header, { type LoggedInUser } from "./components/Header";
import CreateHouseholdGroup from "./pages/CreateHouseholdGroup";
import JoinHouseholdGroup from "./pages/JoinHouseholdGroup";
import HouseholdGroupMembers from "./pages/HouseholdGroupMembers";
import ChoreCards from "./pages/ChoreCards";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import MyHouseholdGroups from "./pages/MyHouseholdGroup";
import CreateChoreCard from "./pages/CreateChoreCard";

function App() {
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);

  async function loadLoggedInUser(): Promise<boolean> {
    try {
      const response = await fetch(
        "https://nci-project-backend.onrender.com/api/v1/users/me/",
        {
          /*
           * 브라우저가 가지고 있는 sessionid 쿠키를
           * 백엔드 요청에 포함시킵니다.
           */
          credentials: "include",
        },
      );

      /*
       * /users/me/ 요청이 실패했다는 것은
       * 현재 로그인 사용자를 확인할 수 없다는 뜻입니다.
       */
      if (!response.ok) {
        setLoggedInUser(null);
        return false;
      }

      /*
       * 백엔드가 보낸 JSON을 JavaScript 객체로 변환합니다.
       *
       * 예:
       * {
       *   "id": 1,
       *   "username": "user1",
       *   "email": "user1@test.com"
       * }
       */
      const responseData = await response.json();

      /*
       * 백엔드에서 받은 실제 사용자 정보를
       * App.tsx의 State에 저장합니다.
       *
       * 이 State가 변경되면 React가 Header를 다시 표시합니다.
       */
      setLoggedInUser({
        id: responseData.id,
        username: responseData.username,
        email: responseData.email,
      });

      return true;
    } catch (error) {
      /*
       * Django 서버가 꺼져 있거나 네트워크 연결에 실패한 경우입니다.
       */
      console.log(error);
      setLoggedInUser(null);
      return false;
    }
  }

  /*
   * []가 있으므로 App이 처음 실행될 때 한 번 호출됩니다.
   *
   * React State는 새로고침하면 사라지지만,
   * Django의 sessionid 쿠키는 브라우저에 남아 있습니다.
   *
   * 따라서 새로고침 후 /users/me/를 호출하여
   * State를 다시 복구해야 합니다.
   */
  useEffect(() => {
    loadLoggedInUser();
  }, []);
  /* 화면 랜더링 이후 함수 실행, 두 번째(useState등으로 변경이 되어 다시 랜더링하면 이 함수도 다시 실행) */
  /* 두 번째 매개변수는 dependencies로 매개변수의 현재의 값과 loadLoggedInUser() 실행 후의 값이 다를경우 loadLoggedInUser() 다시 실행 */
  /* 두 번째에 비어있는 list가 있으면 최초 비교 후 멈춤, 인자가 없으면 랜더링 될 때마다 loadLoggedInUser() 실행 */

  return (
    <VStack alignItems={"stretch"} gap={0} minHeight={"100vh"}>
      <Header
        loggedInUser={loggedInUser}
        onLogoutSuccess={() => {
          setLoggedInUser(null);
        }}
      />
      {/* To show this component on the all pages */}

      {/* ★ 추가: Header 아래를 좌우 공간으로 분리 */}
      <HStack alignItems={"stretch"} gap={0} flex={1}>
        {/*
         * ★ 추가: 왼쪽 사용자 정보 공간
         *
         * loggedInUser가 null이 아닐 때,
         * 즉 로그인 상태일 때만 표시됩니다.
         */}
        {loggedInUser !== null && (
          <VStack
            as={"aside"}
            width={"260px"}
            flexShrink={0}
            alignItems={"stretch"}
            gap={4}
            padding={5}
            borderRightWidth={"1px"}
            backgroundColor={"gray.50"}
          >
            <Text fontWeight={"bold"}>Logged-in User</Text>

            <Text>User ID: {loggedInUser.id}</Text>

            <Text>Username: {loggedInUser.username}</Text>

            <Text>Email: {loggedInUser.email}</Text>

            {/*
             * ★ 추가: 클릭하면 주소를
             * /householdgroups로 변경합니다.
             */}
            <Button asChild width={"100%"}>
              <Link to={"/householdgroups"}>My Groups</Link>
            </Button>
          </VStack>
        )}
        <Box flex={1} minWidth={0}>
          <Routes>
            {/* Check the current URL against each Route below. */}
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={<Login loadLoggedInUser={loadLoggedInUser} />}
            />
            {/* Login 컴포넌트에 loadLoggedInUser라는 이름으로 prop을 전달합니다(함수) */}
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/householdgroup/create"
              element={<CreateHouseholdGroup />}
            />
            <Route
              path="/householdgroups/join"
              element={<JoinHouseholdGroup />}
            />
            <Route
              path="/householdgroups/members"
              element={<HouseholdGroupMembers />}
            />
            <Route
              path="/householdgroups/chorecards"
              element={<ChoreCards />}
            />
            <Route path="/householdgroups" element={<MyHouseholdGroups />} />

            <Route path="/chorecards/create" element={<CreateChoreCard />} />

            {/* Show the component whose path matches the current URL. */}
          </Routes>
        </Box>
      </HStack>
    </VStack>
  );
}

export default App;
