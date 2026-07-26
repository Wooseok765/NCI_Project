import { Button, Heading, HStack } from "@chakra-ui/react";
import { Link } from "react-router";

function Header() {
  return (
    <HStack
      justifyContent={"space-between"}
      padding={5}
      borderBottomWidth={"4px"}
    >
      <Heading>HCDS</Heading>
      <HStack>
        <Button asChild>
          {/* asChild: Allows the Button to adopt the behavior of its child element */}
          <Link to={"/"}>Home</Link>
        </Button>

        <Button asChild>
          <Link to={"/login"}>Login</Link>
        </Button>

        <Button asChild>
          <Link to={"/signup"}>Sign Up</Link>
        </Button>
      </HStack>
    </HStack>
  );
}

export default Header;
