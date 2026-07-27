import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";
import CreateHouseholdGroup from "./pages/CreateHouseholdGroup";
import JoinHouseholdGroup from "./pages/JoinHouseholdGroup";

function App() {
  return (
    <div>
      <Header />
      {/* To show this component on the all pages */}

      <Routes>
        {/* Check the current URL against each Route below. */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/householdgroup/create"
          element={<CreateHouseholdGroup />}
        />
        <Route path="/householdgroups/join" element={<JoinHouseholdGroup />} />

        {/* Show the component whose path matches the current URL. */}
      </Routes>
    </div>
  );
}

export default App;
