import { Button, Heading, HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
export type LoggedInUser = {
  id: number;
  username: string;
  email: string;
};

function getCsrfToken() {
  /*
   * document.cookie 예:
   *
   * "sessionid=abc123; csrftoken=xyz789"
   *
   * ";"를 기준으로 나누면:
   *
   * [
   *   "sessionid=abc123",
   *   " csrftoken=xyz789"
   * ]
   */
  const cookies = document.cookie.split(";");

  /*
   * csrftoken=으로 시작하는 쿠키 하나를 찾습니다.
   */
  const csrfCookie = cookies.find((cookie) => {
    return cookie.trim().startsWith("csrftoken=");
  });

  /*
   * CSRF 쿠키를 찾지 못했다면 빈 문자열을 반환합니다.
   */
  if (!csrfCookie) {
    return "";
  }

  /*
   * "csrftoken=xyz789"에서 "=" 뒤의 "xyz789"만 반환합니다.
   */
  return decodeURIComponent(csrfCookie.split("=")[1]);
}

function Header({
  loggedInUser,
  onLogoutSuccess,
}: {
  /*
   * App.tsx에서 전달받은 현재 사용자입니다.
   *
   * null이면 로그아웃 상태입니다.
   */
  loggedInUser: LoggedInUser | null;

  /*
   * 로그아웃에 성공했을 때 App.tsx의
   * loggedInUser State를 null로 바꾸는 함수입니다.
   */
  onLogoutSuccess: () => void;
}) {
  /*
   * 로그아웃 실패 메시지만 보관합니다.
   *
   * 예:
   * "CSRF Failed"
   * "Can not connect to the server."
   */
  const [logoutErrorMessage, setLogoutErrorMessage] = useState("");

  /*
   * 로그아웃 성공 후 Home 화면으로 이동할 때 사용합니다.
   */
  const navigate = useNavigate();

  /*
   * Logout 버튼을 눌렀을 때 실행되는 함수입니다.
   */
  async function logoutUser() {
    /*
     * 이전 로그아웃 오류 메시지를 제거합니다.
     */
    setLogoutErrorMessage("");

    try {
      const response = await fetch(
        "https://nci-project-backend.onrender.com/api/v1/users/logout/",
        {
          method: "POST",

          /*
           * 로그인된 사용자의 POST 요청이므로
           * CSRF 토큰을 헤더에 넣습니다.
           */
          headers: {
            "X-CSRFToken": getCsrfToken(),
          },

          /*
           * 어떤 세션을 로그아웃할 것인지 알려주기 위해
           * sessionid 쿠키를 백엔드에 보냅니다.
           */
          credentials: "include",
        },
      );

      if (response.ok) {
        /*
         * 백엔드에서 Django 세션 삭제가 성공한 다음에만
         * App.tsx의 사용자 정보를 null로 변경합니다.
         */
        onLogoutSuccess();

        /*
         * 로그아웃 후 Home 화면으로 이동합니다.
         */
        navigate("/");
        return;
      }

      /*
       * 백엔드가 400, 403 등의 오류를 반환한 경우입니다.
       */
      const responseData = await response.json();
      setLogoutErrorMessage(JSON.stringify(responseData));
    } catch (error) {
      /*
       * 서버가 꺼져 있거나 연결할 수 없는 경우입니다.
       */
      console.log(error);
      setLogoutErrorMessage("Can not connect to the server.");
    }
  }
  return (
    <HStack
      justifyContent={"space-between"}
      padding={5}
      borderBottomWidth={"4px"}
    >
      <Heading>HCDS</Heading>
      <HStack>
        <HStack>
          <Button asChild>
            {/* asChild: Allows the Button to adopt the behavior of its child element */}
            <Link to={"/"}>Home</Link>
          </Button>

          {loggedInUser === null ? (
            <Button asChild>
              <Link to={"/login"}>Login</Link>
            </Button>
          ) : (
            <Button onClick={logoutUser}>Logout</Button>
          )}

          {/* 이미 로그인한 사용자에게는 Sign Up 버튼이 필요 없으므로 숨깁니다 */}
          {loggedInUser === null && (
            <Button asChild>
              <Link to={"/signup"}>Sign Up</Link>
            </Button>
          )}
          {logoutErrorMessage !== "" && (
            <Text color={"red"}>{logoutErrorMessage}</Text>
          )}

          <Button asChild>
            <Link to="/householdgroups/join">Join Group</Link>
          </Button>

          <Button asChild>
            <Link to="/householdgroups/members">Group members</Link>
          </Button>
        </HStack>
      </HStack>
    </HStack>
  );
}

export default Header;
